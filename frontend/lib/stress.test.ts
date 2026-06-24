import { describe, expect, it } from 'vitest';

import { filterStudents, type StudentListItem } from '@/lib/students/filters';
import { aggregateAdminStats } from '@/lib/admin/aggregateStats';

function buildStudents(n: number): StudentListItem[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `est-${i}`,
    nombre: `Estudiante${i}`,
    apellido: 'Demo',
    email: `user${i}@continental.edu.pe`,
    facultad: i % 2 === 0 ? 'Ingeniería' : 'Derecho',
    carrera: i % 3 === 0 ? 'Psicología' : 'Sistemas',
    edad: 17 + (i % 6),
    riesgo: i % 4 === 0 ? 'Alto' : 'Bajo',
  }));
}

function buildTestRows(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    predictions: {
      prob_ansiedad: 0.2 + (i % 10) * 0.05,
      prob_depresion: 0.15 + (i % 8) * 0.04,
      tac_score: 100,
    },
    profiles: {
      facultad: 'Facultad',
      carrera: `Carrera-${i % 20}`,
      edad: 18 + (i % 5),
    },
  }));
}

describe('stress: filtros de estudiantes', () => {
  it('PRF-03: filtra 5000 estudiantes en < 500 ms', () => {
    const students = buildStudents(5000);
    const start = performance.now();
    const result = filterStudents(students, {
      search: 'estudiante1',
      facultad: 'Ingeniería',
      carrera: '',
      riesgo: 'Alto',
    });
    const elapsed = performance.now() - start;
    expect(result.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(500);
  });
});

describe('stress: agregación admin', () => {
  it('PRF-03: agrega 1000 tests en < 2 s', () => {
    const rows = buildTestRows(1000);
    const start = performance.now();
    const stats = aggregateAdminStats(rows);
    const elapsed = performance.now() - start;
    expect(stats.total_tests).toBe(1000);
    expect(elapsed).toBeLessThan(2000);
  });
});
