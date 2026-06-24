import time

import pytest

from data_generator import generate_synthetic_dataset


def test_gen_01_shape():
    X, y_anx, y_dep = generate_synthetic_dataset(n_samples=300, seed=42)
    assert X.shape == (300, 20)
    assert y_anx.shape == (300,)
    assert y_dep.shape == (300,)


def test_gen_02_likert_range():
    X, _, _ = generate_synthetic_dataset(n_samples=200, seed=7)
    assert X.min() >= 0
    assert X.max() <= 3


def test_gen_03_reproducibility():
    X1, y1a, y1d = generate_synthetic_dataset(n_samples=100, seed=99)
    X2, y2a, y2d = generate_synthetic_dataset(n_samples=100, seed=99)
    assert (X1 == X2).all()
    assert (y1a == y2a).all()
    assert (y1d == y2d).all()


def test_gen_04_class_balance():
    _, y_anx, y_dep = generate_synthetic_dataset(n_samples=1000, seed=42)
    for labels in (y_anx, y_dep):
        ratio = labels.mean()
        assert 0.2 < ratio < 0.8
