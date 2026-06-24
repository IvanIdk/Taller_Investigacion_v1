MOCKS — Sistema de Diagnóstico Predictivo Adaptativo (CAT)
Universidad Continental
============================================================

Esta carpeta centraliza datos de prueba y fallback para desarrollo,
demos y pruebas automatizadas (Vitest / pytest / Playwright).

Los mismos datos se usan en las API routes cuando Supabase no está
disponible (withDbFallback y catch blocks).

ARCHIVOS
--------
  users.json         Usuarios admin, psicólogo y estudiantes
  profiles.json      Perfiles demo para QuickLogin (localStorage)
  questions.json     Banco IRT: 20 CAT + 4 TAC (parámetros a, b, c)
  estudiantes.json   Panel psicólogo: lista + historial + SHAP
  citas.json         Citas de contención (pendiente/confirmada/realizada)
  admin-stats.json   Estadísticas agregadas del dashboard admin
  predictions.json   Respuestas de ejemplo POST /api/predict
  test-rows.json     Filas Supabase para probar aggregateAdminStats
  answers.json       Payloads de respuestas CAT para pruebas unitarias

USO EN TESTS (TypeScript)
-------------------------
  import stats from '../../mocks/admin-stats.json';
  import { filterStudents } from '@/lib/students/filters';
  import estudiantes from '../../mocks/estudiantes.json';

USO EN TESTS (Python)
---------------------
  import json
  from pathlib import Path
  MOCKS = Path(__file__).parent.parent / 'mocks'
  predictions = json.loads((MOCKS / 'predictions.json').read_text())

SINCRONIZACIÓN
--------------
Si modificas mocks en las API routes, actualiza también estos JSON
para mantener consistencia en pruebas.
