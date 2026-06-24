export const LIKERT_OPTIONS = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Varios días' },
  { value: 2, label: 'Más de la mitad de los días' },
  { value: 3, label: 'Casi todos los días' },
] as const;

export const DEFAULT_QUESTION_OPTIONS = LIKERT_OPTIONS.map((o) => o.label);
