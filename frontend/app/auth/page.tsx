// Page: Auth (app/auth/page.tsx)
'use client';
import React, { useState } from 'react';
import QuickLogin from '@/components/QuickLogin';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMagicLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    // Simulate Supabase Magic Link Send
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center py-10 relative">
      <div className="glow-overlay-teal opacity-25" />
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Brand Narrative */}
        <div className="flex flex-col gap-6 text-left max-w-md">
          <span className="w-fit px-3 py-1 rounded-md text-[10px] font-bold font-mono text-teal-400 bg-teal-500/10 border border-teal-500/20 uppercase tracking-widest">
            Bienestar UC
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Accede al Portal de Salud Mental Continental
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Plataforma digital integrada para el acompañamiento psicológico y psicométrico adaptativo de nuestros estudiantes de las sedes Huancayo, Lima, Arequipa y Cusco.
          </p>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs shrink-0 mt-0.5">✓</div>
              <p className="text-xs text-gray-300">Monitoreo confidencial asistido por algoritmos IRT de última generación.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs shrink-0 mt-0.5">✓</div>
              <p className="text-xs text-gray-300">Agendamiento ágil de citas virtuales y presenciales con Bienestar Estudiantil.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs shrink-0 mt-0.5">✓</div>
              <p className="text-xs text-gray-300">Reportes clínicos explicables e intuitivos (SHAP) para profesionales de la salud.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms Stack */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-teal-500/5 to-indigo-500/5 blur-2xl rounded-full" />
            
            <h3 className="text-lg font-bold text-gray-200 mb-2">Ingresar con Correo</h3>
            <p className="text-xs text-gray-400 mb-6">
              Reciba un correo de acceso rápido (Magic Link) de Supabase en su bandeja.
            </p>

            {submitted ? (
              <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-5 text-center text-teal-300 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-3 text-teal-400 animate-bounce">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 19.5V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <p className="font-bold mb-1">¡Correo de Acceso Enviado!</p>
                <p className="text-xs text-teal-400/80">Revise la bandeja de entrada de <b>{email}</b> y presione el enlace de ingreso.</p>
              </div>
            ) : (
              <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-400 mb-2">
                    Correo Institucional o Personal
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@continental.edu.pe"
                    className="w-full bg-gray-900 border border-white/5 focus:border-teal-500/40 rounded-xl py-3 px-4 text-sm text-gray-200 outline-none transition-all placeholder:text-gray-600 font-medium"
                  />
                </div>

                {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-indigo-500 hover:from-teal-600 hover:to-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-500/10 transition-all hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  ) : (
                    "Enviar Enlace de Acceso"
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Quick Login Board */}
          <QuickLogin />
        </div>
      </div>
    </div>
  );
}
