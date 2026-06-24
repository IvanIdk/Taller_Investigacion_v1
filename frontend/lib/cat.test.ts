import { describe, expect, it } from 'vitest';

import {
  estimateTheta,
  getItemInformation,
  getProbability,
  isTACScheduled,
  selectNextItem,
  selectNextTACItem,
  type IRTQuestion,
  type UserAnswer,
} from '@/lib/cat';

const baseQuestion: Omit<IRTQuestion, 'id' | 'category'> = {
  text: 'Pregunta',
  type: 'cat',
  a: 1,
  b: 0,
  c: 0,
  options: [],
};

describe('getProbability (2PL)', () => {
  it('CAT-01: P ≈ 0.5 en theta=0, b=0', () => {
    expect(getProbability(0, 1, 0, 0)).toBeCloseTo(0.5, 2);
  });

  it('CAT-02: con guessing c=0.25, P >= c', () => {
    expect(getProbability(-5, 1, 0, 0.25)).toBeGreaterThanOrEqual(0.25);
  });
});

describe('estimateTheta', () => {
  const questions: IRTQuestion[] = [
    { ...baseQuestion, id: 1, category: 'ansiedad' },
    { ...baseQuestion, id: 2, category: 'ansiedad', b: 0.5 },
  ];

  it('CAT-03: sin respuestas retorna 0', () => {
    expect(estimateTheta([], questions, 'ansiedad')).toBe(0);
  });

  it('CAT-04: respuestas positivas elevan theta', () => {
    const answers: UserAnswer[] = [
      { question_id: 1, category: 'ansiedad', value: 3 },
      { question_id: 2, category: 'ansiedad', value: 3 },
    ];
    expect(estimateTheta(answers, questions, 'ansiedad')).toBeGreaterThan(0);
  });

  it('CAT-05: respuestas negativas reducen theta', () => {
    const answers: UserAnswer[] = [
      { question_id: 1, category: 'ansiedad', value: 0 },
      { question_id: 2, category: 'ansiedad', value: 0 },
    ];
    expect(estimateTheta(answers, questions, 'ansiedad')).toBeLessThan(0);
  });

  it('CAT-06: límite superior <= 3', () => {
    const answers: UserAnswer[] = Array.from({ length: 5 }, (_, i) => ({
      question_id: i + 1,
      category: 'ansiedad' as const,
      value: 3,
    }));
    const qs = answers.map((a, i) => ({ ...baseQuestion, id: i + 1, category: 'ansiedad' as const }));
    expect(estimateTheta(answers, qs, 'ansiedad')).toBeLessThanOrEqual(3);
  });
});

describe('getItemInformation', () => {
  it('CAT-08: información positiva cerca de b', () => {
    expect(getItemInformation(0, 2, 0.5, 0)).toBeGreaterThan(0);
  });
});

describe('selectNextItem', () => {
  const questions: IRTQuestion[] = [
    { ...baseQuestion, id: 1, category: 'ansiedad', b: -1 },
    { ...baseQuestion, id: 2, category: 'ansiedad', b: 0 },
    { ...baseQuestion, id: 3, category: 'depresion' },
  ];

  it('CAT-09: excluye preguntas ya respondidas', () => {
    const answers: UserAnswer[] = [{ question_id: 1, category: 'ansiedad', value: 2 }];
    const next = selectNextItem(answers, questions, 'ansiedad', 0);
    expect(next?.id).toBe(2);
  });

  it('CAT-11: null si no hay candidatos', () => {
    const answers: UserAnswer[] = [
      { question_id: 1, category: 'ansiedad', value: 2 },
      { question_id: 2, category: 'ansiedad', value: 2 },
    ];
    expect(selectNextItem(answers, questions, 'ansiedad', 0)).toBeNull();
  });
});

describe('TAC scheduling', () => {
  const tacQuestions: IRTQuestion[] = [
    { ...baseQuestion, id: 21, category: 'tac', type: 'tac' },
    { ...baseQuestion, id: 22, category: 'tac', type: 'tac' },
  ];

  it('CAT-12: selectNextTACItem devuelve TAC no respondida', () => {
    const answers: UserAnswer[] = [{ question_id: 21, category: 'tac', value: 0 }];
    const next = selectNextTACItem(answers, tacQuestions);
    expect(next?.id).toBe(22);
  });

  it('CAT-13: isTACScheduled en múltiplos de 4', () => {
    expect(isTACScheduled(4)).toBe(true);
    expect(isTACScheduled(8)).toBe(true);
  });

  it('CAT-14: isTACScheduled fuera de schedule', () => {
    expect(isTACScheduled(3)).toBe(false);
    expect(isTACScheduled(5)).toBe(false);
  });
});
