# FastAPI Backend for Continental Predictive Diagnosis
# Real Random Forest classifier with SHAP explanations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import shap
import joblib
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Continental Predictive Diagnosis ML Microservice",
    description="Microservicio de predicción con Random Forest real y explicaciones SHAP auténticas.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# FEATURE DEFINITIONS
# 20 features: P1..P10 (ansiedad), P11..P20 (depresion)
# Each feature is a Likert value 0-3
# ─────────────────────────────────────────────────────────────────────────────

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
    "Falta de propósito (P20)"
]

# Map question_id -> feature index (0-based)
QID_TO_FEATURE = {i: i - 1 for i in range(1, 21)}

# TAC control items correct values
TAC_CORRECT_ANSWERS = {21: 0, 22: 3, 23: 1, 24: 2}

# ─────────────────────────────────────────────────────────────────────────────
# SYNTHETIC DATA GENERATOR
# Generates clinically coherent training data based on PHQ-9/GAD-7 score
# distributions observed in university student populations.
# ─────────────────────────────────────────────────────────────────────────────

def generate_synthetic_dataset(n_samples: int = 3000, seed: int = 42):
    """
    Generate synthetic screening data with realistic correlations.
    
    Strategy:
    - Sample latent anxiety/depression severity from a mixture distribution
    - Map severity -> Likert responses using item-specific thresholds
    - Labels: anxiety_positive if mean(P1..P10) >= 1.5, depression_positive if mean(P11..P20) >= 1.5
    - This mimics validated PHQ-9 / GAD-7 clinical cutoffs
    """
    rng = np.random.RandomState(seed)
    X = np.zeros((n_samples, 20), dtype=np.float64)
    y_anx = np.zeros(n_samples, dtype=np.int64)
    y_dep = np.zeros(n_samples, dtype=np.int64)

    # Item difficulty thresholds (higher = harder to endorse)
    # Based on IRT b-parameters from the question bank
    anx_difficulty = np.array([-0.5, 0.2, -0.8, -0.2, 0.5, -1.0, 1.0, 0.0, 0.7, -0.1])
    dep_difficulty = np.array([-0.4, 0.3, -0.7, -0.9, -0.2, 0.8, 0.1, 0.6, 1.5, 0.2])

    # Item discrimination (higher = more informative)
    anx_disc = np.array([1.8, 2.2, 1.5, 1.2, 1.4, 1.0, 2.0, 1.1, 1.6, 1.3])
    dep_disc = np.array([1.7, 2.3, 1.2, 1.4, 1.0, 2.1, 1.3, 1.5, 2.5, 1.6])

    for i in range(n_samples):
        # Sample latent severity: mixture of healthy (60%), mild (25%), moderate-severe (15%)
        component = rng.choice([0, 1, 2], p=[0.60, 0.25, 0.15])
        if component == 0:
            theta_anx = rng.normal(-1.0, 0.7)
            theta_dep = rng.normal(-1.0, 0.7)
        elif component == 1:
            theta_anx = rng.normal(0.3, 0.6)
            theta_dep = rng.normal(0.2, 0.6)
        else:
            theta_anx = rng.normal(1.5, 0.5)
            theta_dep = rng.normal(1.5, 0.5)

        # Add cross-domain correlation (comorbidity between anxiety and depression)
        shared = rng.normal(0, 0.3)
        theta_anx += shared
        theta_dep += shared

        # Generate Likert responses using graded response model
        for j in range(10):
            # Anxiety items (P1-P10)
            prob = 1.0 / (1.0 + np.exp(-anx_disc[j] * (theta_anx - anx_difficulty[j])))
            # Map probability to 4-point Likert
            if prob < 0.25:
                X[i, j] = 0
            elif prob < 0.50:
                X[i, j] = 1
            elif prob < 0.75:
                X[i, j] = 2
            else:
                X[i, j] = 3
            # Add noise
            X[i, j] = np.clip(X[i, j] + rng.choice([-1, 0, 0, 0, 1]), 0, 3)

        for j in range(10):
            # Depression items (P11-P20)
            prob = 1.0 / (1.0 + np.exp(-dep_disc[j] * (theta_dep - dep_difficulty[j])))
            if prob < 0.25:
                X[i, 10 + j] = 0
            elif prob < 0.50:
                X[i, 10 + j] = 1
            elif prob < 0.75:
                X[i, 10 + j] = 2
            else:
                X[i, 10 + j] = 3
            X[i, 10 + j] = np.clip(X[i, 10 + j] + rng.choice([-1, 0, 0, 0, 1]), 0, 3)

        # Labels based on clinical cutoffs (mean >= 1.5 on 0-3 scale ≈ PHQ-9 >= 10)
        y_anx[i] = 1 if np.mean(X[i, :10]) >= 1.5 else 0
        y_dep[i] = 1 if np.mean(X[i, 10:]) >= 1.5 else 0

    return X, y_anx, y_dep


# ─────────────────────────────────────────────────────────────────────────────
# MODEL TRAINING & LOADING
# ─────────────────────────────────────────────────────────────────────────────

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
ANX_MODEL_PATH = os.path.join(MODEL_DIR, "rf_ansiedad.joblib")
DEP_MODEL_PATH = os.path.join(MODEL_DIR, "rf_depresion.joblib")

rf_ansiedad: RandomForestClassifier = None  # type: ignore
rf_depresion: RandomForestClassifier = None  # type: ignore
shap_explainer_anx = None
shap_explainer_dep = None
X_background = None  # Background dataset for SHAP


def train_models():
    """Train Random Forest models on synthetic data and persist them."""
    global rf_ansiedad, rf_depresion, shap_explainer_anx, shap_explainer_dep, X_background

    logger.info("🌲 Generating synthetic clinical dataset (n=3000)...")
    X, y_anx, y_dep = generate_synthetic_dataset(n_samples=3000, seed=42)

    # Split for validation
    X_train, X_test, y_anx_train, y_anx_test = train_test_split(
        X, y_anx, test_size=0.2, random_state=42, stratify=y_anx
    )
    _, _, y_dep_train, y_dep_test = train_test_split(
        X, y_dep, test_size=0.2, random_state=42, stratify=y_dep
    )

    # Train Anxiety Random Forest
    logger.info("🌲 Training Random Forest for ANXIETY...")
    rf_ansiedad = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        min_samples_leaf=10,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rf_ansiedad.fit(X_train, y_anx_train)
    anx_acc = rf_ansiedad.score(X_test, y_anx_test)
    logger.info(f"   ✅ Anxiety model accuracy: {anx_acc:.4f}")

    # Train Depression Random Forest
    logger.info("🌲 Training Random Forest for DEPRESSION...")
    rf_depresion = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        min_samples_leaf=10,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    rf_depresion.fit(X_train, y_dep_train)
    dep_acc = rf_depresion.score(X_test, y_dep_test)
    logger.info(f"   ✅ Depression model accuracy: {dep_acc:.4f}")

    # Save models
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(rf_ansiedad, ANX_MODEL_PATH)
    joblib.dump(rf_depresion, DEP_MODEL_PATH)
    logger.info(f"   💾 Models saved to {MODEL_DIR}")

    # Create SHAP explainers using a background sample
    X_background = shap.sample(X_train, 100, random_state=42)
    shap_explainer_anx = shap.TreeExplainer(rf_ansiedad)
    shap_explainer_dep = shap.TreeExplainer(rf_depresion)
    logger.info("   🔍 SHAP TreeExplainers initialized")


def load_or_train_models():
    """Load persisted models or train new ones."""
    global rf_ansiedad, rf_depresion, shap_explainer_anx, shap_explainer_dep, X_background

    if os.path.exists(ANX_MODEL_PATH) and os.path.exists(DEP_MODEL_PATH):
        logger.info("📂 Loading pre-trained Random Forest models...")
        rf_ansiedad = joblib.load(ANX_MODEL_PATH)
        rf_depresion = joblib.load(DEP_MODEL_PATH)

        # Still need training data for SHAP background
        X, _, _ = generate_synthetic_dataset(n_samples=3000, seed=42)
        X_background = shap.sample(X, 100, random_state=42)
        shap_explainer_anx = shap.TreeExplainer(rf_ansiedad)
        shap_explainer_dep = shap.TreeExplainer(rf_depresion)
        logger.info("   ✅ Models and SHAP explainers loaded successfully")
    else:
        train_models()


# ─────────────────────────────────────────────────────────────────────────────
# STARTUP EVENT
# ─────────────────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    load_or_train_models()
    logger.info("🚀 Random Forest prediction service ready!")


# ─────────────────────────────────────────────────────────────────────────────
# API SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class AnswerItem(BaseModel):
    question_id: int
    category: str   # 'ansiedad', 'depresion', 'tac'
    value: int      # 0-3

class PredictionRequest(BaseModel):
    answers: List[AnswerItem]

class ShapItem(BaseModel):
    feature_name: str
    attribution: float

class PredictionResponse(BaseModel):
    prob_ansiedad: float
    prob_depresion: float
    tac_score: float
    shap_values: List[ShapItem]
    model_type: str
    anx_feature_importances: List[float]
    dep_feature_importances: List[float]


# ─────────────────────────────────────────────────────────────────────────────
# PREDICTION ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "Diagnóstico Predictivo UC Backend",
        "model": "RandomForestClassifier (scikit-learn)",
        "explainer": "SHAP TreeExplainer",
        "features": 20
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    answers = request.answers

    # 1. Build feature vector (20 features, default = 0 for unanswered)
    feature_vector = np.zeros(20, dtype=np.float64)
    answered_features = set()

    tac_correct_count = 0
    tac_total_count = 0

    for item in answers:
        qid = item.question_id
        val = item.value

        if item.category == 'tac':
            expected = TAC_CORRECT_ANSWERS.get(qid)
            if expected is not None:
                tac_total_count += 1
                if val == expected:
                    tac_correct_count += 1
        elif qid in QID_TO_FEATURE:
            idx = QID_TO_FEATURE[qid]
            feature_vector[idx] = float(val)
            answered_features.add(idx)

    # 2. Random Forest predictions
    X_input = feature_vector.reshape(1, -1)

    # Probability of positive class (index 1)
    prob_ansiedad = float(rf_ansiedad.predict_proba(X_input)[0][1])
    prob_depresion = float(rf_depresion.predict_proba(X_input)[0][1])

    # 3. SHAP explanations (real TreeExplainer values)
    shap_vals_anx = shap_explainer_anx.shap_values(X_input)
    shap_vals_dep = shap_explainer_dep.shap_values(X_input)

    # For binary classification, shap_values returns [class_0, class_1]
    # We want class_1 (positive = at risk)
    if isinstance(shap_vals_anx, list):
        sv_anx = shap_vals_anx[1][0]  # shape (20,)
    else:
        sv_anx = shap_vals_anx[0]

    if isinstance(shap_vals_dep, list):
        sv_dep = shap_vals_dep[1][0]
    else:
        sv_dep = shap_vals_dep[0]

    # 4. Combine SHAP values from both models for answered features only
    shap_contributions = []
    for idx in answered_features:
        combined_shap = float(sv_anx[idx]) + float(sv_dep[idx])
        shap_contributions.append(ShapItem(
            feature_name=FEATURE_NAMES[idx],
            attribution=round(combined_shap, 4)
        ))

    # Sort by absolute attribution
    shap_contributions.sort(key=lambda x: abs(x.attribution), reverse=True)

    # 5. TAC score
    tac_score = (tac_correct_count / tac_total_count * 100.0) if tac_total_count > 0 else 100.0

    # 6. Feature importances from the trained forests
    anx_importances = rf_ansiedad.feature_importances_.tolist()
    dep_importances = rf_depresion.feature_importances_.tolist()

    return PredictionResponse(
        prob_ansiedad=round(prob_ansiedad, 4),
        prob_depresion=round(prob_depresion, 4),
        tac_score=round(tac_score, 1),
        shap_values=shap_contributions[:8],  # Top 8 contributors
        model_type="RandomForestClassifier (n_estimators=200, max_depth=8)",
        anx_feature_importances=anx_importances,
        dep_feature_importances=dep_importances
    )


# ─────────────────────────────────────────────────────────────────────────────
# MODEL INFO ENDPOINT
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/model-info")
def model_info():
    """Return model metadata and performance metrics."""
    if rf_ansiedad is None:
        return {"error": "Models not loaded yet"}

    X, y_anx, y_dep = generate_synthetic_dataset(n_samples=3000, seed=42)
    _, X_test, _, y_anx_test = train_test_split(X, y_anx, test_size=0.2, random_state=42, stratify=y_anx)
    _, _, _, y_dep_test = train_test_split(X, y_dep, test_size=0.2, random_state=42, stratify=y_dep)

    return {
        "model_type": "RandomForestClassifier",
        "n_estimators": 200,
        "max_depth": 8,
        "training_samples": 2400,
        "test_samples": 600,
        "anxiety_accuracy": round(float(rf_ansiedad.score(X_test, y_anx_test)), 4),
        "depression_accuracy": round(float(rf_depresion.score(X_test, y_dep_test)), 4),
        "feature_names": FEATURE_NAMES,
        "anxiety_feature_importances": rf_ansiedad.feature_importances_.tolist(),
        "depression_feature_importances": rf_depresion.feature_importances_.tolist(),
        "explainer": "SHAP TreeExplainer (exact)",
        "synthetic_data_seed": 42
    }


# ─────────────────────────────────────────────────────────────────────────────
# RETRAIN ENDPOINT (for admin use)
# ─────────────────────────────────────────────────────────────────────────────

@app.post("/retrain")
def retrain_models():
    """Force retrain models (admin use)."""
    try:
        train_models()
        return {"status": "success", "message": "Models retrained successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
