// Page: Administrador Usuarios & Roles (app/admin/usuarios/page.tsx)
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('demo_role');
    if (role !== 'admin') {
      router.push('/auth');
      return;
    }

    fetchUsuarios();
  }, [router]);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (err) {
      console.error('Failed to load users database:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, new_role: newRole })
      });

      if (res.ok) {
        // Find user and update inline
        setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        
        // Also update local storage if the admin changed their own role for demo
        const currentUserId = localStorage.getItem('demo_user_id');
        if (userId === currentUserId) {
          localStorage.setItem('demo_role', newRole);
          const currentProfile = JSON.parse(localStorage.getItem('demo_profile') || '{}');
          localStorage.setItem('demo_profile', JSON.stringify({ ...currentProfile, role: newRole }));
        }

        setSuccessMsg('¡Rol actualizado correctamente!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to change user role:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!mounted) return null;

  // Filter list locally by search
  const filteredUsers = usuarios.filter(u => {
    const term = search.toLowerCase();
    return !search ||
      u.nombre.toLowerCase().includes(term) ||
      u.apellido.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term);
  });

  return (
    <div className="flex-grow flex flex-col justify-start py-6 gap-8 relative">
      <div className="glow-overlay-indigo opacity-20" />
      
      {/* Title */}
      <section className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-wide uppercase">
            Gestión de Usuarios y Roles
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Asignación de privilegios de acceso para Estudiantes, Psicólogos y Administradores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/admin/dashboard"
            className="text-xs font-bold text-gray-400 hover:text-white transition-colors bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 px-4 py-2.5 rounded-xl cursor-pointer"
          >
            Volver a Estadísticas
          </a>
        </div>
      </section>

      {/* Control bar */}
      <section className="relative z-10 glass-panel p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, apellido o correo institucional..."
            className="w-full bg-gray-900 border border-white/5 focus:border-purple-500/40 rounded-xl py-2.5 px-4 text-xs text-gray-300 outline-none transition-all placeholder:text-gray-700"
          />
        </div>

        {successMsg && (
          <div className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse">
            {successMsg}
          </div>
        )}
      </section>

      {/* Users Table */}
      <section className="relative z-10 glass-panel p-6 rounded-2xl border border-white/5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
            <p className="text-xs text-gray-500">Cargando base de datos de usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 uppercase font-mono tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Usuario</th>
                  <th className="py-3.5 px-4 font-semibold">Correo Electrónico</th>
                  <th className="py-3.5 px-4 font-semibold">Facultad / Carrera</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Rol Asignado</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 font-semibold">
                      Ningún usuario coincide con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-sm font-bold text-gray-200">
                          {user.nombre} {user.apellido}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-gray-500 block mt-0.5">ID: {user.id}</span>
                      </td>
                      <td className="py-4 px-4 text-gray-300 font-semibold">{user.email}</td>
                      <td className="py-4 px-4 text-gray-400">
                        {user.facultad ? (
                          <>
                            <p className="font-semibold text-xs text-gray-300">{user.facultad}</p>
                            <p className="text-[10px] mt-0.5">{user.carrera}</p>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border ${
                          user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          user.role === 'psicologo' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <select
                          disabled={updatingId === user.id}
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-gray-900 border border-white/5 focus:border-purple-500/40 rounded-xl py-1.5 px-3 text-xs text-gray-300 outline-none cursor-pointer font-bold"
                        >
                          <option value="estudiante">Estudiante</option>
                          <option value="psicologo">Psicólogo</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
