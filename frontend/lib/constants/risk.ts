export type RiskLevel = 'Alto' | 'Medio' | 'Bajo' | 'Sin test';

export const RISK_THRESHOLDS = {
  high: 0.75,
  medium: 0.4,
} as const;

export const RISK_COLORS = {
  Alto: '#EF4444',
  Medio: '#F59E0B',
  Bajo: '#10B981',
} as const;
