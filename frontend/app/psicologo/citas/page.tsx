// Page: Psicólogo Appointments (app/psicologo/citas/page.tsx)
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PsicologoCitasPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pendiente' | 'confirmada' | 'realizada' | 'todos'>('todos');
  
  // Selected appointment for notes and updates
  const [selectedCita, setSelectedCita] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('demo_role');
    if (role !== 'psicologo' && role !== 'admin') {
      router.push('/auth');
      return;
    }

    fetchCitas();
  }, [router]);

  const fetchCitas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/psicologo/citas');
      if (res.ok) {
        const data = await res.json();
        setCitas(data);
      }
    } catch (err) {
      console.error('Failed to load citas list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string, finalNotes?: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/psicologo/citas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          estado: newStatus,
          notas: finalNotes !== undefined ? finalNotes : notes
        })
      });

      if (res.ok) {
        // Refresh list
        await fetchCitas();
        setSelectedCita(null);
        setNotes('');
      }
    } catch (err) {
      console.error('Failed to update appointment status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!mounted) return null;

  // Filtered appointments
  const filteredCitas = citas.filter(c => {
    if (activeTab === 'todos') return true;
    return c.estado === activeTab;
  });

  return (
    <div className="flex-grow flex flex-col justify-start py-6 gap-8 relative">
      <div className="glow-overlay-teal opacity-20" />
      
      {/* Title */}
      <section className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide uppercase">
            Gestión de Citas y Derivaciones
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Gestión del flujo de apoyo e intervenciones de Bienestar Estudiantil.
          </p>
        </div>
        
        <a
          href="/psicologo/dashboard"
          className="text-xs font-bold text-gray-400 hover:text-white transition-colors bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 px-4 py-2 rounded-xl cursor-pointer w-fit"
        >
          Regresar a Inicio
        </a>
      </section>

      {/* Main Content Layout */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Appointments List (Takes 2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Tab Filter bar */}
          <div className="glass-panel p-2 rounded-2xl border border-white/5 flex gap-2">
            {(['todos', 'pendiente', 'confirmada', 'realizada'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSelectedCita(null);
                }}
                className={`flex-grow py-2 px-3 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-teal-500/10 border border-teal-500/20 text-teal-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/3'
                }`}
              >
                {tab === 'todos' ? 'Ver Todas' : tab}
              </button>
            ))}
          </div>

          {/* Citas Stack */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 glass-panel rounded-2xl">
              <div className="w-6 h-6 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" />
              <p className="text-xs text-gray-500">Sincronizando agenda clínica...</p>
            </div>
          ) : filteredCitas.length === 0 ? (
            <div className="glass-panel p-8 text-center text-gray-500 text-xs py-16 rounded-2xl">
              No hay citas registradas en esta categoría.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCitas.map((cita) => {
                let statusBadge = 'Pendiente';
                let statusClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';

                if (cita.estado === 'confirmada') {
                  statusBadge = 'Confirmada';
                  statusClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                } else if (cita.estado === 'realizada') {
                  statusBadge = 'Realizada';
                  statusClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                } else if (cita.estado === 'cancelada') {
                  statusBadge = 'Cancelada';
                  statusClass = 'bg-gray-800 text-gray-500 border-white/5';
                }

                const isSelected = selectedCita?.id === cita.id;

                return (
                  <div
                    key={cita.id}
                    onClick={() => {
                      setSelectedCita(cita);
                      setNotes(cita.notas || '');
                    }}
                    className={`glass-panel p-5 rounded-2xl border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-teal-500/30 bg-teal-500/5 shadow-md shadow-teal-500/5' 
                        : 'border-white/5 hover:border-white/10 hover:bg-white/3'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-gray-200">
                          {cita.estudiante_nombre}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{cita.email}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${statusClass}`}>
                          {statusBadge}
                        </span>
                        
                        {cita.riesgo && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            cita.riesgo === 'Alto' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            Riesgo: {cita.riesgo}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-white/3 pt-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="text-teal-400 font-bold font-mono">📅 Horario:</span>
                        <span>
                          {new Date(cita.fecha).toLocaleString('es-ES', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>

                      {cita.notas && (
                        <div className="text-xs text-gray-400 leading-relaxed bg-black/15 p-2.5 rounded-lg border border-white/3">
                          <span className="text-[10px] font-mono font-bold text-gray-500 uppercase block mb-1">Notas Clínicas:</span>
                          {cita.notas}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Manager Panel (Takes 1 Column) */}
        <div className="lg:col-span-1">
          {selectedCita ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-teal-500/5 to-transparent blur-2xl rounded-full" />
              
              <h3 className="text-sm font-mono font-bold text-gray-500 uppercase">
                Administración de la Sesión
              </h3>

              <div className="space-y-1.5 pb-2 border-b border-white/5">
                <p className="text-sm font-bold text-gray-200">{selectedCita.estudiante_nombre}</p>
                <p className="text-[10px] text-gray-500 font-mono">{selectedCita.email}</p>
              </div>

              <div>
                <label htmlFor="clinical-notes" className="block text-[10px] font-semibold text-gray-400 mb-2">
                  Actualizar Notas Clínicas / Evolutivas
                </label>
                <textarea
                  id="clinical-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ingrese el reporte de la sesión, pautas dadas, o comentarios de seguimiento..."
                  rows={6}
                  className="w-full bg-gray-900 border border-white/5 focus:border-teal-500/40 rounded-xl py-2.5 px-3 text-xs text-gray-300 outline-none transition-all placeholder:text-gray-700"
                />
              </div>

              <div className="space-y-2 mt-4">
                {/* Pending to Confirmed */}
                {selectedCita.estado === 'pendiente' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedCita.id, 'confirmada')}
                    disabled={updatingId !== null}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer hover:scale-[1.01] flex items-center justify-center gap-2"
                  >
                    {updatingId === selectedCita.id ? 'Actualizando...' : 'Confirmar Cita (Agendar)'}
                  </button>
                )}

                {/* Confirmed to Completed */}
                {selectedCita.estado === 'confirmada' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedCita.id, 'realizada')}
                    disabled={updatingId !== null}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer hover:scale-[1.01] flex items-center justify-center gap-2"
                  >
                    {updatingId === selectedCita.id ? 'Completando...' : 'Completar Sesión (Marcar Realizada)'}
                  </button>
                )}

                {/* General Note Save */}
                <button
                  onClick={() => handleUpdateStatus(selectedCita.id, selectedCita.estado, notes)}
                  disabled={updatingId !== null}
                  className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center"
                >
                  Guardar Solo Notas
                </button>

                {/* Cancel option */}
                {selectedCita.estado !== 'realizada' && selectedCita.estado !== 'cancelada' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedCita.id, 'cancelada')}
                    disabled={updatingId !== null}
                    className="w-full py-2 bg-transparent hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 font-semibold text-[10px] rounded-xl transition-all cursor-pointer mt-1"
                  >
                    Cancelar Cita
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-panel p-6 rounded-2xl border border-white/5 text-center text-gray-500 text-xs py-16 flex items-center justify-center border-dashed">
              Seleccione una cita del listado para gestionar el estado de la sesión, actualizar derivaciones e ingresar notas de apoyo clínico.
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
