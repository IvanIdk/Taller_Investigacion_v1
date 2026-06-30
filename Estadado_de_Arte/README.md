# Estado del arte — Sistema de Diagnóstico Predictivo Adaptativo (CAT)

Referencias bibliográficas que sustentan el producto implementado.

## Documentos

| # | Archivo | Tema |
|---|---------|------|
| 1 | `1_Estado de Arte College student mental health assessment Predictive models based on machine.pdf` | Modelos predictivos de salud mental en estudiantes universitarios |
| 3 | `3_Estado de ArteResearch on practical education model of mental health development of college.pdf` | Modelo educativo práctico de desarrollo de salud mental en universitarios |
| 16 | `16_Estado de Arte_Machine learning-based predictive modelling of mental health in Rwandan Youth.pdf` | ML para modelado predictivo de salud mental en jóvenes |

## Vínculo con la implementación

| Hallazgo del estado del arte | Decisión en el producto |
|------------------------------|-------------------------|
| Cribado temprano de ansiedad/depresión | Escalas GAD-7 y PHQ-9 (20 ítems + 4 TAC) |
| Tests adaptativos (IRT/CAT) | Motor `frontend/lib/cat.ts` — modelo 2PL |
| ML explicable en contexto clínico | Random Forest + SHAP (`backend/ml_service.py`, `ShapChart.tsx`) |
| Intervención psicológica tras detección | Roles psicólogo/admin, citas de contención |
| Datos poblacionales universitarios | Dataset sintético n=3000 (`data_generator.py`) |

## Estado

✅ **Aplicado** — la carpeta contiene las fuentes; la trazabilidad al código está en `docs/ESTRUCTURA_PROYECTO.md` y `docs/DESARROLLO_ISO.md`.
