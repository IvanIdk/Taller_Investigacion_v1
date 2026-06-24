from pydantic import BaseModel


class AnswerItem(BaseModel):
    question_id: int
    category: str
    value: int


class PredictionRequest(BaseModel):
    answers: list[AnswerItem]


class ShapItem(BaseModel):
    feature_name: str
    attribution: float


class PredictionResponse(BaseModel):
    prob_ansiedad: float
    prob_depresion: float
    tac_score: float
    shap_values: list[ShapItem]
    model_type: str
    anx_feature_importances: list[float]
    dep_feature_importances: list[float]
