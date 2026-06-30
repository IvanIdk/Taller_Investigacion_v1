import pytest
from pydantic import ValidationError

from schemas import AnswerItem, PredictionRequest, PredictionResponse, ShapItem


def test_sch_01_valid_prediction_request():
    req = PredictionRequest(
        answers=[AnswerItem(question_id=1, category="ansiedad", value=2)]
    )
    assert len(req.answers) == 1


def test_sch_02_answer_value_must_be_int():
    with pytest.raises(ValidationError):
        AnswerItem(question_id=1, category="ansiedad", value="x")  # type: ignore[arg-type]


def test_sch_03_prediction_response_fields():
    resp = PredictionResponse(
        prob_ansiedad=0.5,
        prob_depresion=0.3,
        tac_score=100.0,
        shap_values=[ShapItem(feature_name="P1", attribution=0.1)],
        model_type="RF",
        anx_feature_importances=[0.1] * 20,
        dep_feature_importances=[0.05] * 20,
    )
    assert resp.prob_ansiedad == pytest.approx(0.5)
    assert resp.tac_score == pytest.approx(100.0)
