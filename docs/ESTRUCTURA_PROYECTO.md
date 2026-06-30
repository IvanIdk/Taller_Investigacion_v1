# Estructura del proyecto para herramientas IA (Cursor, Cloud Agents, etc.)

Índice maestro que cumple los cinco bloques exigidos en el Taller de Investigación — Universidad Continental.

| # | Bloque | Ubicación | Estado |
|---|--------|-----------|--------|
| i | Estado del arte | [`Estadado_de_Arte/`](../Estadado_de_Arte/README.md) | ✅ Aplicado |
| ii | Planificación (plan de pruebas) | [`planificacion/plan-de-pruebas.txt`](../planificacion/plan-de-pruebas.txt) | ✅ Plan + ejecución parcial |
| iii | Diseño (mockups) | [`diseno/`](../diseno/README.md) | ✅ Documentado |
| iv | Desarrollo (ISO 9001, 25000, 29119, 27000) | [`docs/DESARROLLO_ISO.md`](./DESARROLLO_ISO.md) | ✅ Marco aplicado |
| v | Mantenimiento (pruebas automatizadas) | [`docs/PRUEBAS.md`](./PRUEBAS.md), [`docs/SONARQUBE.md`](./SONARQUBE.md) | ✅ Implementado |
| — | **Despliegue Vercel** | [`docs/VERCEL.md`](./VERCEL.md) | ⚙️ Root Directory = `frontend` |

---

## i. Estado del arte

Referencias bibliográficas sobre cribado de salud mental universitaria, CAT/IRT y modelos predictivos con ML.

- Carpeta: `Estadado_de_Arte/` (PDFs indexados en su README)
- Relación con el producto: justifica GAD-7/PHQ-9, Random Forest, SHAP y CAT 2PL implementados en el código

## ii. Planificación

| Documento | Contenido |
|-----------|-----------|
| `planificacion/plan-de-pruebas.txt` | Plan maestro ISO 29119: casos, trazabilidad RF→prueba, fases |
| `planificacion/despliegue-vercel.txt` | Plan de despliegue y verificación post-deploy |
| `docs/PRUEBAS.md` | Estado **real** de pruebas automatizadas implementadas |

## iii. Diseño

| Documento | Contenido |
|-----------|-----------|
| `diseno/README.md` | Mapa de pantallas, roles, flujos y componentes UI |
| `frontend/app/` | Implementación Next.js (App Router) |
| `mocks/` | Datos de diseño/demo para pruebas sin Supabase |

## iv. Desarrollo bajo normas ISO

Ver [`docs/DESARROLLO_ISO.md`](./DESARROLLO_ISO.md) para el mapeo detallado:

- **ISO 9001** — procesos de desarrollo, revisión y trazabilidad
- **ISO/IEC 25000 (SQuaRE)** — atributos de calidad del producto software
- **ISO/IEC/IEEE 29119** — estrategia y documentación de pruebas
- **ISO/IEC 27001** — controles de seguridad (Aikido, auth, secretos)

Herramientas de calidad en el repo:

- [Aikido](https://app.aikido.dev/repositories/2218116) — SCA, SAST, secretos
- [SonarCloud](./SONARQUBE.md) — cobertura, duplicación, bugs
- ESLint + Ruff — lint estático local y CI

## v. Mantenimiento

Pruebas automatizadas y pipeline de calidad continua:

```bash
cd frontend && npm run test:coverage   # Vitest → lcov.info
cd backend  && pytest --cov=.          # pytest → coverage.xml
```

Workflow CI: `.github/workflows/sonar.yml` (lint → tests → cobertura → SonarCloud).

---

## Guía rápida para agentes IA

Al trabajar en este repositorio:

1. Leer este archivo primero para ubicar documentación existente
2. No duplicar el plan de pruebas: actualizar `docs/PRUEBAS.md` y la sección de estado en `planificacion/plan-de-pruebas.txt`
3. Cambios de calidad: mantener cobertura en `lib/` y `backend/`; ejecutar lint antes de commit
4. Seguridad: no commitear `.env`; revisar hallazgos de Aikido
5. Mockups nuevos: documentar en `diseno/README.md`

Regla Cursor: `.cursor/rules/proyecto-sistema-prediccion.mdc`
