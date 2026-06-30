# Despliegue en Vercel (frontend + backend)

Monorepo con **Vercel Services**: Next.js en `frontend/` y FastAPI en `backend/`.

## Archivo clave

`vercel.json` en la **raíz** del repo (requerido por Vercel para multi-servicio):

```json
{
  "services": {
    "frontend": { "root": "frontend", "framework": "nextjs" },
    "backend": { "root": "backend", "entrypoint": "main:app" }
  },
  "rewrites": [
    { "source": "/api/backend(/.*)?", "destination": { "service": "backend" } },
    { "source": "/(.*)", "destination": { "service": "frontend" } }
  ]
}
```

## Configuración en Vercel Dashboard

1. Importar el repo en [vercel.com/new](https://vercel.com/new)
2. **Root Directory:** dejar vacío (raíz del repo) — el `vercel.json` define los servicios
3. Vercel detectará `frontend` (Next.js) y `backend` (FastAPI Web Service)
4. Pulsa **Refresh** si la UI pide el `vercel.json`

## Rutas públicas

| URL | Servicio |
|-----|----------|
| `/`, `/test`, `/admin/*`, … | frontend (Next.js) |
| `/api/predict`, `/api/admin/*` | frontend (API Routes Next.js) |
| `/api/backend/` | backend FastAPI (health) |
| `/api/backend/predict` | backend ML |

El frontend llama al backend vía binding interno `BACKEND_INTERNAL_URL` (automático) o, en fallback, `/api/backend/predict`.

## Variables de entorno (opcionales)

| Variable | Servicio | Descripción |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | frontend | Supabase; sin ella → mocks |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | frontend | Anon key |
| `NEXT_PUBLIC_BACKEND_URL` | frontend | Override URL backend externo |
| `STOP_THRESHOLD` | frontend | Parada temprana CAT (default 95) |
| `SYNTHETIC_SAMPLES` | backend | Muestras entrenamiento (default 500 en Vercel) |

`BACKEND_INTERNAL_URL` lo inyecta Vercel automáticamente vía binding — no configurar manualmente.

## Verificación post-deploy

- [ ] `/` — landing
- [ ] `/auth` — QuickLogin
- [ ] `/api/backend/` — `{ "status": "healthy", ... }`
- [ ] `/test` → predicción ML (Random Forest, no solo fallback JS)

## Despliegue por Git

```powershell
git add vercel.json backend/main.py frontend/app/api/predict/route.ts
git commit -m "Añade vercel.json multi-servicio frontend + FastAPI backend"
git push origin main
```

## Errores frecuentes

| Problema | Solución |
|----------|----------|
| UI pide `vercel.json` | Crear/commitear `vercel.json` en raíz y Refresh |
| Root Directory = `frontend` | Quitarlo; debe ser raíz del repo |
| Backend 404 en `/api/backend/predict` | Verificar `main.py` con prefijo `/api/backend` |
| ML lento en cold start | Normal; usa 500 muestras en Vercel (`SYNTHETIC_SAMPLES`) |
