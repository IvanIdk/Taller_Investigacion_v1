import pytest

import constants
import ml_service as ms


@pytest.fixture(scope="session", autouse=True)
def bootstrap_models(tmp_path_factory):
    """Entrena modelos con dataset reducido para pruebas rápidas en CI."""
    mp = pytest.MonkeyPatch()
    model_dir = tmp_path_factory.mktemp("models")
    anx_path = model_dir / constants.ANX_MODEL_FILE
    dep_path = model_dir / constants.DEP_MODEL_FILE

    mp.setattr(ms, "MODEL_DIR", str(model_dir))
    mp.setattr(ms, "ANX_MODEL_PATH", str(anx_path))
    mp.setattr(ms, "DEP_MODEL_PATH", str(dep_path))
    mp.setattr(constants, "SYNTHETIC_SAMPLES", 500)

    ms.rf_ansiedad = None
    ms.rf_depresion = None
    ms.shap_explainer_anx = None
    ms.shap_explainer_dep = None
    ms.load_or_train_models()

    yield
    mp.undo()
