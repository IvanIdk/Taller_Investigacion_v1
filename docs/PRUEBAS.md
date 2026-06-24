# Pruebas automatizadas — Sistema de Predicción UC

Documentación de las pruebas **implementadas** para calidad de software y Quality Gate de SonarQube. Se aplicaron solo los niveles necesarios para validar la lógica crítica y generar cobertura; no se incluyeron E2E ni pruebas de componentes UI en esta fase.

## Resumen ejecutivo

| Tipo | Herramienta | Ubicación | Objetivo SonarQube |
|------|-------------|-----------|-------------------|
| Unitarias (TS) | Vitest | `frontend/lib/**/*.test.ts` | Cobertura `lib/` → `lcov.info` |
| Unitarias (Py) | pytest | `backend/tests/test_*.py` | Cobertura backend → `coverage.xml` |
| Integración API | pytest + TestClient | `backend/tests/test_api.py` | Endpoints FastAPI |
| Estrés / rendimiento | Vitest + pytest | `*stress.test.ts`, `test_stress.py` | Umbrales de tiempo en CI |
| Lint estático | ESLint + Ruff | CI | 0 errores antes de Sonar |

**No implementado (fuera de alcance mínimo):** Playwright E2E, pruebas de componentes React, pruebas manuales UAT, pruebas de rutas Next.js `/api/*` (requieren mocks de Supabase más elaborados).

## Comandos

```bash
# Frontend
cd frontend
npm install
npm run test              # unitarias + estrés
npm run test:coverage     # genera coverage/lcov.info

# Backend
cd backend
pip install -r requirements-dev.txt
pytest                    # unitarias + integración + estrés
pytest -m "not stress"    # excluir estrés localmente
pytest --cov=. --cov-report=xml:coverage.xml
```

## 1. Pruebas unitarias — Frontend

### `lib/risk.test.ts` — Clasificación de riesgo clínico
| ID | Caso |
|----|------|
| RSK-01..08 | `maxProbability`, `getRiskLevel`, `getRiskDisplay`, umbrales 0.75 / 0.40 |
| CON-01..02 | Constantes `RISK_THRESHOLDS`, `RISK_COLORS` |

### `lib/cat.test.ts` — Motor CAT (IRT 2PL)
| ID | Caso |
|----|------|
| CAT-01..02 | Probabilidad 2PL y guessing |
| CAT-03..06 | `estimateTheta` (vacío, positivo, negativo, límites) |
| CAT-08..14 | Fisher Information, selección de ítems, TAC |

### `lib/admin/aggregateStats.test.ts` — Dashboard admin
| ID | Caso |
|----|------|
| ADM-01..08 | Totales, distribución riesgo, ranking top 5, alertas, normalización |

Datos: `mocks/test-rows.json`.

### `lib/students/filters.test.ts` — Filtros psicólogo
| ID | Caso |
|----|------|
| FLT-01..08 | Búsqueda, facultad, carrera, riesgo, combinados |

Datos: `mocks/estudiantes.json`.

### `lib/api/errors.test.ts` — Respuestas HTTP
| ID | Caso |
|----|------|
| ERR-01..04 | 400, 401, 404, 500 |

### `lib/constants/likert.test.ts`
| ID | Caso |
|----|------|
| CON-03 | Escala Likert 0–3 (4 opciones) |

## 2. Pruebas unitarias — Backend

### `test_data_generator.py`
| ID | Caso |
|----|------|
| GEN-01..04 | Shape (n×20), rango Likert, reproducibilidad, balance de clases |

### `test_constants.py`
| ID | Caso |
|----|------|
| CST-01..03 | 20 features, mapeo QID, respuestas TAC |

### `test_schemas.py`
| ID | Caso |
|----|------|
| SCH-01..03 | Pydantic `PredictionRequest` / `PredictionResponse` |

### `test_ml_service.py`
| ID | Caso |
|----|------|
| ML-01..09 | Carga de modelos, predict vacío/alto, SHAP, TAC 0%/100%, `get_model_info` |

Los modelos se entrenan una vez por sesión con `n=500` muestras (`tests/conftest.py`) para mantener CI rápido.

## 3. Pruebas de integración — Backend API

### `test_api.py`
| Caso | Endpoint |
|------|----------|
| Health check | `GET /` |
| Predicción ML | `POST /predict` |
| Metadatos modelo | `GET /model-info` |

## 4. Pruebas de estrés / rendimiento

Umbrales conservadores para CI (Ubuntu, sin GPU):

### Frontend — `lib/stress.test.ts`
| ID | Caso | Umbral |
|----|------|--------|
| PRF-03 | `filterStudents` con 5000 registros | < 500 ms |
| PRF-03 | `aggregateAdminStats` con 1000 tests | < 2 s |

### Backend — `test_stress.py` (marker `@pytest.mark.stress`)
| ID | Caso | Umbral |
|----|------|--------|
| PRF-01 | 50× `predict()` consecutivas | < 30 s |
| PRF-05 | `generate_synthetic_dataset(n=2000)` | < 10 s |

## 5. Integración con SonarQube

Archivo `sonar-project.properties`:

- **Fuentes:** `frontend/`, `backend/`
- **Tests:** `frontend/**/*.test.ts`, `backend/tests/test_*.py`
- **Cobertura JS/TS:** `frontend/coverage/lcov.info`
- **Cobertura Python:** `backend/coverage.xml`

Workflow `.github/workflows/sonar.yml` ejecuta en orden:

1. `npm run lint`
2. `npm run test:coverage`
3. `ruff check`
4. `pytest --cov`
5. SonarCloud Scan

Quality Gate recomendado (ver también `docs/SONARQUBE.md`):

- Cobertura de líneas ≥ 60% (objetivo incremental)
- 0 bugs/vulnerabilidades bloqueantes
- Duplicación < 3%

## 6. Trazabilidad requisito → prueba

| Requisito | Pruebas |
|-----------|---------|
| Motor CAT IRT | CAT-01..14 |
| Clasificación riesgo | RSK-01..08 |
| Estadísticas admin | ADM-01..08 |
| ML Random Forest + SHAP | ML-01..09, PRF-01 |
| Datos sintéticos | GEN-01..04 |
| API FastAPI | `test_api.py` |
| Rendimiento agregaciones | PRF-03, PRF-05 |

## 7. Próximos pasos opcionales

1. Pruebas de rutas Next.js `/api/*` con mocks de Supabase
2. Playwright E2E (flujos estudiante / psicólogo / admin)
3. Subir umbral de cobertura Sonar a 70% cuando crezca la suite
