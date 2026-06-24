import { describe, expect, it } from 'vitest';

import { RISK_COLORS, RISK_THRESHOLDS } from '@/lib/constants/risk';
import { getRiskDisplay, getRiskLevel, maxProbability } from '@/lib/risk';

describe('maxProbability', () => {
  it('RSK-01: retorna el máximo entre ansiedad y depresión', () => {
    expect(maxProbability(0.6, 0.9)).toBe(0.9);
    expect(maxProbability(0.9, 0.6)).toBe(0.9);
  });
});

describe('getRiskLevel', () => {
  it('RSK-02: clasifica Alto cuando max >= 0.75', () => {
    expect(getRiskLevel(0.8, 0.3)).toBe('Alto');
  });

  it('RSK-03: clasifica Medio en rango 0.4–0.74', () => {
    expect(getRiskLevel(0.55, 0.3)).toBe('Medio');
  });

  it('RSK-04: clasifica Bajo cuando max < 0.4', () => {
    expect(getRiskLevel(0.15, 0.18)).toBe('Bajo');
  });

  it('RSK-08: umbral exacto 0.75 es Alto', () => {
    expect(getRiskLevel(0.75, 0.1)).toBe('Alto');
  });
});

describe('getRiskDisplay', () => {
  it('RSK-05: badge Riesgo Crítico', () => {
    const d = getRiskDisplay(0.96, 0.88);
    expect(d.badge).toBe('Riesgo Crítico');
  });

  it('RSK-06: badge Riesgo Moderado', () => {
    const d = getRiskDisplay(0.55, 0.3);
    expect(d.badge).toBe('Riesgo Moderado');
  });

  it('RSK-07: badge Bajo Riesgo', () => {
    const d = getRiskDisplay(0.15, 0.18);
    expect(d.badge).toBe('Bajo Riesgo');
  });
});

describe('RISK_THRESHOLDS', () => {
  it('CON-01: umbrales clínicos definidos', () => {
    expect(RISK_THRESHOLDS.high).toBe(0.75);
    expect(RISK_THRESHOLDS.medium).toBe(0.4);
  });

  it('CON-02: colores por nivel de riesgo', () => {
    expect(RISK_COLORS.Alto).toBeTruthy();
    expect(RISK_COLORS.Medio).toBeTruthy();
    expect(RISK_COLORS.Bajo).toBeTruthy();
  });
});
