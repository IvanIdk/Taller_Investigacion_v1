import { RISK_THRESHOLDS, type RiskLevel } from '@/lib/constants/risk';

export function maxProbability(probAnsiedad: number, probDepresion: number): number {
  return Math.max(probAnsiedad, probDepresion);
}

export function getRiskLevel(probAnsiedad: number, probDepresion: number): RiskLevel {
  const maxProb = maxProbability(probAnsiedad, probDepresion);
  if (maxProb >= RISK_THRESHOLDS.high) return 'Alto';
  if (maxProb >= RISK_THRESHOLDS.medium) return 'Medio';
  return 'Bajo';
}

export interface RiskDisplay {
  badge: string;
  className: string;
  recommendation: string;
}

export function getRiskDisplay(probAnsiedad: number, probDepresion: number): RiskDisplay {
  const maxProb = maxProbability(probAnsiedad, probDepresion);

  if (maxProb >= RISK_THRESHOLDS.high) {
    return {
      badge: 'Riesgo Crítico',
      className: 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse',
      recommendation:
        'Se ha identificado un nivel elevado de malestar emocional. Es de suma importancia recibir acompañamiento profesional. Te sugerimos agendar una sesión diagnóstica prioritaria con nuestro equipo de psicología a continuación.',
    };
  }

  if (maxProb >= RISK_THRESHOLDS.medium) {
    return {
      badge: 'Riesgo Moderado',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      recommendation:
        'Presentas algunos indicadores moderados de tensión o cansancio emocional. Te recomendamos revisar nuestras guías de autoayuda cognitivo-conductual y considerar solicitar una cita de consejería preventiva.',
    };
  }

  return {
    badge: 'Bajo Riesgo',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    recommendation:
      'Tu evaluación indica un estado de bienestar emocional óptimo. Continúa manteniendo hábitos saludables y participa de los talleres de mindfulness grupales de Bienestar.',
  };
}
