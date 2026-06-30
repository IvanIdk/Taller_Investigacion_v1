# Despliegue en Vercel

Frontend Next.js desplegado desde la carpeta `frontend/`.

## Configuración obligatoria en Vercel Dashboard

1. [vercel.com/new](https://vercel.com/new) → importar `Ivanldk/Taller_Investigacion_v1`
2. **Root Directory:** `frontend` ← crítico; sin esto el build falla
3. **Framework Preset:** Next.js (auto)
4. **Build Command:** `npm run build` (default)
5. **Install Command:** `npm ci` (default)

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Opcional | URL Supabase; sin ella usa mocks |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Opcional | Anon key pública |
| `NEXT_PUBLIC_BACKEND_URL` | Opcional | FastAPI; sin ella usa fallback JS |
| `STOP_THRESHOLD` | Opcional | Parada temprana CAT (default 95) |

Sin Supabase ni backend, la app funciona en **modo demo** con datos de `/mocks`.

## Despliegue automático (Git)

Cada push a `main` dispara un deploy si el proyecto está conectado en Vercel.

## Despliegue manual (CLI)

```powershell
cd frontend
npx vercel login
npx vercel --prod
```

## Verificación post-deploy

- [ ] Landing `/` carga
- [ ] `/auth` — QuickLogin (solo demo en no-producción para roles)
- [ ] Login Estudiante → `/test` con mocks
- [ ] Login Admin → `/admin/dashboard`
- [ ] `npm run build` pasa en local

## Errores frecuentes

| Error | Solución |
|-------|----------|
| Build falla: no encuentra `next.config.ts` | Root Directory = `frontend` |
| Lockfile / turbopack warning | No usar `package-lock.json` en raíz; solo `frontend/package-lock.json` |
| API routes 500 | Normal sin Supabase; deben responder con fallback mock |

## Archivos

- `frontend/vercel.json` — config del proyecto
- `planificacion/despliegue-vercel.txt` — checklist extendido
