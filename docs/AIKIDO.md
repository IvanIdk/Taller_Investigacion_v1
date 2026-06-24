# Aikido — seguridad y calidad del código

Este repositorio está conectado en Aikido:

**[Repositorio en Aikido](https://app.aikido.dev/repositories/2218116)**

Aikido analiza el código en la nube (sin clonar manualmente el escáner en cada máquina) y cubre, entre otros:

- **SCA** — dependencias vulnerables (`package-lock.json`, `requirements.txt`)
- **SAST** — patrones inseguros en TypeScript y Python
- **Secrets** — claves o tokens en el historial de commits
- **Licencias** — uso de paquetes con licencias restrictivas
- **IaC** — si añades Terraform o similares

## Qué hacer en el panel de Aikido

### 1. Primer escaneo (ya en marcha al conectar)

Tras conectar el repo, Aikido lanza un escaneo automático. Revisa resultados en la pestaña **Activity** del repositorio.

### 2. Code Quality en pull requests (recomendado)

Para reglas de código limpio (duplicación, complejidad, malas prácticas) en cada PR:

1. En Aikido → **Code Quality** → **Configure Repositories**
2. Activa este repositorio y habilita **Code Quality**
3. Elige si solo comenta en el PR o también **bloquea el merge** (quality gate)
4. Ajusta reglas en **Code Quality Checks** (TypeScript, Python, etc.)

El primer escaneo de calidad se dispara al **abrir o actualizar un pull request** en GitHub.

### 3. PR gating (opcional)

En **Integrations** → **GitHub CI** puedes instalar la app **Aikido PR Checks** para bloquear merges con hallazgos críticos sin gastar minutos extra de Actions.

### 4. SonarQube dentro de Aikido (opcional)

Si más adelante usas SonarCloud o SonarQube, puedes enlazarlo en Aikido para ver hallazgos Sonar triageados en el mismo panel. La configuración local sigue en [SONARQUBE.md](./SONARQUBE.md).

## Cómo encaja con este proyecto

| Capa | Herramienta | Estado en el repo |
|------|-------------|-------------------|
| Seguridad / dependencias | **Aikido** (conectado) | Escaneo automático en `app.aikido.dev` |
| Calidad en PR | **Aikido Code Quality** | Activar en el panel del repo |
| Lint local / CI | ESLint + Ruff | `frontend`: `npm run lint`, `backend`: `ruff check .` |
| Sonar (opcional) | SonarCloud + `sonar-project.properties` | Workflow `.github/workflows/sonar.yml` |

El refactor de código compartido (`lib/risk`, `lib/api/*`, módulos en `backend/`) reduce duplicación y facilita que Aikido y Sonar reporten menos deuda técnica.

## Buenas prácticas para este monorepo

- No subir `.env` ni claves reales (ya están en `.gitignore`)
- Mantener `NEXT_PUBLIC_*` solo para valores públicos (Supabase anon key, URL del backend)
- En demo, `x-demo-role` solo en desarrollo (`lib/api/routeAuth.ts`)
- Tras cambios grandes, abre un PR para que Aikido comente en el diff

## Enlaces

- [Repositorio del proyecto en Aikido](https://app.aikido.dev/repositories/2218116)
- [Conectar repositorios (docs Aikido)](https://help.aikido.dev/getting-started/setting-up-your-account/create-account-and-connect-your-repositories)
- [Code Quality Setup](https://help.aikido.dev/code-quality/code-quality-setup)
