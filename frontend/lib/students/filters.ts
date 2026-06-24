export interface StudentListItem {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  facultad: string;
  carrera: string;
  edad: number;
  riesgo: string;
}

export interface StudentFilters {
  search: string;
  facultad: string;
  carrera: string;
  riesgo: string;
}

export function filterStudents<T extends StudentListItem>(
  students: T[],
  filters: StudentFilters
): T[] {
  const search = filters.search.toLowerCase();

  return students.filter((s) => {
    const matchesSearch =
      !search ||
      s.nombre.toLowerCase().includes(search) ||
      s.apellido.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search);

    const matchesFacultad = !filters.facultad || s.facultad === filters.facultad;
    const matchesCarrera = !filters.carrera || s.carrera === filters.carrera;
    const matchesRiesgo = !filters.riesgo || s.riesgo === filters.riesgo;

    return matchesSearch && matchesFacultad && matchesCarrera && matchesRiesgo;
  });
}
