import { describe, expect, it } from 'vitest';

import { aggregateAdminStats } from '@/lib/admin/aggregateStats';
import testRows from '../../../mocks/test-rows.json';

describe('aggregateAdminStats', () => {
  it('ADM-01: total_tests refleja filas de entrada', () => {
    const stats = aggregateAdminStats(testRows);
    expect(stats.total_tests).toBe(4);
  });

  it('ADM-02: distribución de riesgo alto/medio/bajo', () => {
    const stats = aggregateAdminStats(testRows);
    const byName = Object.fromEntries(stats.distribucion_riesgo.map((d) => [d.name, d.value]));
    expect(byName.Alto).toBe(2);
    expect(byName.Medio).toBe(1);
    expect(byName.Bajo).toBe(1);
  });

  it('ADM-05: ranking_prevalencia máximo 5 entradas', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      predictions: { prob_ansiedad: 0.5 + i * 0.01, prob_depresion: 0.4, tac_score: 100 },
      profiles: { facultad: 'F', carrera: `Carrera-${i}`, edad: 20 },
    }));
    const stats = aggregateAdminStats(many);
    expect(stats.ranking_prevalencia.length).toBeLessThanOrEqual(5);
  });

  it('ADM-06: alertas_pendientes cuenta riesgo alto', () => {
    const stats = aggregateAdminStats(testRows);
    expect(stats.alertas_pendientes).toBe(2);
  });

  it('ADM-07: normaliza predictions como array', () => {
    const stats = aggregateAdminStats(testRows);
    expect(stats.total_tests).toBe(4);
    expect(stats.promedios_facultad.length).toBeGreaterThan(0);
  });

  it('ADM-08: omite filas sin predicción del conteo de riesgo', () => {
    const rows = [
      ...testRows,
      { predictions: null, profiles: { facultad: 'X', carrera: 'Y', edad: 20 } },
    ];
    const stats = aggregateAdminStats(rows);
    expect(stats.total_tests).toBe(5);
    const totalRiesgo = stats.distribucion_riesgo.reduce((s, d) => s + d.value, 0);
    expect(totalRiesgo).toBe(4);
  });
});
