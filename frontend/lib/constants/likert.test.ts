import { describe, expect, it } from 'vitest';

import { LIKERT_OPTIONS } from '@/lib/constants/likert';

describe('LIKERT_OPTIONS', () => {
  it('CON-03: escala Likert 0–3 con 4 opciones', () => {
    expect(LIKERT_OPTIONS).toHaveLength(4);
    expect(LIKERT_OPTIONS.map((o) => o.value)).toEqual([0, 1, 2, 3]);
    expect(LIKERT_OPTIONS.every((o) => o.label.length > 0)).toBe(true);
  });
});
