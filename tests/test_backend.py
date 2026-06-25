import json

from fastapi.testclient import TestClient

from app.main import app
from app.models.domain import GeneralSpec, GeneralSpecCondition
from app.services.compare_engine import compare_spec
from app.services.spec_parser import normalize_rms_json

SAMPLE = {
    "Customer": "Demo",
    "Category3": "BOC",
    "Customized": "None",
    "RmsRev": 1,
    "RmsRevDateTime": "20260619000000",
    "Threshold": 1,
    "DefectTypes": [
        {
            "AI_Code": "AF-001",
            "Side": "TOP",
            "Unit_Dummy": "Unit",
            "Area": "SR_UNIT",
            "DefectName": "Foreign Material",
            "Remark": "General spec 1mm NG",
            "DefectConditions": [
                {
                    "MachineType": "None",
                    "NoMeasurementDefaultResult": "AI_UNKNOWN_NONE",
                    "MeasurementConditions": [
                        {
                            "DefaultResultValue": "AI_OK",
                            "RootLogicalOperator": "OR",
                            "Specifications": [
                                {"MeasurementName": "longest", "Unit": "MicroMeter", "Expressions": [{"Value": 800, "InequalitySign": "gte"}]}
                            ],
                        }
                    ],
                }
            ],
        }
    ],
}


def test_normalize_rms_json():
    parsed = normalize_rms_json(SAMPLE)
    assert parsed.summary.customer == "Demo"
    assert parsed.summary.defectCount == 1
    assert parsed.specs[0].aiCode == "AF-001"
    assert "longest" in parsed.specs[0].aiSpecText


def test_compare_stricter():
    spec = normalize_rms_json(SAMPLE).specs[0]
    general = GeneralSpec(
        aiCode="AF-001",
        structuredConditions=[GeneralSpecCondition(metric="longest", operator="gte", value=1000, unit="um", judgement="NG")],
    )
    result = compare_spec(spec, general)
    assert result.result == "STRICTER"


def test_upload_api():
    client = TestClient(app)
    response = client.post(
        "/api/spec/upload",
        files={"file": ("sample.json", json.dumps(SAMPLE).encode("utf-8"), "application/json")},
    )
    assert response.status_code == 200
    assert response.json()["summary"]["customer"] == "Demo"
