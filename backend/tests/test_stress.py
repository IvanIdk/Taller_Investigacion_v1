import time

import pytest

from data_generator import generate_synthetic_dataset
from schemas import AnswerItem

import ml_service as ms


STRESS_ITERATIONS = 50
LARGE_DATASET = 2000


@pytest.mark.stress
def test_stress_predict_throughput():
    """PRF-01: 50 predicciones consecutivas en tiempo acotado (SHAP incluido)."""
    answers = [
        AnswerItem(question_id=qid, category="ansiedad", value=2)
        for qid in range(1, 11)
    ]
    start = time.perf_counter()
    for _ in range(STRESS_ITERATIONS):
        ms.predict(answers)
    elapsed = time.perf_counter() - start
    assert elapsed < 30.0, f"{STRESS_ITERATIONS} predicciones tardaron {elapsed:.2f}s"


@pytest.mark.stress
def test_stress_dataset_generation():
    """PRF-05: generación sintética n=2000 en tiempo razonable."""
    start = time.perf_counter()
    X, y_anx, y_dep = generate_synthetic_dataset(n_samples=LARGE_DATASET, seed=42)
    elapsed = time.perf_counter() - start
    assert X.shape[0] == LARGE_DATASET
    assert elapsed < 10.0, f"Generación n={LARGE_DATASET} tardó {elapsed:.2f}s"
