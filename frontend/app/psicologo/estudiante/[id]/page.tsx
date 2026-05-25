// Page: Psicólogo Student Profile File (app/psicologo/estudiante/[id]/page.tsx)
'use client';
import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import ShapChart from '@/components/ShapChart';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PsicologoEstudianteDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params); // Unwrap params with React.use()
  
  const [mounted, setMounted] = useState(false);
  const [estudiante, setEstudiante] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Appointment form state
  const [fechaCita, setFechaCita] = useState('');
  const [notasCita, setNotasCita] = useState('');
  const [citaSuccess, setCitaSuccess] = useState(false);
  const [submittingCita, setSubmittingCita] = useState(false);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('demo_role');
    if (role !== 'psicologo' && role !== 'admin') {
      router.push('/auth');
      return;
    }

    async function loadDetail() {
      try {
        const res = await fetch(`/api/psicologo/estudiantes?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setEstudiante(data);
        }
      } catch (err) {
        console.error('Failed to load student clinical detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id, router]);

  const handleBookCita = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaCita) return;

    setSubmittingCita(true);
    try {
      const res = await fetch('/api/psicologo/citas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estudiante_id: id,
          fecha: new Date(fechaCita).toISOString(),
          notas: notasCita || 'Cita clínica de bienestar estudiantil agendada por el psicólogo.'
        })
      });

      if (res.ok) {
        setCitaSuccess(true);
        setFechaCita('');
        setNotasCita('');
      }
    } catch (err) {
      console.error('Failed to book appointment:', err);
    } finally {
      setSubmittingCita(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin" />
        <p className="text-sm text-gray-500">Cargando expediente clínico del estudiante...</p>
      </div>
    );
  }

  if (!estudiante) {
    return (
      <div className="glass-panel p-8 text-center text-rose-400 font-bold py-16">
        Estudiante no encontrado o expediente inexistente.
      </div>
    );
  }

  // Draw Evolution Chart Coordinates
  // We have student.historial: e.g. [{ fecha: "2026-03-10", ansiedad: 0.65, depresion: 0.50 }]
  const hasHistory = estudiante.historial && estudiante.historial.length > 0;

  // Render SVG Evolution line chart
  const renderEvolutionChart = () => {
    if (!hasHistory) return null;
    
    const w = 500;
    const h = 200;
    const padding = 30;
    const chartW = w - 2 * padding;
    const chartH = h - 2 * padding;
    
    const ptsAns: string[] = [];
    const ptsDep: string[] = [];
    
    estudiante.historial.forEach((pt: any, idx: number) => {
      const x = padding + (idx / Math.max(estudiante.historial.length - 1, 1)) * chartW;
      // y-axis is inverted in SVG, 1.0 probability is top (padding), 0.0 is bottom (h - padding)
      const yAns = h - padding - pt.ansiedad * chartH;
      const yDep = h - padding - pt.depresion * chartH;
      
      ptsAns.push(`${x},${yAns}`);
      ptsDep.push(`${x},${yDep}`);
    });

    return (
      <div className="w-full relative">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full overflow-visible">
          {/* Horizontal Grid lines */}
          <line x1={padding} y1={padding} x2={w - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3" />
          <line x1={padding} y1={padding + chartH / 2} x2={w - padding} y2={padding + chartH / 2} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3" />
          <line x1={padding} y1={h - padding} x2={w - padding} y2={h - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Grid Labels */}
          <text x={padding - 8} y={padding + 4} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" className="font-mono">100%</text>
          <text x={padding - 8} y={padding + chartH / 2 + 4} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" className="font-mono">50%</text>
          <text x={padding - 8} y={h - padding + 4} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="end" className="font-mono">0%</text>

          {/* Plots */}
          {/* Anxiety Path */}
          <path
            d={`M ${ptsAns.join(' L ')}`}
            fill="none"
            className="stroke-indigo-400"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.4))' }}
          />

          {/* Depression Path */}
          <path
            d={`M ${ptsDep.join(' L ')}`}
            fill="none"
            className="stroke-teal-400"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 4px rgba(20, 184, 166, 0.4))' }}
          />

          {/* Interactive points & Date Labels */}
          {estudiante.historial.map((pt: any, idx: number) => {
            const x = padding + (idx / Math.max(estudiante.historial.length - 1, 1)) * chartW;
            const yAns = h - padding - pt.ansiedad * chartH;
            const yDep = h - padding - pt.depresion * chartH;

            return (
              <g key={idx} className="group">
                {/* Anxiety dot */}
                <circle cx={x} cy={yAns} r="4" className="fill-indigo-400 stroke-[#030712] stroke-2 hover:r-6 transition-all" />
                {/* Depression dot */}
                <circle cx={x} cy={yDep} r="4" className="fill-teal-400 stroke-[#030712] stroke-2 hover:r-6 transition-all" />
                
                {/* Date text bottom */}
                <text x={x} y={h - padding + 15} fill="rgba(255,255,255,0.4)" fontSize="7" textAnchor="middle" className="font-mono">
                  {pt.fecha}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex-grow flex flex-col justify-start py-6 gap-8 relative">
      <div className="glow-overlay-teal opacity-25" />
      
      {/* Title */}
      <section className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/psicologo/estudiantes')}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            ←
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase">
              Expediente Clínico: {estudiante.nombre} {estudiante.apellido}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Monitoreo longitudinal de riesgo y explicaciones atributivas SHAP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${
            estudiante.riesgo === 'Alto' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            Alerta: {estudiante.riesgo}
          </span>
        </div>
      </section>

      {/* Profile Metrics and Evolution Chart */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Student Profile Card */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-4">
          <h3 className="text-sm font-mono font-bold text-gray-500 uppercase">Información Estudiantil</h3>
          
          <div className="space-y-3.5">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Correo Institucional</p>
              <p className="text-xs text-gray-300 font-semibold mt-0.5">{estudiante.email}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Facultad</p>
              <p className="text-xs text-gray-300 font-semibold mt-0.5">{estudiante.facultad}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Carrera Profesional</p>
              <p className="text-xs text-gray-300 font-semibold mt-0.5">{estudiante.carrera}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Edad</p>
              <p className="text-xs text-gray-300 font-semibold mt-0.5">{estudiante.edad} años</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Último Tamizaje</p>
              <p className="text-xs text-gray-300 font-semibold mt-0.5">
                {estudiante.ultimo_test 
                  ? new Date(estudiante.ultimo_test).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
                  : 'Sin pruebas completadas'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Evolution Chart Card */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-mono font-bold text-gray-500 uppercase">Evolución Psicométrica Longitudinal</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Tendencia temporal del rasgo latente estimado por el motor CAT</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Ansiedad
              </span>
              <span className="flex items-center gap-1 text-teal-400">
                <span className="w-2 h-2 rounded-full bg-teal-500" /> Depresión
              </span>
            </div>
          </div>

          {hasHistory ? (
            <div className="py-4">{renderEvolutionChart()}</div>
          ) : (
            <div className="flex items-center justify-center h-40 text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">
              Historial de tamizaje no disponible.
            </div>
          )}
        </div>
      </section>

      {/* SHAP attributions and Schedule Appointment */}
      <section className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SHAP Chart (Takes 2 Columns) */}
        <div className="lg:col-span-2">
          <ShapChart shapValues={estudiante.shap} />
        </div>

        {/* Schedule Counseling Card (Takes 1 Column) */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-start">
          <h3 className="text-sm font-mono font-bold text-gray-500 uppercase mb-4">Programar Cita Clínica</h3>
          
          {citaSuccess ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center text-emerald-300 text-xs flex-grow flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-emerald-400 mb-2 animate-bounce">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              <p className="font-bold">¡Cita Agendada Exitosamente!</p>
              <p className="text-[10px] text-emerald-400/80 mt-1">Registrado en la agenda de Bienestar Estudiantil.</p>
              <button
                onClick={() => setCitaSuccess(false)}
                className="mt-4 text-[10px] font-bold text-gray-400 hover:text-white transition-colors"
              >
                Agendar otra cita
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookCita} className="space-y-4 flex-grow flex flex-col justify-between">
              <div className="space-y-3.5">
                <div>
                  <label htmlFor="fecha" className="block text-[10px] font-semibold text-gray-400 mb-1.5">
                    Fecha y Hora de la Sesión
                  </label>
                  <input
                    type="datetime-local"
                    id="fecha"
                    required
                    value={fechaCita}
                    onChange={(e) => setFechaCita(e.target.value)}
                    className="w-full bg-gray-900 border border-white/5 focus:border-teal-500/40 rounded-xl py-2 px-3 text-xs text-gray-300 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="notas" className="block text-[10px] font-semibold text-gray-400 mb-1.5">
                    Notas Clínicas Preliminares
                  </label>
                  <textarea
                    id="notas"
                    value={notasCita}
                    onChange={(e) => setNotasCita(e.target.value)}
                    placeholder="Ingrese recomendaciones preventivas o temas a tratar en la sesión inicial..."
                    rows={4}
                    className="w-full bg-gray-900 border border-white/5 focus:border-teal-500/40 rounded-xl py-2.5 px-3 text-xs text-gray-300 outline-none transition-all placeholder:text-gray-700"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingCita || !fechaCita}
                className="w-full mt-4 py-3 bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-teal-500/10 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
              >
                {submittingCita ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                ) : (
                  "Agendar y Confirmar Cita"
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
