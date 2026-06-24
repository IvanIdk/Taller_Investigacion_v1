import { supabase } from '@/lib/supabase';
import { aggregateAdminStats } from '@/lib/admin/aggregateStats';
import { withDbFallback } from '@/lib/api/withDbFallback';
import { requireApiRole } from '@/lib/api/routeAuth';
import { internalError } from '@/lib/api/errors';
import { RISK_COLORS } from '@/lib/constants/risk';
import type { AdminStats } from '@/lib/types/domain';

const MOCK_STATS: AdminStats = {
  total_tests: 184,
  distribucion_riesgo: [
    { name: 'Alto', value: 34, color: RISK_COLORS.Alto },
    { name: 'Medio', value: 58, color: RISK_COLORS.Medio },
    { name: 'Bajo', value: 92, color: RISK_COLORS.Bajo },
  ],
  promedios_facultad: [
    { name: 'Ingeniería', ansiedad: 0.48, depresion: 0.42, total: 60 },
    { name: 'Ciencias de la Salud', ansiedad: 0.62, depresion: 0.55, total: 42 },
    { name: 'Derecho', ansiedad: 0.38, depresion: 0.31, total: 38 },
    { name: 'Empresa', ansiedad: 0.45, depresion: 0.44, total: 44 },
  ],
  promedios_carrera: [
    { name: 'Ing. de Sistemas', ansiedad: 0.52, depresion: 0.45 },
    { name: 'Psicología', ansiedad: 0.58, depresion: 0.52 },
    { name: 'Medicina Humana', ansiedad: 0.72, depresion: 0.68 },
    { name: 'Derecho', ansiedad: 0.38, depresion: 0.31 },
    { name: 'Administración', ansiedad: 0.44, depresion: 0.46 },
    { name: 'Ing. Civil', ansiedad: 0.42, depresion: 0.38 },
  ],
  promedios_edad: [
    { name: '17-18 años', ansiedad: 0.56, depresion: 0.52, total: 45 },
    { name: '19-20 años', ansiedad: 0.49, depresion: 0.43, total: 72 },
    { name: '21-22 años', ansiedad: 0.43, depresion: 0.38, total: 48 },
    { name: '23+ años', ansiedad: 0.38, depresion: 0.35, total: 19 },
  ],
  ranking_prevalencia: [
    { rank: 1, carrera: 'Medicina Humana', prevalencia: '74.5%', facultad: 'Ciencias de la Salud', total_tests: 18 },
    { rank: 2, carrera: 'Psicología', prevalencia: '58.0%', facultad: 'Ciencias de la Salud', total_tests: 24 },
    { rank: 3, carrera: 'Ingeniería de Sistemas', prevalencia: '52.4%', facultad: 'Ingeniería', total_tests: 35 },
    { rank: 4, carrera: 'Administración', prevalencia: '48.2%', facultad: 'Empresa', total_tests: 28 },
    { rank: 5, carrera: 'Ingeniería Civil', prevalencia: '41.5%', facultad: 'Ingeniería', total_tests: 25 },
  ],
  alertas_pendientes: 12,
};

export async function GET(req: Request) {
  const auth = await requireApiRole(req, ['admin']);
  if (!auth.ok) return auth.response;

  try {
    return await withDbFallback(async () => {
      const { data: tests, error } = await supabase
        .from('tests')
        .select(`
          id,
          completed_at,
          status,
          user_id,
          predictions(prob_ansiedad, prob_depresion, tac_score),
          profiles:profiles(id, facultad, carrera, edad)
        `)
        .eq('status', 'completado');

      if (error || !tests?.length) {
        throw new Error('No tests in DB to aggregate');
      }

      return aggregateAdminStats(tests);
    }, MOCK_STATS);
  } catch {
    return internalError('Error agregando estadísticas');
  }
}
