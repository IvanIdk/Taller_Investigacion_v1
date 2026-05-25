// API Route: /api/psicologo/citas
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Persistent-in-memory Mock Database for appointments during demo evaluation
let MOCK_CITAS = [
  {
    id: 1,
    estudiante_id: "est-1",
    estudiante_nombre: "Sofía Ramos Gutiérrez",
    email: "74321980@continental.edu.pe",
    riesgo: "Alto",
    fecha: "2026-05-27T10:00:00.000Z",
    estado: "pendiente",
    notas: "Test CAT completado con alerta temprana al 96% de ansiedad. Requiere contención de crisis.",
    created_at: "2026-05-24T18:32:00Z"
  },
  {
    id: 2,
    estudiante_id: "est-4",
    estudiante_nombre: "Mateo Villanueva Rojas",
    email: "76123450@continental.edu.pe",
    riesgo: "Alto",
    fecha: "2026-05-28T16:30:00.000Z",
    estado: "confirmada",
    notas: "Confirmado horario por correo. Evaluación centrada en el rasgo de depresión severa.",
    created_at: "2026-05-25T08:46:00Z"
  },
  {
    id: 3,
    estudiante_id: "est-2",
    estudiante_nombre: "Juan Carlos Quispe Mamani",
    email: "72109845@continental.edu.pe",
    riesgo: "Medio",
    fecha: "2026-05-26T09:00:00.000Z",
    estado: "realizada",
    notas: "Se brindaron pautas de relajación diafragmática e higiene del sueño. Estudiante receptivo.",
    created_at: "2026-05-23T15:25:00Z"
  }
];

export async function GET(req: Request) {
  try {
    // 1. Try to fetch from real database
    try {
      const { data: realCitas, error } = await supabase
        .from('citas')
        .select(`
          id,
          fecha,
          estado,
          notas,
          created_at,
          estudiante:profiles!citas_estudiante_id_fkey(id, nombre, apellido, email, facultad, carrera)
        `)
        .order('fecha', { ascending: true });

      if (error || !realCitas || realCitas.length === 0) throw new Error('No appointments in DB');

      const formatted = realCitas.map(c => {
        const est = c.estudiante as any;
        return {
          id: c.id,
          estudiante_id: est?.id || '',
          estudiante_nombre: est ? `${est.nombre} ${est.apellido}` : 'Estudiante Demo',
          email: est?.email || '',
          riesgo: 'Ver test', // Will be calculated dynamically in UI
          fecha: c.fecha,
          estado: c.estado,
          notas: c.notas,
          created_at: c.created_at
        };
      });

      return NextResponse.json(formatted);
    } catch (dbErr) {
      // Fallback
      return NextResponse.json(MOCK_CITAS);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { estudiante_id, fecha, notas } = body;

    if (!estudiante_id || !fecha) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
    }

    try {
      const { data, error } = await supabase
        .from('citas')
        .insert({ estudiante_id, fecha, notas, estado: 'pendiente' })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);

    } catch (dbErr) {
      // Fallback in-memory insert
      const newCita = {
        id: MOCK_CITAS.length + 1,
        estudiante_id,
        estudiante_nombre: "Estudiante Autenticado",
        email: "estudiante@continental.edu.pe",
        riesgo: "En evaluación",
        fecha,
        estado: 'pendiente',
        notas: notas || 'Cita solicitada a través de la plataforma.',
        created_at: new Date().toISOString()
      };
      
      MOCK_CITAS.push(newCita);
      return NextResponse.json(newCita);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, estado, notas } = body;

    if (!id || !estado) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    try {
      const { data, error } = await supabase
        .from('citas')
        .update({ estado, notas })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(data);

    } catch (dbErr) {
      // Fallback in-memory update
      const index = MOCK_CITAS.findIndex(c => c.id === id);
      if (index !== -1) {
        MOCK_CITAS[index] = {
          ...MOCK_CITAS[index],
          estado,
          notas: notas !== undefined ? notas : MOCK_CITAS[index].notas
        };
        return NextResponse.json(MOCK_CITAS[index]);
      }
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
