import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getRiskLevel } from '@/lib/risk';
import { filterStudents } from '@/lib/students/filters';
import { requireApiRole } from '@/lib/api/routeAuth';
import { internalError, notFound } from '@/lib/api/errors';
import type { TestPrediction } from '@/lib/types/domain';

const MOCK_ESTUDIANTES = [
  {
    id: 'est-1',
    nombre: 'Sofía',
    apellido: 'Ramos Gutiérrez',
    email: '74321980@continental.edu.pe',
    facultad: 'Ciencias de la Salud',
    carrera: 'Psicología',
    edad: 20,
    ultimo_test: '2026-05-24T18:30:00Z',
    riesgo: 'Alto',
    prob_ansiedad: 0.96,
    prob_depresion: 0.88,
    tac_score: 100.0,
    historial: [
      { fecha: '2026-03-10', ansiedad: 0.65, depresion: 0.50, tac: 100.0 },
      { fecha: '2026-04-15', ansiedad: 0.78, depresion: 0.68, tac: 75.0 },
      { fecha: '2026-05-24', ansiedad: 0.96, depresion: 0.88, tac: 100.0 },
    ],
    shap: [
      { feature_name: 'Pensamientos de autolesión (P19)', attribution: 0.35 },
      { feature_name: 'Ánimo decaído / Tristeza (P12)', attribution: 0.22 },
    ],
  },
  {
    id: 'est-2',
    nombre: 'Juan Carlos',
    apellido: 'Quispe Mamani',
    email: '72109845@continental.edu.pe',
    facultad: 'Ingeniería',
    carrera: 'Ingeniería de Sistemas',
    edad: 21,
    ultimo_test: '2026-05-23T15:20:00Z',
    riesgo: 'Medio',
    prob_ansiedad: 0.62,
    prob_depresion: 0.41,
    tac_score: 75.0,
    historial: [{ fecha: '2026-05-23', ansiedad: 0.62, depresion: 0.41, tac: 75.0 }],
    shap: [],
  },
  {
    id: 'est-3',
    nombre: 'Valeria',
    apellido: 'Fernández Díaz',
    email: '75432109@continental.edu.pe',
    facultad: 'Derecho',
    carrera: 'Derecho',
    edad: 22,
    ultimo_test: '2026-05-22T09:15:00Z',
    riesgo: 'Bajo',
    prob_ansiedad: 0.15,
    prob_depresion: 0.18,
    tac_score: 100.0,
    historial: [],
    shap: [],
  },
];

function parseFilters(url: string) {
  const { searchParams } = new URL(url);
  return {
    search: searchParams.get('search')?.toLowerCase() ?? '',
    facultad: searchParams.get('facultad') ?? '',
    carrera: searchParams.get('carrera') ?? '',
    riesgo: searchParams.get('riesgo') ?? '',
    id: searchParams.get('id') ?? '',
  };
}

function riskFromPrediction(pred: TestPrediction | null | undefined): string {
  if (!pred) return 'Sin test';
  return getRiskLevel(pred.prob_ansiedad, pred.prob_depresion);
}

export async function GET(req: Request) {
  const auth = await requireApiRole(req, ['psicologo', 'admin']);
  if (!auth.ok) return auth.response;

  try {
    const filters = parseFilters(req.url);

    if (filters.id) {
      try {
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', filters.id)
          .single();

        if (pErr || !profile) throw new Error('Student not found in DB');

        const { data: tests, error: tErr } = await supabase
          .from('tests')
          .select('*, predictions(*, shap_explanations(*))')
          .eq('user_id', filters.id)
          .order('started_at', { ascending: true });

        if (tErr || !tests?.length) {
          return NextResponse.json({
            ...profile,
            historial: [],
            shap: [],
            riesgo: 'Sin test',
          });
        }

        const historial = tests
          .filter((t) => t.status === 'completado' && t.predictions)
          .map((t) => ({
            fecha: new Date(t.completed_at || t.started_at).toISOString().split('T')[0],
            ansiedad: t.predictions.prob_ansiedad,
            depresion: t.predictions.prob_depresion,
            tac: t.predictions.tac_score,
          }));

        const latestTest = tests[tests.length - 1];
        const latestPred = latestTest.predictions as TestPrediction | undefined;

        return NextResponse.json({
          id: profile.id,
          nombre: profile.nombre,
          apellido: profile.apellido,
          email: profile.email,
          facultad: profile.facultad,
          carrera: profile.carrera,
          edad: profile.edad,
          ultimo_test: latestTest.completed_at || latestTest.started_at,
          riesgo: riskFromPrediction(latestPred),
          prob_ansiedad: latestPred?.prob_ansiedad ?? 0,
          prob_depresion: latestPred?.prob_depresion ?? 0,
          tac_score: latestPred?.tac_score ?? 100,
          historial,
          shap: (latestPred as { shap_explanations?: unknown[] } | undefined)?.shap_explanations ?? [],
        });
      } catch {
        const mockStudent = MOCK_ESTUDIANTES.find((e) => e.id === filters.id);
        if (mockStudent) return NextResponse.json(mockStudent);
        return notFound('Estudiante no encontrado');
      }
    }

    try {
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
      if (pErr || !profiles?.length) throw new Error('No profiles in DB');

      const studentList = [];
      for (const p of profiles) {
        const { data: tests } = await supabase
          .from('tests')
          .select('*, predictions(*)')
          .eq('user_id', p.id)
          .order('started_at', { ascending: false });

        const latestTest = tests?.[0];
        const latestPred = latestTest?.predictions as TestPrediction | undefined;

        studentList.push({
          id: p.id,
          nombre: p.nombre,
          apellido: p.apellido,
          email: p.email,
          facultad: p.facultad,
          carrera: p.carrera,
          edad: p.edad,
          ultimo_test: latestTest ? latestTest.completed_at || latestTest.started_at : null,
          riesgo: latestTest ? riskFromPrediction(latestPred) : 'Sin test',
          prob_ansiedad: latestPred?.prob_ansiedad ?? 0,
          prob_depresion: latestPred?.prob_depresion ?? 0,
          tac_score: latestPred?.tac_score ?? 100,
        });
      }

      return NextResponse.json(filterStudents(studentList, filters));
    } catch {
      return NextResponse.json(filterStudents(MOCK_ESTUDIANTES, filters));
    }
  } catch {
    return internalError();
  }
}
