// Page: Home (app/page.tsx)
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import QuickLogin from '@/components/QuickLogin';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const storedRole = localStorage.getItem('demo_role');
    const storedProfile = localStorage.getItem('demo_profile');
    if (storedRole) {
      setRole(storedRole);
      // Auto-redirect psychologists and admins to their dashboards
      if (storedRole === 'psicologo') {
        router.push('/psicologo/dashboard');
      } else if (storedRole === 'admin') {
        router.push('/admin/dashboard');
      }
    }
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col gap-12 py-6 relative">
      <div className="glow-overlay-indigo opacity-30" />
      
      {/* Welcome & Hero Section */}
      <section className="text-center max-w-4xl mx-auto flex flex-col items-center gap-6 relative z-10 pt-8">
        <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 tracking-wider uppercase">
          Dirección de Bienestar Estudiantil
        </span>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Cribado Clínico Inteligente <br />
          <span className="bg-gradient-to-r from-indigo-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            Diagnóstico Predictivo
          </span>
        </h2>

        <p className="text-sm md:text-base text-gray-400 max-w-2xl leading-relaxed">
          Plataforma de evaluación adaptativa computarizada (CAT) basada en la Teoría de Respuesta al Ítem (IRT). Diseñado para identificar de manera rápida, precisa y con fatiga mínima, rasgos de ansiedad y depresión.
        </p>

        {role === 'estudiante' && profile ? (
          /* Student Logged In view */
          <div className="glass-panel p-6 rounded-2xl border border-white/5 max-w-lg w-full mt-4 text-left">
            <h3 className="text-base font-bold text-gray-100 mb-2">¡Hola, {profile.nombre}!</h3>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Carrera: <span className="font-semibold text-gray-300">{profile.carrera}</span> | Facultad: <span className="font-semibold text-gray-300">{profile.facultad}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/test"
                className="flex-1 text-center py-3 px-6 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.01] transition-all cursor-pointer"
              >
                Realizar Nuevo Test CAT
              </a>
              <a
                href="/mis-resultados"
                className="flex-1 text-center py-3 px-6 rounded-xl text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-200 transition-all cursor-pointer"
              >
                Ver Mis Históricos
              </a>
            </div>
          </div>
        ) : (
          /* Anonymous guest / Demo evaluator view */
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <a
              href="/test"
              className="py-4.5 px-8 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white shadow-xl shadow-indigo-500/25 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-2"
            >
              Comenzar Test Adaptativo (CAT)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="/auth"
              className="py-4.5 px-8 rounded-2xl text-sm font-bold bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-gray-200 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Iniciar Sesión
            </a>
          </div>
        )}
      </section>

      {/* Grid of Key Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-indigo-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-200 mb-2">Algoritmo CAT Adaptativo</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Selecciona dinámicamente cada ítem a evaluar según tu nivel estimado en base a la Teoría de Respuesta al Ítem (IRT). Ahorra hasta el 50% de preguntas logrando la misma precisión clínica.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-teal-500/20 transition-all">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-teal-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-200 mb-2">Parada Temprana</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Si la probabilidad matemática acumulada del modelo machine learning para ansiedad o depresión cruza el umbral del 95%, el test finaliza en el acto para evitar el agobio estudiantil.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-purple-500/20 transition-all">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-purple-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-200 mb-2">SHAP Explicable</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Mapea en un gráfico bidireccional los factores de atribución de síntomas específicos. Los psicólogos pueden auditar en detalle qué respuestas del test impulsaron la clasificación de riesgo.
          </p>
        </div>
      </section>

      {/* Demo Selector Panel */}
      {role === null && (
        <section className="relative z-10 border-t border-white/5 pt-10">
          <QuickLogin />
        </section>
      )}
    </div>
  );
}
