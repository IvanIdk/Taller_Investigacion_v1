from constants import FEATURE_NAMES, QID_TO_FEATURE, TAC_CORRECT_ANSWERS


def test_cst_01_feature_names_count():
    assert len(FEATURE_NAMES) == 20


def test_cst_02_qid_mapping():
    assert QID_TO_FEATURE[1] == 0
    assert QID_TO_FEATURE[20] == 19
    assert len(QID_TO_FEATURE) == 20


def test_cst_03_tac_answers():
    assert TAC_CORRECT_ANSWERS == {21: 0, 22: 3, 23: 1, 24: 2}
