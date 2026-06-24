import logging
import os

import joblib
import numpy as np
import shap
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

from constants import (
    ANX_MODEL_FILE,
    DEP_MODEL_FILE,
    FEATURE_NAMES,
    MODEL_DIR_NAME,
    QID_TO_FEATURE,
    RF_PARAMS,
    SYNTHETIC_SAMPLES,
    SYNTHETIC_SEED,
    TAC_CORRECT_ANSWERS,
)
from data_generator import generate_synthetic_dataset
from schemas import AnswerItem, PredictionResponse, ShapItem

logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__), MODEL_DIR_NAME)
ANX_MODEL_PATH = os.path.join(MODEL_DIR, ANX_MODEL_FILE)
DEP_MODEL_PATH = os.path.join(MODEL_DIR, DEP_MODEL_FILE)

rf_ansiedad: RandomForestClassifier | None = None
rf_depresion: RandomForestClassifier | None = None
shap_explainer_anx = None
shap_explainer_dep = None


def _train_single_forest(X_train, y_train) -> RandomForestClassifier:
    model = RandomForestClassifier(**RF_PARAMS)
    model.fit(X_train, y_train)
    return model


def train_models() -> None:
    global rf_ansiedad, rf_depresion, shap_explainer_anx, shap_explainer_dep

    logger.info("Generating synthetic clinical dataset (n=%s)...", SYNTHETIC_SAMPLES)
    X, y_anx, y_dep = generate_synthetic_dataset()

    X_train, X_test, y_anx_train, y_anx_test = train_test_split(
        X, y_anx, test_size=0.2, random_state=SYNTHETIC_SEED, stratify=y_anx
    )
    _, _, y_dep_train, y_dep_test = train_test_split(
        X, y_dep, test_size=0.2, random_state=SYNTHETIC_SEED, stratify=y_dep
    )

    logger.info("Training Random Forest for ANXIETY...")
    rf_ansiedad = _train_single_forest(X_train, y_anx_train)
    logger.info("Anxiety model accuracy: %.4f", rf_ansiedad.score(X_test, y_anx_test))

    logger.info("Training Random Forest for DEPRESSION...")
    rf_depresion = _train_single_forest(X_train, y_dep_train)
    logger.info("Depression model accuracy: %.4f", rf_depresion.score(X_test, y_dep_test))

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(rf_ansiedad, ANX_MODEL_PATH)
    joblib.dump(rf_depresion, DEP_MODEL_PATH)

    shap_explainer_anx = shap.TreeExplainer(rf_ansiedad)
    shap_explainer_dep = shap.TreeExplainer(rf_depresion)
    logger.info("SHAP TreeExplainers initialized")


def load_or_train_models() -> None:
    global rf_ansiedad, rf_depresion, shap_explainer_anx, shap_explainer_dep

    if os.path.exists(ANX_MODEL_PATH) and os.path.exists(DEP_MODEL_PATH):
        logger.info("Loading pre-trained Random Forest models...")
        rf_ansiedad = joblib.load(ANX_MODEL_PATH)
        rf_depresion = joblib.load(DEP_MODEL_PATH)
        shap_explainer_anx = shap.TreeExplainer(rf_ansiedad)
        shap_explainer_dep = shap.TreeExplainer(rf_depresion)
        return

    train_models()


def _positive_class_shap(shap_values, row_index: int = 0) -> np.ndarray:
    if isinstance(shap_values, list):
        row = shap_values[1][row_index]
    else:
        row = shap_values[row_index]
    return np.ravel(row)


def _build_feature_vector(answers: list[AnswerItem]) -> tuple[np.ndarray, set, float]:
    feature_vector = np.zeros(20, dtype=np.float64)
    answered_features: set = set()
    tac_correct_count = 0
    tac_total_count = 0

    for item in answers:
        if item.category == "tac":
            expected = TAC_CORRECT_ANSWERS.get(item.question_id)
            if expected is not None:
                tac_total_count += 1
                if item.value == expected:
                    tac_correct_count += 1
        elif item.question_id in QID_TO_FEATURE:
            idx = QID_TO_FEATURE[item.question_id]
            feature_vector[idx] = float(item.value)
            answered_features.add(idx)

    tac_score = (tac_correct_count / tac_total_count * 100.0) if tac_total_count > 0 else 100.0
    return feature_vector, answered_features, tac_score


def predict(answers: list[AnswerItem]) -> PredictionResponse:
    feature_vector, answered_features, tac_score = _build_feature_vector(answers)
    X_input = feature_vector.reshape(1, -1)

    prob_ansiedad = float(rf_ansiedad.predict_proba(X_input)[0][1])
    prob_depresion = float(rf_depresion.predict_proba(X_input)[0][1])

    sv_anx = _positive_class_shap(shap_explainer_anx.shap_values(X_input))
    sv_dep = _positive_class_shap(shap_explainer_dep.shap_values(X_input))

    shap_contributions = [
        ShapItem(
            feature_name=FEATURE_NAMES[idx],
            attribution=round(float(sv_anx[idx]) + float(sv_dep[idx]), 4),
        )
        for idx in answered_features
    ]
    shap_contributions.sort(key=lambda x: abs(x.attribution), reverse=True)

    return PredictionResponse(
        prob_ansiedad=round(prob_ansiedad, 4),
        prob_depresion=round(prob_depresion, 4),
        tac_score=round(tac_score, 1),
        shap_values=shap_contributions[:8],
        model_type="RandomForestClassifier (n_estimators=200, max_depth=8)",
        anx_feature_importances=rf_ansiedad.feature_importances_.tolist(),
        dep_feature_importances=rf_depresion.feature_importances_.tolist(),
    )


def get_model_info() -> dict:
    if rf_ansiedad is None:
        return {"error": "Models not loaded yet"}

    X, y_anx, y_dep = generate_synthetic_dataset()
    _, X_test, _, y_anx_test = train_test_split(
        X, y_anx, test_size=0.2, random_state=SYNTHETIC_SEED, stratify=y_anx
    )
    _, _, _, y_dep_test = train_test_split(
        X, y_dep, test_size=0.2, random_state=SYNTHETIC_SEED, stratify=y_dep
    )

    return {
        "model_type": "RandomForestClassifier",
        "n_estimators": RF_PARAMS["n_estimators"],
        "max_depth": RF_PARAMS["max_depth"],
        "training_samples": 2400,
        "test_samples": 600,
        "anxiety_accuracy": round(float(rf_ansiedad.score(X_test, y_anx_test)), 4),
        "depression_accuracy": round(float(rf_depresion.score(X_test, y_dep_test)), 4),
        "feature_names": FEATURE_NAMES,
        "anxiety_feature_importances": rf_ansiedad.feature_importances_.tolist(),
        "depression_feature_importances": rf_depresion.feature_importances_.tolist(),
        "explainer": "SHAP TreeExplainer (exact)",
        "synthetic_data_seed": SYNTHETIC_SEED,
    }
