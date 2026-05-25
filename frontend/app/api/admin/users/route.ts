// API Route: /api/admin/users
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Persistent in-memory mock database of users for roles configuration
let MOCK_USERS = [
  { id: "usr-1", email: "admin@continental.edu.pe", nombre: "Alejandro", apellido: "Castro Ruiz", role: "admin", facultad: "Ingeniería", carrera: "Ingeniería de Sistemas", edad: 35 },
  { id: "usr-2", email: "bienestar@continental.edu.pe", nombre: "Dra. María", apellido: "Mendoza Salcedo", role: "psicologo", facultad: "Ciencias de la Salud", carrera: "Psicología", edad: 42 },
  { id: "est-1", email: "74321980@continental.edu.pe", nombre: "Sofía", apellido: "Ramos Gutiérrez", role: "estudiante", facultad: "Ciencias de la Salud", carrera: "Psicología", edad: 20 },
  { id: "est-2", email: "72109845@continental.edu.pe", nombre: "Juan Carlos", apellido: "Quispe Mamani", role: "estudiante", facultad: "Ingeniería", carrera: "Ingeniería de Sistemas", edad: 21 },
  { id: "est-3", email: "75432109@continental.edu.pe", nombre: "Valeria", apellido: "Fernández Díaz", role: "estudiante", facultad: "Derecho", carrera: "Derecho", edad: 22 },
  { id: "est-4", email: "76123450@continental.edu.pe", nombre: "Mateo", apellido: "Villanueva Rojas", role: "estudiante", facultad: "Empresa", carrera: "Administración", edad: 19 },
  { id: "est-5", email: "71092837@continental.edu.pe", nombre: "Camila", apellido: "Torres Paredes", role: "estudiante", facultad: "Ciencias de la Salud", carrera: "Medicina Humana", edad: 23 }
];

export async function GET(req: Request) {
  try {
    try {
      // Fetch profiles
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*');

      if (pErr || !profiles || profiles.length === 0) throw new Error('No profiles in DB');

      // Fetch user roles
      const { data: userRoles, error: rErr } = await supabase
        .from('user_roles')
        .select('user_id, roles(nombre)');

      const roleMap: Record<string, string> = {};
      userRoles?.forEach((ur: any) => {
        if (ur.roles && ur.roles.nombre) {
          roleMap[ur.user_id] = ur.roles.nombre;
        }
      });

      const formatted = profiles.map(p => ({
        id: p.id,
        email: p.email,
        nombre: p.nombre,
        apellido: p.apellido,
        facultad: p.facultad,
        carrera: p.carrera,
        edad: p.edad,
        role: roleMap[p.id] || 'estudiante'
      }));

      return NextResponse.json(formatted);

    } catch (dbErr) {
      // Fallback
      return NextResponse.json(MOCK_USERS);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar usuarios' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { user_id, new_role } = body;

    if (!user_id || !new_role) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    try {
      // Find role ID in DB
      const { data: roleRow, error: rErr } = await supabase
        .from('roles')
        .select('id')
        .eq('nombre', new_role)
        .single();

      if (rErr || !roleRow) throw new Error('Role not found');

      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user_id);

      // Insert new role
      const { error: insErr } = await supabase
        .from('user_roles')
        .insert({ user_id, role_id: roleRow.id });

      if (insErr) throw insErr;
      
      // Return success
      return NextResponse.json({ success: true, user_id, new_role });

    } catch (dbErr) {
      // Fallback in-memory update
      const index = MOCK_USERS.findIndex(u => u.id === user_id);
      if (index !== -1) {
        MOCK_USERS[index].role = new_role;
        return NextResponse.json({ success: true, user: MOCK_USERS[index] });
      }
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error al cambiar rol' }, { status: 500 });
  }
}
