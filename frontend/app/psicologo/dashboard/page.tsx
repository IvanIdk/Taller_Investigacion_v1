// Page: Psicólogo Dashboard (app/psicologo/dashboard/page.tsx)
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PsicologoDashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Securely check if the user has psychologist permissions
    const role = localStorage.getItem('demo_role');
    if (role !== 'psicologo' && role !== 'admin') {
      router.push('/auth');
      return;
    }

    async function loadData() {
      try {
        const res = await fetch('/api/psicologo/estudiantes');
        if (res.ok) {
          const data = await res.json();
          setEstudiantes(data);
        }
      } catch (err) {
        console.error('Failed to load students list:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (!mounted || loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-8 h-8 rounded-full border-4 border-teal-500/20 border-t-teal-400 animate-spin" />
        <p className="text-sm text-gray-500">Cargando panel clínico...</p>
      </div>
    );
  }

  // Calculate statistics from loaded students
  const totalScreened = estudiantes.length;
  const criticalAlerts = estudiantes.filter(e => e.riesgo === 'Alto');
  const moderateAlerts = estudiantes.filter(e => e.riesgo === 'Medio');
  const avgConsistency = Math.round(
    estudiantes.reduce((acc, curr) => acc + (curr.tac_score || 100), 0) / (totalScreened || 1)
  );

  return (
    <div className="flex-grow flex flex-col justify-start py-6 gap-8 relative">
      <div className="glow-overlay-teal opacity-25" />
      
      {/* Dashboard Welcome Header */}
      <section className="relative z-10 text-left">
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide uppercase">
          Portal Clínico de Bienestar Estudiantil
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Bienvenido. Monitoreo predictivo y cribado adaptativo en tiempo real.
        </p>
      </section>

      {/* Aggregate Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        
        {/* Metric 1: Total Screened */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">Tamizajes Completados</span>
            <p className="text-3xl font-black text-white mt-1">{totalScreened}</p>
            <span className="text-[9px] text-emerald-400 font-semibold mt-1 block">Estudiantes evaluados</span>
          </div>
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 font-bold">N°</div>
        </div>

        {/* Metric 2: Critical Alerts */}
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/10 flex items-center justify-between shadow-lg shadow-rose-500/5">
          <div>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">Alertas Críticas</span>
            <p className="text-3xl font-black text-rose-400 mt-1">{criticalAlerts.length}</p>
            <span className="text-[9px] text-rose-400 font-semibold mt-1 block animate-pulse">Requieren intervención urgente</span>
          </div>
          <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 font-bold">⚠️</div>
        </div>

        {/* Metric 3: Moderate Alerts */}
        <div className="glass-panel p-6 rounded-2xl border border-amber-500/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">Casos Moderados</span>
            <p className="text-3xl font-black text-amber-400 mt-1">{moderateAlerts.length}</p>
            <span className="text-[9px] text-amber-400 font-semibold mt-1 block">Soporte preventivo sugerido</span>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 font-bold">✓</div>
        </div>

        {/* Metric 4: Average TAC Consistency */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">Consistencia TAC</span>
            <p className="text-3xl font-black text-teal-400 mt-1">{avgConsistency}%</p>
            <span className="text-[9px] text-teal-400 font-semibold mt-1 block">Promedio de fiabilidad poblacional</span>
          </div>
          <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400 font-bold">🛡️</div>
        </div>

      </section>

      {/* Critical Cases List */}
      <section className="relative z-10 grid grid-cols-1 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-200">Alertas de Intervención Prioritaria</h3>
              <p className="text-xs text-gray-400">Casos identificados por el algoritmo adaptativo que superan el 75% de probabilidad de riesgo</p>
            </div>
            <a
              href="/psicologo/estudiantes"
              className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors bg-teal-500/5 hover:bg-teal-500/10 px-4 py-2 rounded-xl border border-teal-500/10"
            >
              Ver Todos los Estudiantes
            </a>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 uppercase font-mono tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Estudiante</th>
                  <th className="py-3.5 px-4 font-semibold">Facultad / Carrera</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Ansiedad (CAT)</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Depresión (CAT)</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Consistencia</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {criticalAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No hay alertas críticas pendientes. ¡Buen trabajo poblacional!
                    </td>
                  </tr>
                ) : (
                  criticalAlerts.map((est) => (
                    <tr key={est.id} className="hover:bg-white/2 transition-colors group">
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                            {est.nombre} {est.apellido}
                          </p>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{est.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        <p className="font-semibold text-xs">{est.facultad}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{est.carrera}</p>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          est.prob_ansiedad >= 0.75 ? 'bg-rose-500/10 text-rose-400' : 'text-gray-400'
                        }`}>
                          {Math.round(est.prob_ansiedad * 100)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                          est.prob_depresion >= 0.75 ? 'bg-rose-500/10 text-rose-400' : 'text-gray-400'
                        }`}>
                          {Math.round(est.prob_depresion * 100)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          est.tac_score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {est.tac_score}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => router.push(`/psicologo/estudiante/${est.id}`)}
                          className="py-1.5 px-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/10 hover:border-teal-400/20 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.03]"
                        >
                          Ver Historial SHAP
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Navigation shortcuts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-3 text-left">
          <h4 className="text-base font-bold text-gray-200">Buscador Poblacional</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Consulte la lista completa de estudiantes para realizar búsquedas por nombre y aplicar filtros demográficos de facultad, carrera o nivel de riesgo estimado.
          </p>
          <button
            onClick={() => router.push('/psicologo/estudiantes')}
            className="w-fit py-2.5 px-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer mt-2"
          >
            Abrir Base de Estudiantes
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col gap-3 text-left">
          <h4 className="text-base font-bold text-gray-200">Agenda de Citas Activas</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Gestione solicitudes de apoyo, confirme reservas agendadas, ingrese notas evolutivas post-consulta y monitoree las citas confirmadas de la semana.
          </p>
          <button
            onClick={() => router.push('/psicologo/citas')}
            className="w-fit py-2.5 px-5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-200 rounded-xl text-xs font-bold transition-all cursor-pointer mt-2"
          >
            Abrir Agenda de Citas
          </button>
        </div>
      </section>
    </div>
  );
}
