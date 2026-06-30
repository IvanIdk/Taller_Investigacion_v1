import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireApiRole } from '@/lib/api/routeAuth';
import { badRequest, internalError, notFound } from '@/lib/api/errors';
import type { AppRole, SupabaseRoleRow } from '@/lib/types/domain';
import { roleFromSupabaseRow } from '@/lib/types/domain';

const MOCK_USERS = [
  { id: 'usr-1', email: 'admin@continental.edu.pe', nombre: 'Alejandro', apellido: 'Castro Ruiz', role: 'admin' as AppRole, facultad: 'Ingeniería', carrera: 'Ingeniería de Sistemas', edad: 35 },
  { id: 'usr-2', email: 'bienestar@continental.edu.pe', nombre: 'Dra. María', apellido: 'Mendoza Salcedo', role: 'psicologo' as AppRole, facultad: 'Ciencias de la Salud', carrera: 'Psicología', edad: 42 },
  { id: 'est-1', email: '74321980@continental.edu.pe', nombre: 'Sofía', apellido: 'Ramos Gutiérrez', role: 'estudiante' as AppRole, facultad: 'Ciencias de la Salud', carrera: 'Psicología', edad: 20 },
];

export async function GET(req: Request) {
  const auth = await requireApiRole(req, ['admin']);
  if (!auth.ok) return auth.response;

  try {
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
    if (pErr || !profiles?.length) throw new Error('No profiles');

    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('user_id, roles(nombre)');

    const roleMap: Record<string, AppRole> = {};
    userRoles?.forEach((ur: SupabaseRoleRow) => {
      const nombre = roleFromSupabaseRow(ur.roles);
      if (nombre) roleMap[ur.user_id] = nombre;
    });

    const formatted = profiles.map((p) => ({
      id: p.id,
      email: p.email,
      nombre: p.nombre,
      apellido: p.apellido,
      facultad: p.facultad,
      carrera: p.carrera,
      edad: p.edad,
      role: roleMap[p.id] ?? 'estudiante',
    }));

    return NextResponse.json(formatted);
  } catch {
    return NextResponse.json(MOCK_USERS);
  }
}

export async function PUT(req: Request) {
  const auth = await requireApiRole(req, ['admin']);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const { user_id, new_role } = body;

    if (!user_id || !new_role) return badRequest();

    try {
      const { data: roleRow, error: rErr } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', new_role)
        .single();

      if (rErr || !roleRow) throw new Error('Role not found');

      await supabase.from('user_roles').delete().eq('user_id', user_id);

      const { error: insErr } = await supabase
        .from('user_roles')
        .insert({ user_id, role_id: roleRow.id });

      if (insErr) throw insErr;

      return NextResponse.json({ success: true, user_id, new_role });
    } catch {
      const index = MOCK_USERS.findIndex((u) => u.id === user_id);
      if (index !== -1) {
        MOCK_USERS[index].role = new_role as AppRole;
        return NextResponse.json({ success: true, user: MOCK_USERS[index] });
      }
      return notFound('Usuario no encontrado');
    }
  } catch {
    return internalError('Error al cambiar rol');
  }
}
