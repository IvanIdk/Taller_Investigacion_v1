// Page: Psicólogo Students Table (app/psicologo/estudiantes/page.tsx)
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PsicologoEstudiantesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState('');
  const [facultad, setFacultad] = useState('');
  const [carrera, setCarrera] = useState('');
  const [riesgo, setRiesgo] = useState('');

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('demo_role');
    if (role !== 'psicologo' && role !== 'admin') {
      router.push('/auth');
      return;
    }

    fetchEstudiantes();
  }, [router]);

  const fetchEstudiantes = async () => {
    setLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (facultad) params.append('facultad', facultad);
      if (carrera) params.append('carrera', carrera);
      if (riesgo) params.append('riesgo', riesgo);

      const res = await fetch(`/api/psicologo/estudiantes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEstudiantes(data);
      }
    } catch (err) {
      console.error('Failed to load students list:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-run fetch when filters change
  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        fetchEstudiantes();
      }, 300); // Debounce search
      return () => clearTimeout(timer);
    }
  }, [search, facultad, carrera, riesgo, mounted]);

  if (!mounted) {
    return null;
  }

  // Active careers based on faculty
  const getCareers = () => {
    if (facultad === 'Ingeniería') return ['Ingeniería de Sistemas', 'Ingeniería Civil', 'Ingeniería Industrial'];
    if (facultad === 'Ciencias de la Salud') return ['Psicología', 'Medicina Humana', 'Enfermería'];
    if (facultad === 'Derecho') return ['Derecho'];
    if (facultad === 'Empresa') return ['Administración', 'Contabilidad', 'Negocios Internacionales'];
    return [
      'Ingeniería de Sistemas', 'Psicología', 'Medicina Humana', 'Derecho', 'Administración', 'Ingeniería Civil'
    ];
  };

  return (
    <div className="flex-grow flex flex-col justify-start py-6 gap-8 relative">
      <div className="glow-overlay-teal opacity-20" />
      
      {/* Title */}
      <section className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide uppercase">
            Seguimiento de Estudiantes
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Filtros avanzados de diagnóstico predictivo y catalogación clínica.
          </p>
        </div>
        
        <a
          href="/psicologo/dashboard"
          className="text-xs font-bold text-gray-400 hover:text-white transition-colors bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 px-4 py-2 rounded-xl cursor-pointer w-fit"
        >
          Regresar a Inicio
        </a>
      </section>

      {/* Filter Toolbar Card */}
      <section className="relative z-10 glass-panel p-6 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-[10px] font-mono font-bold text-gray-500 uppercase mb-2">
            Buscar Estudiante
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nombre, apellido o correo..."
            className="w-full bg-gray-900 border border-white/5 focus:border-teal-500/40 rounded-xl py-2 px-3 text-xs text-gray-300 outline-none transition-all placeholder:text-gray-700"
          />
        </div>

        {/* Facultad */}
        <div>
          <label htmlFor="facultad" className="block text-[10px] font-mono font-bold text-gray-500 uppercase mb-2">
            Filtrar por Facultad
          </label>
          <select
            id="facultad"
            value={facultad}
            onChange={(e) => {
              setFacultad(e.target.value);
              setCarrera(''); // Reset career
            }}
            className="w-full bg-gray-900 border border-white/5 focus:border-teal-500/40 rounded-xl py-2 px-3 text-xs text-gray-300 outline-none transition-all"
          >
            <option value="">Todas las Facultades</option>
            <option value="Ingeniería">Ingeniería</option>
            <option value="Ciencias de la Salud">Ciencias de la Salud</option>
            <option value="Derecho">Derecho</option>
            <option value="Empresa">Empresa</option>
          </select>
        </div>

        {/* Carrera */}
        <div>
          <label htmlFor="carrera" className="block text-[10px] font-mono font-bold text-gray-500 uppercase mb-2">
            Filtrar por Carrera
          </label>
          <select
            id="carrera"
            value={carrera}
            onChange={(e) => setCarrera(e.target.value)}
            className="w-full bg-gray-900 border border-white/5 focus:border-teal-500/40 rounded-xl py-2 px-3 text-xs text-gray-300 outline-none transition-all"
          >
            <option value="">Todas las Carreras</option>
            {getCareers().map((car) => (
              <option key={car} value={car}>{car}</option>
            ))}
          </select>
        </div>

        {/* Riesgo */}
        <div>
          <label htmlFor="riesgo" className="block text-[10px] font-mono font-bold text-gray-500 uppercase mb-2">
            Nivel de Riesgo
          </label>
          <select
            id="riesgo"
            value={riesgo}
            onChange={(e) => setRiesgo(e.target.value)}
            className="w-full bg-gray-900 border border-white/5 focus:border-teal-500/40 rounded-xl py-2 px-3 text-xs text-gray-300 outline-none transition-all"
          >
            <option value="">Todos los Riesgos</option>
            <option value="Alto">Alto Riesgo (Crítico)</option>
            <option value="Medio">Riesgo Moderado</option>
            <option value="Bajo">Riesgo Estable</option>
            <option value="Sin test">Sin Test Completado</option>
          </select>
        </div>
      </section>

      {/* Students Data Grid Table */}
      <section className="relative z-10 glass-panel p-6 rounded-2xl border border-white/5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" />
            <p className="text-xs text-gray-500">Filtrando registros en tiempo real...</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 uppercase font-mono tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Estudiante</th>
                  <th className="py-3.5 px-4 font-semibold">Facultad / Carrera</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Último Test</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Nivel Riesgo</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Ansiedad / Depresión</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {estudiantes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 font-semibold">
                      Ningún registro coincide con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  estudiantes.map((est) => {
                    let riskLabel = 'Estable';
                    let riskColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                    
                    if (est.riesgo === 'Alto') {
                      riskLabel = 'Crítico';
                      riskColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse';
                    } else if (est.riesgo === 'Medio') {
                      riskLabel = 'Moderado';
                      riskColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    } else if (est.riesgo === 'Sin test') {
                      riskLabel = 'Sin test';
                      riskColor = 'bg-gray-800 text-gray-500 border-white/5';
                    }

                    return (
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
                        <td className="py-4 px-4 text-center text-gray-400">
                          {est.ultimo_test 
                            ? new Date(est.ultimo_test).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                            : 'N/A'
                          }
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${riskColor}`}>
                            {riskLabel}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-bold text-gray-400">
                          {est.ultimo_test ? (
                            <span className="flex items-center justify-end gap-1.5 text-xs">
                              <span className={est.prob_ansiedad >= 0.75 ? 'text-rose-400' : 'text-gray-300'}>
                                {Math.round(est.prob_ansiedad * 100)}%
                              </span>
                              <span>/</span>
                              <span className={est.prob_depresion >= 0.75 ? 'text-rose-400' : 'text-gray-300'}>
                                {Math.round(est.prob_depresion * 100)}%
                              </span>
                            </span>
                          ) : (
                            '-- / --'
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => router.push(`/psicologo/estudiante/${est.id}`)}
                            className="py-1.5 px-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/10 hover:border-teal-400/20 rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.03]"
                          >
                            Expediente Clínico
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
