from schemas import AnswerItem

import pytest

import ml_service as ms


def _high_symptom_answers() -> list[AnswerItem]:
    return [AnswerItem(question_id=qid, category="ansiedad", value=3) for qid in range(1, 11)] + [
        AnswerItem(question_id=qid, category="depresion", value=3) for qid in range(11, 21)
    ]


def test_ml_01_models_loaded():
    assert ms.rf_ansiedad is not None
    assert ms.rf_depresion is not None


def test_ml_02_empty_answers_low_probability():
    result = ms.predict([])
    assert result.prob_ansiedad < 0.5
    assert result.prob_depresion < 0.5
    assert result.tac_score == pytest.approx(100.0)


def test_ml_03_high_anxiety_symptoms():
    answers = [AnswerItem(question_id=qid, category="ansiedad", value=3) for qid in range(1, 11)]
    result = ms.predict(answers)
    assert result.prob_ansiedad > 0.5


def test_ml_05_includes_shap_values():
    answers = [AnswerItem(question_id=1, category="ansiedad", value=3)]
    result = ms.predict(answers)
    assert len(result.shap_values) >= 1


def test_ml_06_tac_score_all_correct():
    answers = [
        AnswerItem(question_id=21, category="tac", value=0),
        AnswerItem(question_id=22, category="tac", value=3),
        AnswerItem(question_id=23, category="tac", value=1),
        AnswerItem(question_id=24, category="tac", value=2),
    ]
    result = ms.predict(answers)
    assert result.tac_score == pytest.approx(100.0)


def test_ml_07_tac_score_all_incorrect():
    answers = [
        AnswerItem(question_id=21, category="tac", value=3),
        AnswerItem(question_id=22, category="tac", value=0),
    ]
    result = ms.predict(answers)
    assert result.tac_score == pytest.approx(0.0)


def test_ml_08_model_info_accuracy_range():
    info = ms.get_model_info()
    assert 0 <= info["anxiety_accuracy"] <= 1
    assert 0 <= info["depression_accuracy"] <= 1


def test_ml_09_high_symptoms_nonzero_shap():
    result = ms.predict(_high_symptom_answers())
    assert any(abs(s.attribution) > 0 for s in result.shap_values)
