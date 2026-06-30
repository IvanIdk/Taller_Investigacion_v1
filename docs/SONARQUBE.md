# Análisis de calidad con SonarQube / SonarCloud

> **Nota:** El repositorio también usa **[Aikido](https://app.aikido.dev/repositories/2218116)** (SCA, SAST, secretos). Ver [AIKIDO.md](./AIKIDO.md). SonarCloud complementa con cobertura, duplicación y deuda técnica.

Este proyecto incluye configuración para validar código limpio, factorizado y con cobertura de pruebas trazable a ISO 29119.

## Cobertura actual (local)

| Área | Herramienta | Cobertura líneas | Reporte |
|------|-------------|------------------|---------|
| `frontend/lib/` | Vitest + v8 | ~87% | `frontend/coverage/lcov.info` |
| `backend/` | pytest-cov | ~98% | `backend/coverage.xml` |

Ejecutar antes de push:

```bash
cd frontend && npm run test:coverage
cd backend  && pytest --cov=. --cov-report=xml:coverage.xml
```

## Requisitos

- Cuenta en [SonarCloud](https://sonarcloud.io) (recomendado para GitHub) **o** servidor SonarQube local
- Token `SONAR_TOKEN` con permisos de análisis

## Análisis en CI (GitHub Actions)

El workflow `.github/workflows/sonar.yml` ejecuta en cada push/PR a `main`, `master`, `develop`:

1. `npm ci` + `npm run lint` (frontend)
2. `npm run test:coverage` → genera `lcov.info`
3. `ruff check` (backend)
4. `pytest --cov` → genera `coverage.xml`
5. Escaneo SonarCloud

### Secrets y variables en GitHub

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `SONAR_TOKEN` | Secret | Token de SonarCloud |
| `SONAR_ORGANIZATION` | Variable | Organización en SonarCloud |
| `SONAR_PROJECT_KEY` | Variable (opcional) | Por defecto: `sistema-prediccion-uc` |

Crear el proyecto en SonarCloud con la misma clave que `sonar.projectKey` en `sonar-project.properties`.

### Primer análisis (checklist)

1. Crear proyecto `sistema-prediccion-uc` en SonarCloud
2. Añadir `SONAR_TOKEN` y `SONAR_ORGANIZATION` en GitHub → Settings → Secrets and variables
3. Push a `main` o abrir PR — el workflow sube cobertura automáticamente
4. En SonarCloud → Quality Gate: activar condiciones de la tabla siguiente

## Quality Gate recomendado (ISO 25010 / 29119)

Configurar en SonarCloud → **Quality Gates**:

| Condición | Umbral | Justificación |
|-----------|--------|---------------|
| Cobertura en código nuevo | ≥ 60% | Objetivo incremental SQuaRE |
| Duplicación | < 3% | Mantenibilidad |
| Bugs | 0 bloqueantes | Fiabilidad |
| Vulnerabilidades | 0 bloqueantes | ISO 27001 |
| Code smells | Aceptable en archivos < 300 LOC | Deuda técnica controlada |
| Security Hotspots | Revisados | Aikido + Sonar |

Archivos con refactor aplicado (menor duplicación):

| Área | Módulos |
|------|---------|
| Frontend API | `lib/api/errors.ts`, `withDbFallback`, `routeAuth` |
| Riesgo clínico | `lib/risk.ts` + `lib/constants/risk.ts` |
| Estadísticas admin | `lib/admin/aggregateStats.ts` |
| Filtros estudiantes | `lib/students/filters.ts` |
| Auth páginas | `lib/hooks/useRequireRole.ts` |
| Backend ML | `constants`, `data_generator`, `ml_service`, `schemas` |

## Configuración del proyecto

`sonar-project.properties`:

- **Fuentes:** `frontend/`, `backend/`
- **Exclusiones:** `node_modules`, `.next`, modelos entrenados, `supabase/`
- **Tests:** `**/*.test.ts`, `backend/tests/test_*.py`
- **Cobertura TS:** `frontend/coverage/lcov.info`
- **Cobertura Python:** `backend/coverage.xml`
- **Quality profile:** Sonar way (TypeScript + Python)

## Análisis local con Docker

```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
```

Tras iniciar sesión en `http://localhost:9000`, generar un token y ejecutar:

```powershell
# PowerShell — sustituir la ruta por la del repositorio
docker run --rm `
  -e SONAR_HOST_URL="http://host.docker.internal:9000" `
  -e SONAR_TOKEN="tu_token" `
  -v "c:\Sistema_prediccion:/usr/src" `
  sonarsource/sonar-scanner-cli
```

## Trazabilidad pruebas → Sonar

Ver [PRUEBAS.md](./PRUEBAS.md) para casos ID (CAT-*, RSK-*, ML-*, PRF-*) y matriz requisito→prueba.

## Próximos pasos

1. Conectar SonarCloud y ejecutar primer análisis en `main`
2. Subir umbral de cobertura a 70% cuando existan pruebas `/api/*` y E2E
3. Añadir pruebas `routeAuth.ts` y `withDbFallback.ts` (plan DBF-*, AUT-*)
