import { describe, expect, it } from 'vitest';

import { filterStudents, type StudentListItem } from '@/lib/students/filters';
import estudiantes from '../../../mocks/estudiantes.json';

const students = estudiantes as StudentListItem[];

describe('filterStudents', () => {
  it('FLT-01: sin filtros devuelve todos', () => {
    const result = filterStudents(students, { search: '', facultad: '', carrera: '', riesgo: '' });
    expect(result).toHaveLength(students.length);
  });

  it('FLT-02: filtra por nombre', () => {
    const result = filterStudents(students, {
      search: 'sofía',
      facultad: '',
      carrera: '',
      riesgo: '',
    });
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Sofía');
  });

  it('FLT-03: filtra por email', () => {
    const result = filterStudents(students, {
      search: '72109845',
      facultad: '',
      carrera: '',
      riesgo: '',
    });
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Juan Carlos');
  });

  it('FLT-04: filtra por facultad', () => {
    const result = filterStudents(students, {
      search: '',
      facultad: 'Derecho',
      carrera: '',
      riesgo: '',
    });
    expect(result.every((s) => s.facultad === 'Derecho')).toBe(true);
  });

  it('FLT-05: filtra por carrera', () => {
    const result = filterStudents(students, {
      search: '',
      facultad: '',
      carrera: 'Psicología',
      riesgo: '',
    });
    expect(result.every((s) => s.carrera === 'Psicología')).toBe(true);
  });

  it('FLT-06: filtra por riesgo', () => {
    const result = filterStudents(students, {
      search: '',
      facultad: '',
      carrera: '',
      riesgo: 'Alto',
    });
    expect(result.every((s) => s.riesgo === 'Alto')).toBe(true);
  });

  it('FLT-07: combina búsqueda y facultad', () => {
    const result = filterStudents(students, {
      search: 'sofía',
      facultad: 'Ciencias de la Salud',
      carrera: '',
      riesgo: '',
    });
    expect(result).toHaveLength(1);
  });

  it('FLT-08: sin coincidencias devuelve vacío', () => {
    const result = filterStudents(students, {
      search: 'xyz999',
      facultad: '',
      carrera: '',
      riesgo: '',
    });
    expect(result).toHaveLength(0);
  });
});
