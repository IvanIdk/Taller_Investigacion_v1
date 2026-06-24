import { RISK_COLORS } from '@/lib/constants/risk';
import { getRiskLevel } from '@/lib/risk';
import type { AdminStats, TestPrediction } from '@/lib/types/domain';

interface TestRow {
  predictions: TestPrediction | TestPrediction[] | null;
  profiles:
    | { facultad?: string; carrera?: string; edad?: number }
    | { facultad?: string; carrera?: string; edad?: number }[]
    | null;
}

function normalizePrediction(pred: TestRow['predictions']): TestPrediction | null {
  if (!pred) return null;
  if (Array.isArray(pred)) return pred[0] ?? null;
  return pred;
}

function normalizeProfile(
  prof: TestRow['profiles']
): { facultad?: string; carrera?: string; edad?: number } | null {
  if (!prof) return null;
  if (Array.isArray(prof)) return prof[0] ?? null;
  return prof;
}

export function aggregateAdminStats(tests: TestRow[]): AdminStats {
  let alto = 0;
  let medio = 0;
  let bajo = 0;

  const facMap: Record<string, { ans: number; dep: number; count: number }> = {};
  const carMap: Record<string, { ans: number; dep: number; count: number }> = {};
  const ageMap: Record<string, { ans: number; dep: number; count: number }> = {
    '17-18 años': { ans: 0, dep: 0, count: 0 },
    '19-20 años': { ans: 0, dep: 0, count: 0 },
    '21-22 años': { ans: 0, dep: 0, count: 0 },
    '23+ años': { ans: 0, dep: 0, count: 0 },
  };

  for (const test of tests) {
    const pred = normalizePrediction(test.predictions);
    const prof = normalizeProfile(test.profiles);
    if (!pred || !prof) continue;

    const level = getRiskLevel(pred.prob_ansiedad, pred.prob_depresion);
    if (level === 'Alto') alto++;
    else if (level === 'Medio') medio++;
    else bajo++;

    const fac = prof.facultad || 'Otra';
    if (!facMap[fac]) facMap[fac] = { ans: 0, dep: 0, count: 0 };
    facMap[fac].ans += pred.prob_ansiedad;
    facMap[fac].dep += pred.prob_depresion;
    facMap[fac].count++;

    const car = prof.carrera || 'Otra';
    if (!carMap[car]) carMap[car] = { ans: 0, dep: 0, count: 0 };
    carMap[car].ans += pred.prob_ansiedad;
    carMap[car].dep += pred.prob_depresion;
    carMap[car].count++;

    const age = prof.edad ?? 20;
    let ageGroup = '23+ años';
    if (age <= 18) ageGroup = '17-18 años';
    else if (age <= 20) ageGroup = '19-20 años';
    else if (age <= 22) ageGroup = '21-22 años';

    ageMap[ageGroup].ans += pred.prob_ansiedad;
    ageMap[ageGroup].dep += pred.prob_depresion;
    ageMap[ageGroup].count++;
  }

  const ranking_prevalencia = Object.entries(carMap)
    .map(([name, v]) => {
      const avgMax = (v.ans + v.dep) / (2 * v.count);
      return {
        carrera: name,
        prevalencia: `${(avgMax * 100).toFixed(1)}%`,
        total_tests: v.count,
        score: avgMax,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item, idx) => ({
      rank: idx + 1,
      carrera: item.carrera,
      prevalencia: item.prevalencia,
      facultad: 'Facultad',
      total_tests: item.total_tests,
    }));

  return {
    total_tests: tests.length,
    distribucion_riesgo: [
      { name: 'Alto', value: alto, color: RISK_COLORS.Alto },
      { name: 'Medio', value: medio, color: RISK_COLORS.Medio },
      { name: 'Bajo', value: bajo, color: RISK_COLORS.Bajo },
    ],
    promedios_facultad: Object.entries(facMap).map(([name, v]) => ({
      name,
      ansiedad: parseFloat((v.ans / v.count).toFixed(2)),
      depresion: parseFloat((v.dep / v.count).toFixed(2)),
      total: v.count,
    })),
    promedios_carrera: Object.entries(carMap).map(([name, v]) => ({
      name,
      ansiedad: parseFloat((v.ans / v.count).toFixed(2)),
      depresion: parseFloat((v.dep / v.count).toFixed(2)),
      total: v.count,
    })),
    promedios_edad: Object.entries(ageMap).map(([name, v]) => ({
      name,
      ansiedad: v.count > 0 ? parseFloat((v.ans / v.count).toFixed(2)) : 0,
      depresion: v.count > 0 ? parseFloat((v.dep / v.count).toFixed(2)) : 0,
      total: v.count,
    })),
    ranking_prevalencia,
    alertas_pendientes: alto,
  };
}
