import os

FEATURE_NAMES = [
    "Nerviosismo / Ansiedad (P1)",
    "Preocupación incontrolable (P2)",
    "Preocupación excesiva (P3)",
    "Dificultad para relajarse (P4)",
    "Inquietud motora (P5)",
    "Irritabilidad (P6)",
    "Temor a catástrofes (P7)",
    "Síntomas físicos (P8)",
    "Evitación ansiosa (P9)",
    "Insomnio por ansiedad (P10)",
    "Poco interés / Anhedonia (P11)",
    "Ánimo decaído / Tristeza (P12)",
    "Problemas del sueño (P13)",
    "Cansancio / Falta de energía (P14)",
    "Problemas de apetito (P15)",
    "Autovaloración negativa / Culpa (P16)",
    "Dificultad de concentración (P17)",
    "Enlentecimiento o agitación (P18)",
    "Pensamientos de autolesión (P19)",
    "Falta de propósito (P20)",
]

QID_TO_FEATURE = {i: i - 1 for i in range(1, 21)}
TAC_CORRECT_ANSWERS = {21: 0, 22: 3, 23: 1, 24: 2}

MODEL_DIR_NAME = "models"
ANX_MODEL_FILE = "rf_ansiedad.joblib"
DEP_MODEL_FILE = "rf_depresion.joblib"

RF_PARAMS = {
    "n_estimators": 200,
    "max_depth": 8,
    "min_samples_leaf": 10,
    "class_weight": "balanced",
    "random_state": 42,
    "n_jobs": -1,
}

SYNTHETIC_SAMPLES = int(os.getenv("SYNTHETIC_SAMPLES", "500" if os.getenv("VERCEL") else "3000"))
SYNTHETIC_SEED = 42
CLINICAL_CUTOFF_MEAN = 1.5
