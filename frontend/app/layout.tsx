// Component: RootLayout (app/layout.tsx)
'use client';
import React, { useEffect, useState } from 'react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const storedRole = localStorage.getItem('demo_role');
    const storedProfile = localStorage.getItem('demo_profile');
    if (storedRole) setRole(storedRole);
    if (storedProfile) setProfile(JSON.parse(storedProfile));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('demo_role');
    localStorage.removeItem('demo_profile');
    localStorage.removeItem('demo_user_id');
    localStorage.removeItem('demo_logged_in');
    document.cookie = 'demo_role=; path=/; max-age=0';
    setRole(null);
    setProfile(null);
    window.location.href = '/auth';
  };

  return (
    <html lang="es" className="h-full">
      <head>
        <title>Diagnóstico Predictivo | Universidad Continental</title>
        <meta name="description" content="Plataforma de detección temprana y cribado adaptativo CAT para salud mental de la Universidad Continental." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col bg-[#030712] text-gray-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        
        {/* Global Navigation Header */}
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Branding Logo Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-teal-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-extrabold text-white text-lg tracking-tighter">UC</span>
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                Universidad Continental
                <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-bold uppercase">
                  Salud Mental
                </span>
              </h1>
              <p className="text-[11px] font-medium text-gray-400">Diagnóstico Predictivo Adaptativo (CAT)</p>
            </div>
          </div>

          {/* Navigation Items (Role-Adaptive) */}
          {mounted && role && (
            <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold">
              {role === 'estudiante' && (
                <>
                  <a href="/" className="text-gray-300 hover:text-white transition-colors">Inicio</a>
                  <a href="/test" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors bg-indigo-500/10 px-3.5 py-1.5 rounded-xl border border-indigo-500/20">Realizar Test</a>
                  <a href="/resultados" className="text-gray-300 hover:text-white transition-colors">Mis Resultados</a>
                  <a href="/mis-citas" className="text-gray-300 hover:text-white transition-colors">Mis Citas</a>
                </>
              )}
              {role === 'psicologo' && (
                <>
                  <a href="/psicologo/dashboard" className="text-teal-400 hover:text-teal-300 font-bold transition-colors bg-teal-500/10 px-3.5 py-1.5 rounded-xl border border-teal-500/20">Dashboard General</a>
                  <a href="/psicologo/estudiantes" className="text-gray-300 hover:text-white transition-colors">Pacientes Estudiantes</a>
                  <a href="/psicologo/citas" className="text-gray-300 hover:text-white transition-colors">Gestión de Citas</a>
                </>
              )}
              {role === 'admin' && (
                <>
                  <a href="/admin/dashboard" className="text-purple-400 hover:text-purple-300 font-bold transition-colors bg-purple-500/10 px-3.5 py-1.5 rounded-xl border border-purple-500/20">Dashboard Global</a>
                  <a href="/admin/usuarios" className="text-gray-300 hover:text-white transition-colors">Usuarios & Roles</a>
                  <a href="/admin/preguntas" className="text-gray-300 hover:text-white transition-colors">Banco de Preguntas IRT</a>
                </>
              )}
            </nav>
          )}

          {/* User Session Profile widget */}
          <div className="flex items-center gap-4">
            {mounted && role ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-gray-200">
                    {profile ? `${profile.nombre} ${profile.apellido}` : 'Usuario'}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">
                    Rol: <span className={`font-bold ${
                      role === 'admin' ? 'text-purple-400' : role === 'psicologo' ? 'text-teal-400' : 'text-indigo-400'
                    }`}>{role}</span>
                  </p>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/5 hover:border-rose-500/20 hover:bg-rose-500/10 text-gray-300 hover:text-rose-400 transition-all cursor-pointer"
                >
                  Salir
                </button>
              </div>
            ) : (
              mounted && (
                <a
                  href="/auth"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white shadow-md shadow-indigo-500/10 transition-all cursor-pointer"
                >
                  Acceso Plataforma
                </a>
              )
            )}
          </div>
        </header>

        {/* Global Body Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10 flex flex-col justify-start">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full glass-panel border-t border-white/5 py-6 px-12 text-center text-xs text-gray-500 mt-12">
          © {new Date().getFullYear()} Dirección de Bienestar Estudiantil - Universidad Continental. Todos los derechos reservados.
        </footer>
      </body>
    </html>
  );
}
