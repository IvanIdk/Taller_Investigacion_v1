import numpy as np

from constants import CLINICAL_CUTOFF_MEAN, SYNTHETIC_SAMPLES, SYNTHETIC_SEED


def _likert_from_probability(prob: float, rng: np.random.RandomState) -> int:
    if prob < 0.25:
        value = 0
    elif prob < 0.50:
        value = 1
    elif prob < 0.75:
        value = 2
    else:
        value = 3
    return int(np.clip(value + rng.choice([-1, 0, 0, 0, 1]), 0, 3))


def generate_synthetic_dataset(n_samples: int = SYNTHETIC_SAMPLES, seed: int = SYNTHETIC_SEED):
    rng = np.random.RandomState(seed)
    X = np.zeros((n_samples, 20), dtype=np.float64)
    y_anx = np.zeros(n_samples, dtype=np.int64)
    y_dep = np.zeros(n_samples, dtype=np.int64)

    anx_difficulty = np.array([-0.5, 0.2, -0.8, -0.2, 0.5, -1.0, 1.0, 0.0, 0.7, -0.1])
    dep_difficulty = np.array([-0.4, 0.3, -0.7, -0.9, -0.2, 0.8, 0.1, 0.6, 1.5, 0.2])
    anx_disc = np.array([1.8, 2.2, 1.5, 1.2, 1.4, 1.0, 2.0, 1.1, 1.6, 1.3])
    dep_disc = np.array([1.7, 2.3, 1.2, 1.4, 1.0, 2.1, 1.3, 1.5, 2.5, 1.6])

    for i in range(n_samples):
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

        shared = rng.normal(0, 0.3)
        theta_anx += shared
        theta_dep += shared

        for j in range(10):
            prob = 1.0 / (1.0 + np.exp(-anx_disc[j] * (theta_anx - anx_difficulty[j])))
            X[i, j] = _likert_from_probability(prob, rng)

        for j in range(10):
            prob = 1.0 / (1.0 + np.exp(-dep_disc[j] * (theta_dep - dep_difficulty[j])))
            X[i, 10 + j] = _likert_from_probability(prob, rng)

        y_anx[i] = 1 if np.mean(X[i, :10]) >= CLINICAL_CUTOFF_MEAN else 0
        y_dep[i] = 1 if np.mean(X[i, 10:]) >= CLINICAL_CUTOFF_MEAN else 0

    return X, y_anx, y_dep
