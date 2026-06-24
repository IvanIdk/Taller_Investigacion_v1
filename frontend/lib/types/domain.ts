export type AppRole = 'admin' | 'psicologo' | 'estudiante';

export interface ShapValue {
  feature_name: string;
  attribution: number;
}

export interface PredictionResult {
  prob_ansiedad: number;
  prob_depresion: number;
  tac_score: number;
  shap_values: ShapValue[];
  early_stop?: boolean;
  model_type?: string;
}

export interface Profile {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  facultad: string;
  carrera: string;
  edad: number;
  role?: AppRole;
}

export type UserProfile = Profile;

export interface TestPrediction {
  prob_ansiedad: number;
  prob_depresion: number;
  tac_score?: number;
}

export interface AdminStats {
  total_tests: number;
  distribucion_riesgo: { name: string; value: number; color: string }[];
  promedios_facultad: { name: string; ansiedad: number; depresion: number; total: number }[];
  promedios_carrera: { name: string; ansiedad: number; depresion: number; total?: number }[];
  promedios_edad: { name: string; ansiedad: number; depresion: number; total: number }[];
  ranking_prevalencia: {
    rank: number;
    carrera: string;
    prevalencia: string;
    facultad: string;
    total_tests: number;
  }[];
  alertas_pendientes: number;
}

export interface SupabaseRoleRow {
  user_id: string;
  roles: { nombre: AppRole } | { nombre: AppRole }[] | null;
}

export function roleFromSupabaseRow(roles: SupabaseRoleRow['roles']): AppRole | null {
  if (!roles) return null;
  if (Array.isArray(roles)) return roles[0]?.nombre ?? null;
  return roles.nombre ?? null;
}
