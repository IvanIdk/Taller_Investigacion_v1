# Sistema de Diagnóstico Predictivo Adaptativo (CAT) - Universidad Continental

Esta plataforma es una aplicación web full-stack orientada a la detección temprana y el cribado de salud mental (ansiedad y depresión) en estudiantes universitarios, haciendo uso de Inteligencia Artificial (Random Forest) y Tests Adaptativos Computarizados (CAT).

## 🚀 Arquitectura del Proyecto

El proyecto está compuesto por dos grandes piezas:

### 1. Frontend (Next.js 14 + App Router)
- **Tecnologías:** React, Next.js 14, TypeScript, Tailwind CSS.
- **Ruta principal:** `/frontend`
- **Funcionalidades:**
  - **Motor CAT:** Presenta a los estudiantes preguntas de forma dinámica basadas en la Teoría de Respuesta al Ítem (IRT).
  - **Parada Temprana:** Si la probabilidad de riesgo de ansiedad o depresión supera el 95%, el test concluye automáticamente para prevenir fatiga.
  - **Roles de Usuario:**
    - **Estudiante:** Realiza el test, revisa sus resultados (SHAP, gráficos) y gestiona citas.
    - **Psicólogo:** Panel de gestión de estudiantes evaluados y programación de citas de contención.
    - **Administrador:** Panel de métricas globales, administración de usuarios y gestión del banco de preguntas psicométricas (parámetros IRT: discriminación, dificultad).
- **Base de Datos (BaaS):** Conectado directamente a **Supabase** (PostgreSQL) para la gestión de usuarios, roles, citas, banco de preguntas y registro de predicciones.

### 2. Backend / Microservicio ML (FastAPI + Scikit-Learn)
- **Tecnologías:** Python, FastAPI, Scikit-Learn, SHAP, Uvicorn, Numpy.
- **Ruta principal:** `/backend`
- **Funcionalidades:**
  - **Modelo Random Forest:** Entrenado con datos sintéticos clínicos (n=3000) basados en la distribución poblacional de las escalas GAD-7 y PHQ-9.
  - **Clasificadores:** Dos modelos independientes para `Ansiedad` y `Depresión`.
  - **Explicabilidad (SHAP):** Utiliza `TreeExplainer` de SHAP para retornar, en tiempo real, el peso exacto (atribución) que cada respuesta del estudiante tuvo en la decisión del modelo, logrando interpretabilidad clínica.
  - **Puntuación TAC:** Evalúa en tiempo real las respuestas a preguntas de Control de Atención (TAC) para asegurar que el estudiante lee detenidamente el instrumento.

---

## 🛠 Instalación y Despliegue Local

### 1. Iniciar el Microservicio de Python (Backend)

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias necesarias:
   ```bash
   pip install fastapi uvicorn pydantic scikit-learn numpy shap joblib pandas
   ```
3. Ejecuta el servidor FastAPI:
   ```bash
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
*El servicio se ejecutará en `http://localhost:8000`. Al iniciar por primera vez, el sistema autogenerará el dataset y entrenará los modelos Random Forest de forma local.*

### 2. Iniciar la Aplicación Next.js (Frontend)

1. Abre una segunda terminal y navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias de Node:
   ```bash
   npm install
   ```
3. Ejecuta el entorno de desarrollo:
   ```bash
   npm run dev
   ```
*La aplicación web estará disponible en `http://localhost:3000`.*

---

## 🔐 Configuración de Supabase

El sistema lee las siguientes variables de entorno. Puedes configurarlas en un archivo `.env.local` en la raíz de `frontend/`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://fruijbbatbznxgvathbk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```
*(El proyecto ya cuenta con conexión a la base de datos Supabase configurada para las tablas `profiles`, `questions`, `citas`, `tests` y `predictions`).*

---

## 🧠 Características Avanzadas de Machine Learning
* **Test Adaptativo Computarizado (CAT):** Implementa el modelo de 2 parámetros logísticos (2PL - Discriminación y Dificultad).
* **Random Forest:** Evita el sobreajuste mediante profundidad máxima de árboles (`max_depth=8`) y clases balanceadas (`class_weight="balanced"`).
* **SHAP:** Otorga "Inteligencia Artificial Explicable" mostrando en el frontend qué síntomas fueron los detonantes exactos de la evaluación de alto riesgo.

Desarrollado para el **Taller de Investigación** - Universidad Continental.

---

## Documentación del proyecto (estructura académica + IA)

Índice maestro para Cursor, Cloud Agents y revisión ISO:

- **[docs/ESTRUCTURA_PROYECTO.md](docs/ESTRUCTURA_PROYECTO.md)** — estado del arte, planificación, diseño, desarrollo ISO, mantenimiento
- [Estadado_de_Arte/README.md](Estadado_de_Arte/README.md) — referencias bibliográficas
- [diseno/README.md](diseno/README.md) — mockups y mapa de pantallas
- [planificacion/plan-de-pruebas.txt](planificacion/plan-de-pruebas.txt) — plan ISO 29119
- [docs/DESARROLLO_ISO.md](docs/DESARROLLO_ISO.md) — ISO 9001, 25000, 29119, 27001
- [docs/PRUEBAS.md](docs/PRUEBAS.md) — pruebas automatizadas implementadas
- [docs/VERCEL.md](docs/VERCEL.md) — despliegue en Vercel (Root Directory = `frontend`)

## Calidad y seguridad del código

El repositorio está conectado a **[Aikido](https://app.aikido.dev/repositories/2218116)** para escaneos de seguridad (dependencias, SAST, secretos) y, si lo activas en el panel, **Code Quality** en cada pull request.

Guías en el repo:

- [docs/AIKIDO.md](docs/AIKIDO.md) — configuración en Aikido (recomendado)
- [docs/SONARQUBE.md](docs/SONARQUBE.md) — SonarCloud + cobertura CI

```bash
# Lint local (complementa Aikido)
cd frontend && npm run lint
cd backend && ruff check .
```

```bash
# Lint frontend
cd frontend && npm run lint

# Lint backend
cd backend && pip install ruff && ruff check .
```
