'use client';
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// Mock data fallback in case DB is not available
const MOCK_CITAS = [
  {
    id: 1,
    estudiante_id: "demo-user",
    fecha: "2026-05-27T10:00:00.000Z",
    estado: "pendiente",
    notas: "Test CAT completado. Cita de seguimiento."
  },
  {
    id: 2,
    estudiante_id: "demo-user",
    fecha: "2026-06-05T15:30:00.000Z",
    estado: "confirmada",
    notas: "Evaluación de progreso mensual."
  }
];

export default function MisCitasPage() {
  const [loading, setLoading] = useState(true);
  const [citas, setCitas] = useState<any[]>([]);

  useEffect(() => {
    async function loadCitas() {
      try {
        const userId = localStorage.getItem('demo_user_id') || 'demo-user';

        const { data, error } = await supabase
          .from('citas')
          .select('*')
          .eq('estudiante_id', userId)
          .order('fecha', { ascending: true });

        if (error || !data || data.length === 0) throw new Error('DB error or empty');
        setCitas(data);
      } catch (err) {
        console.warn('Usando datos de prueba para citas:', err);
        // Fallback to mock data for demonstration
        setCitas(MOCK_CITAS);
      } finally {
        setLoading(false);
      }
    }
    loadCitas();
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-2">Mis Citas Programadas</h1>
        <p className="text-sm text-gray-400">
          Consulta y gestiona tus citas con el área de Bienestar Estudiantil.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        </div>
      ) : citas.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/5">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-200 mb-2">No tienes citas programadas</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Actualmente no hay ninguna cita agendada con un psicólogo de la Universidad. 
            Si lo necesitas, puedes solicitar una desde la oficina de Bienestar Estudiantil.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {citas.map(cita => (
            <div key={cita.id} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-indigo-500/20 transition-all">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                    cita.estado === 'pendiente' ? 'bg-amber-500/20 text-amber-400' :
                    cita.estado === 'confirmada' ? 'bg-indigo-500/20 text-indigo-400' :
                    cita.estado === 'realizada' ? 'bg-emerald-500/20 text-emerald-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {cita.estado}
                  </span>
                  <span className="text-sm font-semibold text-gray-300">
                    {new Date(cita.fecha).toLocaleDateString('es-PE', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  Cita Psicológica
                </h3>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Psicólogo de Bienestar Estudiantil
                </p>
                {cita.notas && (
                  <p className="text-xs text-gray-500 mt-3 border-l-2 border-indigo-500/30 pl-3 italic">
                    &ldquo;{cita.notas}&rdquo;
                  </p>
                )}
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 hover:bg-white/5 transition-colors cursor-pointer text-gray-300">
                  Reprogramar
                </button>
                <button className="flex-1 md:flex-none px-4 py-2 rounded-xl text-sm font-semibold border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer">
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
