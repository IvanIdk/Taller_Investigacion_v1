// Component: QuickLogin.tsx
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function QuickLogin() {
  const router = useRouter();

  const handleQuickLogin = (role: 'estudiante' | 'psicologo' | 'admin') => {
    // 1. Configure the simulated session profiles
    let profile = {
      id: "demo-student-id",
      email: "estudiante@continental.edu.pe",
      nombre: "Diego",
      apellido: "Rojas Galarza",
      facultad: "Ingeniería",
      carrera: "Ingeniería de Sistemas",
      edad: 20
    };

    if (role === 'psicologo') {
      profile = {
        id: "demo-psychologist-id",
        email: "bienestar@continental.edu.pe",
        nombre: "Dra. María",
        apellido: "Mendoza Salcedo",
        facultad: "Ciencias de la Salud",
        carrera: "Psicología",
        edad: 42
      };
    } else if (role === 'admin') {
      profile = {
        id: "demo-admin-id",
        email: "admin@continental.edu.pe",
        nombre: "Ing. Alejandro",
        apellido: "Castro Ruiz",
        facultad: "Ingeniería",
        carrera: "Ingeniería de Sistemas",
        edad: 35
      };
    }

    // 2. Set LocalStorage Overrides
    localStorage.setItem('demo_role', role);
    localStorage.setItem('demo_profile', JSON.stringify(profile));
    localStorage.setItem('demo_user_id', profile.id);
    localStorage.setItem('demo_logged_in', 'true');

    // 3. Route to target dashboards
    if (role === 'admin') {
      router.push('/admin/dashboard');
    } else if (role === 'psicologo') {
      router.push('/psicologo/dashboard');
    } else {
      router.push('/');
    }
    
    // Trigger page refresh to update headers/layouts
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden text-center max-w-md mx-auto">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-teal-500/10 blur-2xl rounded-full" />
      
      <h3 className="text-sm font-mono font-bold tracking-wider text-teal-400 mb-2 uppercase">
        Acceso Rápido para Demostración
      </h3>
      <p className="text-xs text-gray-400 mb-5 leading-relaxed">
        Pruebe la plataforma y sus diferentes paneles de control al instante. Seleccione un rol de simulación:
      </p>

      <div className="space-y-3">
        {/* Student Button */}
        <button
          onClick={() => handleQuickLogin('estudiante')}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500/10 to-indigo-500/20 hover:from-indigo-600/20 hover:to-indigo-500/30 border border-indigo-500/20 hover:border-indigo-400/40 text-indigo-200 transition-all cursor-pointer hover:scale-[1.01] flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span className="text-left flex flex-col">
              <span>Panel Estudiante</span>
              <span className="text-[10px] text-gray-500 font-normal">Realizar CAT, historial y citas</span>
            </span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-indigo-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>

        {/* Psychologist Button */}
        <button
          onClick={() => handleQuickLogin('psicologo')}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500/10 to-teal-500/20 hover:from-teal-600/20 hover:to-teal-500/30 border border-teal-500/20 hover:border-teal-400/40 text-teal-200 transition-all cursor-pointer hover:scale-[1.01] flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span className="text-left flex flex-col">
              <span>Panel Psicólogo (Bienestar)</span>
              <span className="text-[10px] text-gray-500 font-normal">Monitoreo poblacional, SHAP y citas</span>
            </span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-teal-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>

        {/* Admin Button */}
        <button
          onClick={() => handleQuickLogin('admin')}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500/10 to-purple-500/20 hover:from-purple-600/20 hover:to-purple-500/30 border border-purple-500/20 hover:border-purple-400/40 text-purple-200 transition-all cursor-pointer hover:scale-[1.01] flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span className="text-left flex flex-col">
              <span>Panel Administrador</span>
              <span className="text-[10px] text-gray-500 font-normal">CRUD de preguntas IRT, auditoría y roles</span>
            </span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-purple-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

      <div className="mt-4 text-[10px] text-gray-500">
        Una vez seleccionado el rol, la barra de navegación se adaptará y le otorgará privilegios correspondientes.
      </div>
    </div>
  );
}
