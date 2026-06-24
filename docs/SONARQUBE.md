# Análisis de calidad con SonarQube / SonarCloud

> **Nota:** El repositorio principal de validación en la nube es **[Aikido](https://app.aikido.dev/repositories/2218116)**. Ver [AIKIDO.md](./AIKIDO.md). SonarCloud es opcional y puede integrarse con Aikido si lo necesitas.

Este proyecto incluye configuración para validar código limpio, factorizado y sin duplicación crítica.

## Requisitos

- Cuenta en [SonarCloud](https://sonarcloud.io) (recomendado para GitHub) **o** servidor SonarQube local
- Token `SONAR_TOKEN` con permisos de análisis

## Análisis en CI (GitHub Actions)

El workflow `.github/workflows/sonar.yml` ejecuta en cada push/PR:

1. `npm run lint` en `frontend/`
2. `ruff check` en `backend/`
3. Escaneo SonarCloud

### Secrets y variables en GitHub

| Nombre | Tipo | Descripción |
|--------|------|-------------|
| `SONAR_TOKEN` | Secret | Token de SonarCloud |
| `SONAR_ORGANIZATION` | Variable | Organización en SonarCloud |
| `SONAR_PROJECT_KEY` | Variable (opcional) | Por defecto: `sistema-prediccion-uc` |

Crear el proyecto en SonarCloud con la misma clave que `sonar.projectKey` en `sonar-project.properties`.

## Análisis local con Docker

```bash
docker run -d --name sonarqube -p 9000:9000 sonarqube:lts-community
```

Tras iniciar sesión en `http://localhost:9000`, generar un token y ejecutar:

```bash
docker run --rm \
  -e SONAR_HOST_URL="http://host.docker.internal:9000" \
  -e SONAR_TOKEN="tu_token" \
  -v "%cd%:/usr/src" \
  sonarsource/sonar-scanner-cli
```

En Windows PowerShell, sustituir `%cd%` por la ruta absoluta del repositorio.

## Estructura de calidad del código

| Área | Mejora aplicada |
|------|-----------------|
| Frontend API | `lib/api/errors.ts`, `withDbFallback`, `routeAuth` |
| Riesgo clínico | `lib/risk.ts` + `lib/constants/risk.ts` (único umbral 0.75 / 0.40) |
| Estadísticas admin | `lib/admin/aggregateStats.ts` |
| Filtros estudiantes | `lib/students/filters.ts` |
| Auth páginas | `lib/hooks/useRequireRole.ts` |
| Backend ML | Módulos `constants`, `data_generator`, `ml_service`, `schemas` |

## Quality Gate recomendado

En SonarCloud, activar reglas para:

- Duplicación de código &lt; 3%
- Cobertura de tests &gt; 60% (añadir tests progresivamente)
- 0 vulnerabilidades y 0 bugs bloqueantes
- Deuda técnica razonable en archivos &gt; 300 LOC

## Próximos pasos

1. ~~Añadir tests unitarios (`lib/risk.ts`, `aggregateStats.ts`, `data_generator.py`)~~ — ver [PRUEBAS.md](./PRUEBAS.md)
2. ~~Generar cobertura: `npm test -- --coverage` y enlazar `lcov.info` en Sonar~~ — configurado en CI
3. Conectar el repositorio en SonarCloud y ejecutar el primer análisis en `main`
