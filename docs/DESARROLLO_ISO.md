# Desarrollo alineado a normas ISO

Mapeo de las normas exigidas al ciclo de vida del **Sistema de Diagnóstico Predictivo Adaptativo (CAT)** — UC.

---

## ISO 9001 — Gestión de la calidad

| Requisito ISO 9001 | Evidencia en el proyecto |
|--------------------|--------------------------|
| Planificación documentada | `planificacion/`, `docs/ESTRUCTURA_PROYECTO.md` |
| Trazabilidad requisito → implementación | Matriz en `planificacion/plan-de-pruebas.txt` §10 |
| Control de cambios | Git + PRs; Aikido en cada PR |
| Mejora continua | SonarCloud Quality Gate, deuda técnica en `docs/SONARQUBE.md` |
| Revisión de entregables | Checklist UAT §8 en plan de pruebas |

---

## ISO/IEC 25000 (SQuaRE) — Calidad del producto software

| Característica | Implementación |
|----------------|----------------|
| **Funcionalidad** | CAT IRT, ML Random Forest, roles, citas, panel admin |
| **Fiabilidad** | Fallback mock sin Supabase/FastAPI (`withDbFallback`, mocks/) |
| **Usabilidad** | UI por rol, QuickLogin demo, responsive Tailwind |
| **Eficiencia** | Parada temprana 95%, pruebas de estrés PRF-01..05 |
| **Mantenibilidad** | Módulos `lib/`, backend separado en `constants`, `ml_service`, `schemas` |
| **Portabilidad** | Next.js + Vercel, FastAPI independiente |
| **Seguridad** | Middleware roles, `routeAuth`, Aikido SCA/SAST |

Métricas objetivo (SonarCloud): cobertura ≥ 60%, 0 bugs bloqueantes, duplicación < 3%.

---

## ISO/IEC/IEEE 29119 — Pruebas de software

| Fase 29119 | Artefacto |
|------------|-----------|
| Política / estrategia | `planificacion/plan-de-pruebas.txt` §2 |
| Plan de pruebas | Mismo archivo — casos ID CAT-*, RSK-*, ML-*, E2E-* |
| Diseño de casos | Secciones 3–7 del plan |
| Ejecución automatizada | `docs/PRUEBAS.md` — 43 tests TS + 23 tests Py |
| Informe de resultados | CI GitHub Actions + cobertura lcov/coverage.xml |
| Trazabilidad | `docs/PRUEBAS.md` §6, plan §10 |

**Implementado:** unitarias, integración API backend, estrés.  
**Pendiente (fase 2):** E2E Playwright, pruebas componentes React, rutas `/api/*`.

---

## ISO/IEC 27001 — Seguridad de la información

| Control | Medida |
|---------|--------|
| Gestión de secretos | `.gitignore` para `.env`; variables `NEXT_PUBLIC_*` solo públicas |
| Análisis de vulnerabilidades | [Aikido](https://app.aikido.dev/repositories/2218116) — SCA, SAST, secretos |
| Control de acceso | Roles estudiante/psicólogo/admin; middleware Next.js |
| Autenticación API | `lib/api/routeAuth.ts` — Bearer Supabase + demo dev |
| Despliegue seguro | HTTPS Vercel; anon key Supabase (no service role en frontend) |

Documentación: `docs/AIKIDO.md`.

---

## Herramientas IA en el desarrollo

| Herramienta | Uso en el proyecto |
|-------------|-------------------|
| **Cursor** | Reglas en `.cursor/rules/`; contexto en `docs/ESTRUCTURA_PROYECTO.md` |
| **Aikido** | Seguridad y calidad en PR |
| **SonarCloud** | Cobertura, duplicación, quality gate |
| **GitHub Actions** | Pipeline unificado `.github/workflows/sonar.yml` |

---

## Checklist de cumplimiento

- [x] Estado del arte documentado e indexado
- [x] Plan de pruebas formal (29119)
- [x] Diseño de interfaz documentado
- [x] Desarrollo con controles de calidad y seguridad
- [x] Suite automatizada + CI SonarCloud
- [ ] E2E Playwright (opcional fase 2)
- [ ] Conectar primer análisis SonarCloud en `main` (requiere token en GitHub)
