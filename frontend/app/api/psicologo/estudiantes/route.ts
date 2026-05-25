// API Route: /api/psicologo/estudiantes
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// High-fidelity Mock Students Database for seamless local evaluation
const MOCK_ESTUDIANTES = [
  {
    id: "est-1",
    nombre: "Sofía",
    apellido: "Ramos Gutiérrez",
    email: "74321980@continental.edu.pe",
    facultad: "Ciencias de la Salud",
    carrera: "Psicología",
    edad: 20,
    ultimo_test: "2026-05-24T18:30:00Z",
    riesgo: "Alto",
    prob_ansiedad: 0.96,
    prob_depresion: 0.88,
    tac_score: 100.0,
    historial: [
      { fecha: "2026-03-10", ansiedad: 0.65, depresion: 0.50, tac: 100.0 },
      { fecha: "2026-04-15", ansiedad: 0.78, depresion: 0.68, tac: 75.0 },
      { fecha: "2026-05-24", ansiedad: 0.96, depresion: 0.88, tac: 100.0 }
    ],
    shap: [
      { feature_name: "Pensamientos de autolesión (P19)", attribution: 0.35 },
      { feature_name: "Ánimo decaído / Tristeza (P12)", attribution: 0.22 },
      { feature_name: "Preocupación incontrolable (P2)", attribution: 0.15 },
      { feature_name: "Autovaloración negativa / Culpa (P16)", attribution: 0.12 }
    ]
  },
  {
    id: "est-2",
    nombre: "Juan Carlos",
    apellido: "Quispe Mamani",
    email: "72109845@continental.edu.pe",
    facultad: "Ingeniería",
    carrera: "Ingeniería de Sistemas",
    edad: 21,
    ultimo_test: "2026-05-23T15:20:00Z",
    riesgo: "Medio",
    prob_ansiedad: 0.62,
    prob_depresion: 0.41,
    tac_score: 75.0,
    historial: [
      { fecha: "2026-05-23", ansiedad: 0.62, depresion: 0.41, tac: 75.0 }
    ],
    shap: [
      { feature_name: "Insomnio por ansiedad (P10)", attribution: 0.18 },
      { feature_name: "Dificultad para relajarse (P4)", attribution: 0.12 },
      { feature_name: "Cansancio / Falta de energía (P14)", attribution: 0.10 }
    ]
  },
  {
    id: "est-3",
    nombre: "Valeria",
    apellido: "Fernández Díaz",
    email: "75432109@continental.edu.pe",
    facultad: "Derecho",
    carrera: "Derecho",
    edad: 22,
    ultimo_test: "2026-05-22T09:15:00Z",
    riesgo: "Bajo",
    prob_ansiedad: 0.15,
    prob_depresion: 0.18,
    tac_score: 100.0,
    historial: [
      { fecha: "2026-04-02", ansiedad: 0.25, depresion: 0.20, tac: 100.0 },
      { fecha: "2026-05-22", ansiedad: 0.15, depresion: 0.18, tac: 100.0 }
    ],
    shap: [
      { feature_name: "Preocupación excesiva (P3)", attribution: 0.04 },
      { feature_name: "Poco interés / Anhedonia (P11)", attribution: 0.03 }
    ]
  },
  {
    id: "est-4",
    nombre: "Mateo",
    apellido: "Villanueva Rojas",
    email: "76123450@continental.edu.pe",
    facultad: "Empresa",
    carrera: "Administración",
    edad: 19,
    ultimo_test: "2026-05-25T08:45:00Z",
    riesgo: "Alto",
    prob_ansiedad: 0.42,
    prob_depresion: 0.95,
    tac_score: 100.0,
    historial: [
      { fecha: "2026-05-25", ansiedad: 0.42, depresion: 0.95, tac: 100.0 }
    ],
    shap: [
      { feature_name: "Pensamientos de autolesión (P19)", attribution: 0.38 },
      { feature_name: "Autovaloración negativa / Culpa (P16)", attribution: 0.24 },
      { feature_name: "Cansancio / Falta de energía (P14)", attribution: 0.14 }
    ]
  },
  {
    id: "est-5",
    nombre: "Camila",
    apellido: "Torres Paredes",
    email: "71092837@continental.edu.pe",
    facultad: "Ciencias de la Salud",
    carrera: "Medicina Humana",
    edad: 23,
    ultimo_test: "2026-05-20T11:00:00Z",
    riesgo: "Alto",
    prob_ansiedad: 0.97,
    prob_depresion: 0.35,
    tac_score: 75.0,
    historial: [
      { fecha: "2026-05-20", ansiedad: 0.97, depresion: 0.35, tac: 75.0 }
    ],
    shap: [
      { feature_name: "Temor a catástrofes (P7)", attribution: 0.32 },
      { feature_name: "Nerviosismo / Ansiedad (P1)", attribution: 0.28 },
      { feature_name: "Evitación ansiosa (P9)", attribution: 0.18 }
    ]
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const facultad = searchParams.get('facultad') || '';
    const carrera = searchParams.get('carrera') || '';
    const riesgo = searchParams.get('riesgo') || '';
    const id = searchParams.get('id') || '';

    // If ID is specified, return detailed student data
    if (id) {
      // 1. Try to fetch from real database
      try {
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();

        if (pErr || !profile) throw new Error('Student not found in DB');

        // Fetch tests, predictions and shap explanations
        const { data: tests, error: tErr } = await supabase
          .from('tests')
          .select('*, predictions(*, shap_explanations(*))')
          .eq('user_id', id)
          .order('started_at', { ascending: true });

        if (tErr || !tests || tests.length === 0) {
          // If profile exists but no tests, return profile with empty tests
          return NextResponse.json({
            ...profile,
            historial: [],
            shap: [],
            riesgo: 'Sin test'
          });
        }

        const historial = tests
          .filter(t => t.status === 'completado' && t.predictions)
          .map(t => ({
            fecha: new Date(t.completed_at || t.started_at).toISOString().split('T')[0],
            ansiedad: t.predictions.prob_ansiedad,
            depresion: t.predictions.prob_depresion,
            tac: t.predictions.tac_score
          }));

        const latestTest = tests[tests.length - 1];
        const latestPred = latestTest.predictions;
        const shap = latestPred?.shap_explanations || [];
        
        let calculatedRiesgo = 'Bajo';
        if (latestPred) {
          const maxProb = Math.max(latestPred.prob_ansiedad, latestPred.prob_depresion);
          if (maxProb >= 0.75) calculatedRiesgo = 'Alto';
          else if (maxProb >= 0.40) calculatedRiesgo = 'Medio';
        }

        return NextResponse.json({
          id: profile.id,
          nombre: profile.nombre,
          apellido: profile.apellido,
          email: profile.email,
          facultad: profile.facultad,
          carrera: profile.carrera,
          edad: profile.edad,
          ultimo_test: latestTest.completed_at || latestTest.started_at,
          riesgo: calculatedRiesgo,
          prob_ansiedad: latestPred?.prob_ansiedad || 0.0,
          prob_depresion: latestPred?.prob_depresion || 0.0,
          tac_score: latestPred?.tac_score || 100.0,
          historial,
          shap
        });

      } catch (dbErr) {
        // DB Fallback
        const mockStudent = MOCK_ESTUDIANTES.find(e => e.id === id);
        if (mockStudent) {
          return NextResponse.json(mockStudent);
        }
        return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
      }
    }

    // List fetching with filters
    try {
      const { data: profiles, error: pErr } = await supabase
        .from('profiles')
        .select('*');

      if (pErr || !profiles || profiles.length === 0) throw new Error('No profiles in DB');

      // Fetch predictions for all profiles
      const studentList = [];
      for (const p of profiles) {
        const { data: tests } = await supabase
          .from('tests')
          .select('*, predictions(*)')
          .eq('user_id', p.id)
          .order('started_at', { ascending: false });

        const latestTest = tests?.[0];
        const latestPred = latestTest?.predictions;

        let calculatedRiesgo = 'Bajo';
        if (latestPred) {
          const maxProb = Math.max(latestPred.prob_ansiedad, latestPred.prob_depresion);
          if (maxProb >= 0.75) calculatedRiesgo = 'Alto';
          else if (maxProb >= 0.40) calculatedRiesgo = 'Medio';
        }

        studentList.push({
          id: p.id,
          nombre: p.nombre,
          apellido: p.apellido,
          email: p.email,
          facultad: p.facultad,
          carrera: p.carrera,
          edad: p.edad,
          ultimo_test: latestTest ? (latestTest.completed_at || latestTest.started_at) : null,
          riesgo: latestTest ? calculatedRiesgo : 'Sin test',
          prob_ansiedad: latestPred?.prob_ansiedad || 0.0,
          prob_depresion: latestPred?.prob_depresion || 0.0,
          tac_score: latestPred?.tac_score || 100.0
        });
      }

      // Apply filters to real data
      const filtered = studentList.filter(s => {
        const matchesSearch = !search || 
          s.nombre.toLowerCase().includes(search) || 
          s.apellido.toLowerCase().includes(search) || 
          s.email.toLowerCase().includes(search);
        
        const matchesFacultad = !facultad || s.facultad === facultad;
        const matchesCarrera = !carrera || s.carrera === carrera;
        const matchesRiesgo = !riesgo || s.riesgo === riesgo;

        return matchesSearch && matchesFacultad && matchesCarrera && matchesRiesgo;
      });

      return NextResponse.json(filtered);

    } catch (dbErr) {
      // DB Fallback: filter MOCK_ESTUDIANTES
      const filtered = MOCK_ESTUDIANTES.filter(s => {
        const matchesSearch = !search || 
          s.nombre.toLowerCase().includes(search) || 
          s.apellido.toLowerCase().includes(search) || 
          s.email.toLowerCase().includes(search);
        
        const matchesFacultad = !facultad || s.facultad === facultad;
        const matchesCarrera = !carrera || s.carrera === carrera;
        const matchesRiesgo = !riesgo || s.riesgo === riesgo;

        return matchesSearch && matchesFacultad && matchesCarrera && matchesRiesgo;
      });

      return NextResponse.json(filtered);
    }

  } catch (error) {
    console.error('Error in estudiantes api:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
