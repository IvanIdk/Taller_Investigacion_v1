# Diseño — Mockups y arquitectura de interfaz

Documentación de diseño del Sistema CAT UC. Las pantallas están implementadas en `frontend/app/`; este documento sirve como mapa de mockups para revisión académica y para agentes IA.

## Roles y rutas

```
/                    Landing
/auth                QuickLogin (demo: estudiante | psicólogo | admin)
/test                CAT — batería adaptativa (estudiante)
/resultados          Probabilidades + SHAP + agendar cita
/mis-citas           Citas del estudiante
/psicologo/dashboard Panel psicólogo
/psicologo/estudiantes Lista filtrable por riesgo/facultad
/psicologo/estudiante/[id] Detalle + historial
/psicologo/citas     Gestión de citas
/admin/dashboard     Métricas Recharts
/admin/usuarios      CRUD roles
/admin/preguntas     Banco IRT (a, b, c)
```

## Mockups por pantalla

### Estudiante

| Pantalla | Archivo | Elementos clave |
|----------|---------|-----------------|
| Login demo | `app/auth/page.tsx` | `QuickLogin` — 3 roles |
| Test CAT | `app/test/page.tsx` | `QuestionCard`, progreso, TAC cada 4 ítems, parada 95% |
| Resultados | `app/resultados/page.tsx` | `RiskMeter`, `ShapChart`, CTA cita |
| Mis citas | `app/mis-citas/page.tsx` | Lista estado pendiente/confirmada |

### Psicólogo

| Pantalla | Archivo | Elementos clave |
|----------|---------|-----------------|
| Dashboard | `app/psicologo/dashboard/page.tsx` | Alertas riesgo alto |
| Estudiantes | `app/psicologo/estudiantes/page.tsx` | Filtros nombre/facultad/riesgo |
| Detalle | `app/psicologo/estudiante/[id]/page.tsx` | Historial predicciones |
| Citas | `app/psicologo/citas/page.tsx` | Confirmar / rechazar |

### Administrador

| Pantalla | Archivo | Elementos clave |
|----------|---------|-----------------|
| Dashboard | `app/admin/dashboard/page.tsx` | Gráficos distribución, ranking carreras |
| Usuarios | `app/admin/usuarios/page.tsx` | Tabla roles |
| Preguntas | `app/admin/preguntas/page.tsx` | Edición parámetros IRT |

## Componentes reutilizables

| Componente | Ruta | Función |
|------------|------|---------|
| `QuestionCard` | `components/QuestionCard.tsx` | Ítem Likert 0–3 |
| `RiskMeter` | `components/RiskMeter.tsx` | Gauge probabilidad |
| `ShapChart` | `components/ShapChart.tsx` | Barras atribución SHAP |
| `QuickLogin` | `components/QuickLogin.tsx` | Acceso demo por rol |

## Paleta y estilo

- **Framework UI:** Tailwind CSS 4
- **Iconos:** Lucide React
- **Gráficos:** Recharts (admin)
- **Riesgo:** colores en `lib/constants/risk.ts` (Alto/Medio/Bajo)

## Flujo principal (estudiante)

```mermaid
flowchart LR
  A[/auth] --> B[/test]
  B -->|CAT + TAC| C{prob >= 95%?}
  C -->|Sí| D[/resultados]
  C -->|No| B
  D --> E[/mis-citas]
```

## Datos de diseño (mocks)

La carpeta `mocks/` replica datos de Supabase para diseño offline: `questions.json`, `estudiantes.json`, `admin-stats.json`, etc.

## Estado

✅ **Documentado** — mockups funcionales en la app Next.js; capturas opcionales pueden añadirse en `diseno/capturas/` si el informe lo exige.
