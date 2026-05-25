// Page: Administrador Dashboard (app/admin/dashboard/page.tsx)
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('demo_role');
    if (role !== 'admin') {
      router.push('/auth');
      return;
    }

    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load global admin statistics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [router]);

  if (!mounted || loading || !stats) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-purple-500/20 border-t-purple-400 animate-spin" />
        <p className="text-sm text-gray-500">Agregando métricas poblacionales globales...</p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col justify-start py-6 gap-8 relative">
      <div className="glow-overlay-indigo opacity-25" />
      
      {/* Title */}
      <section className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide uppercase">
            Panel de Control del Administrador
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Auditoría de prevalencia epidemiológica, ajuste de parámetros y gestión de usuarios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/admin/usuarios"
            className="text-xs font-bold text-gray-300 hover:text-white transition-colors bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 px-4 py-2.5 rounded-xl cursor-pointer"
          >
            Gestión de Usuarios
          </a>
          <a
            href="/admin/preguntas"
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 hover:bg-purple-500/15 border border-purple-500/20 px-4 py-2.5 rounded-xl cursor-pointer"
          >
            Banco de Preguntas IRT
          </a>
        </div>
      </section>

      {/* Hero Metrics Stack */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        
        {/* Metric 1: Total Tests */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">Total Tamizajes</span>
            <p className="text-3xl font-black text-white mt-1">{stats.total_tests}</p>
            <span className="text-[9px] text-gray-400 font-semibold mt-1 block">Sedes a nivel nacional</span>
          </div>
          <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-bold">📊</div>
        </div>

        {/* Metric 2: Active Alertas */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">Alertas Críticas</span>
            <p className="text-3xl font-black text-rose-500 mt-1">{stats.alertas_pendientes}</p>
            <span className="text-[9px] text-rose-400 font-semibold mt-1 block">Casos de alto riesgo</span>
          </div>
          <div className="w-11 h-11 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 font-bold">🚨</div>
        </div>

        {/* Metric 3: Max Prevalence College */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">Mayor Prevalencia</span>
            <p className="text-lg font-black text-amber-400 mt-2.5 truncate max-w-[150px]">
              Ciencias de la Salud
            </p>
            <span className="text-[9px] text-amber-400 font-semibold mt-1 block">Facultad bajo monitoreo</span>
          </div>
          <div className="w-11 h-11 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 font-bold">🎯</div>
        </div>

        {/* Metric 4: Consistency */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">Fiabilidad Global</span>
            <p className="text-3xl font-black text-teal-400 mt-1">94.8%</p>
            <span className="text-[9px] text-teal-400 font-semibold mt-1 block">Índice TAC de consistencia</span>
          </div>
          <div className="w-11 h-11 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 font-bold">🛡️</div>
        </div>

      </section>

      {/* Interactive Custom Visualizations Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        
        {/* Visual 1: Averages by Faculty Group (Grouped Horizontal bars) */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-200">Promedios de Gravedad por Facultad</h3>
            <p className="text-xs text-gray-400">Comparativa de puntajes latentes promedio de Ansiedad vs. Depresión por escuela</p>
          </div>

          <div className="space-y-5">
            {stats.promedios_facultad.map((fac: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-gray-300">{fac.name}</span>
                  <span className="text-gray-500 font-mono text-[10px]">({fac.total} tamizajes)</span>
                </div>
                
                <div className="space-y-1.5 bg-black/10 p-2.5 rounded-lg border border-white/2">
                  {/* Anxiety line */}
                  <div className="flex items-center gap-3">
                    <span className="w-10 text-[9px] font-mono font-bold text-indigo-400">ANS:</span>
                    <div className="flex-grow h-2 bg-gray-900 rounded-full overflow-hidden border border-white/2">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-md shadow-indigo-500/10 rounded-full transition-all duration-1000"
                        style={{ width: `${fac.ansiedad * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-[10px] font-mono font-bold text-gray-400 text-right">{Math.round(fac.ansiedad * 100)}%</span>
                  </div>

                  {/* Depression line */}
                  <div className="flex items-center gap-3">
                    <span className="w-10 text-[9px] font-mono font-bold text-teal-400">DEP:</span>
                    <div className="flex-grow h-2 bg-gray-900 rounded-full overflow-hidden border border-white/2">
                      <div 
                        className="h-full bg-gradient-to-r from-teal-600 to-teal-400 shadow-md shadow-teal-500/10 rounded-full transition-all duration-1000"
                        style={{ width: `${fac.depresion * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-[10px] font-mono font-bold text-gray-400 text-right">{Math.round(fac.depresion * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 text-[9px] font-bold text-gray-500 border-t border-white/5 pt-4 mt-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Ansiedad</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-500" /> Depresión</span>
          </div>
        </div>

        {/* Visual 2: Prevalencia por Grupo de Edad */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-base font-bold text-gray-200">Riesgo Psicométrico por Grupo Etario</h3>
            <p className="text-xs text-gray-400">Distribución de malestar latente según rangos de edad de la población evaluada</p>
          </div>

          <div className="space-y-5">
            {stats.promedios_edad.map((cohort: any, index: number) => {
              const maxVal = Math.max(cohort.ansiedad, cohort.depresion);
              let color = 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/10 text-emerald-400';
              if (maxVal >= 0.55) {
                color = 'from-rose-500/20 to-rose-500/5 border-rose-500/10 text-rose-400';
              } else if (maxVal >= 0.42) {
                color = 'from-amber-500/20 to-amber-500/5 border-amber-500/10 text-amber-400';
              }

              return (
                <div key={index} className={`bg-gradient-to-r ${color} p-4 rounded-xl border flex items-center justify-between`}>
                  <div>
                    <p className="text-xs font-bold text-gray-200">{cohort.name}</p>
                    <p className="text-[9px] text-gray-500 font-mono mt-0.5">({cohort.total} tests completados)</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 block uppercase">Ansiedad</span>
                      <span className="text-sm font-mono font-black text-gray-200">{Math.round(cohort.ansiedad * 100)}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 block uppercase">Depresión</span>
                      <span className="text-sm font-mono font-black text-gray-200">{Math.round(cohort.depresion * 100)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[9px] text-gray-500 border-t border-white/5 pt-4 mt-4 text-center">
            * Se observa una prevalencia superior de riesgo de ansiedad en los cohortes de ingreso inicial (17-18 años), justificado por la transición académica.
          </div>
        </div>

      </section>

      {/* Career Prevalence Ranking Table */}
      <section className="relative z-10 glass-panel p-6 rounded-2xl border border-white/5">
        <div className="mb-6 text-left">
          <h3 className="text-lg font-semibold text-gray-200">Ranking de Prevalencia por Carreras</h3>
          <p className="text-xs text-gray-400">Las 5 especialidades profesionales con mayor ratio acumulado de riesgo clínico</p>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-gray-400 uppercase font-mono tracking-wider">
                <th className="py-3 px-4 font-semibold text-center">Puesto</th>
                <th className="py-3 px-4 font-semibold">Carrera Profesional</th>
                <th className="py-3 px-4 font-semibold">Facultad de Origen</th>
                <th className="py-3 px-4 font-semibold text-center">Total Evaluaciones</th>
                <th className="py-3 px-4 font-semibold text-right">Ratio Prevalencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {stats.ranking_prevalencia.map((row: any) => (
                <tr key={row.rank} className="hover:bg-white/2 transition-colors">
                  <td className="py-3.5 px-4 text-center">
                    <span className={`w-5.5 h-5.5 rounded-md flex items-center justify-center font-bold text-[10px] mx-auto border ${
                      row.rank === 1 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                      row.rank === 2 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                      'bg-white/5 text-gray-400 border-white/5'
                    }`}>
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-200">{row.carrera}</td>
                  <td className="py-3.5 px-4 text-gray-400">{row.facultad}</td>
                  <td className="py-3.5 px-4 text-center text-gray-400 font-mono">{row.total_tests}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-rose-400">{row.prevalencia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
