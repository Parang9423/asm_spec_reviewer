from __future__ import annotations

from typing import Any

from app.models.domain import AiSpecCondition, RmsSummary, SpecRow, SpecUploadResponse


def _get(data: dict[str, Any], *keys: str, default: Any = None) -> Any:
    for key in keys:
        if key in data:
            return data[key]
    return default


def normalize_rms_json(data: dict[str, Any]) -> SpecUploadResponse:
    defect_types = data.get("DefectTypes", [])
    summary = RmsSummary(
        customer=_get(data, "Customer", "customer", default=""),
        category3=_get(data, "Category3", "category3", default=""),
        customized=_get(data, "Customized", "customized", default=""),
        rmsRev=_get(data, "RmsRev", "rmsRev", default=None),
        rmsRevDateTime=_get(data, "RmsRevDateTime", "rmsRevDateTime", default=""),
        threshold=_get(data, "Threshold", "threshold", default=None),
        defectCount=len(defect_types),
    )
    specs = [parse_defect_type(item) for item in defect_types]
    return SpecUploadResponse(summary=summary, specs=specs)


def parse_defect_type(item: dict[str, Any]) -> SpecRow:
    conditions: list[AiSpecCondition] = []
    for defect_condition in item.get("DefectConditions", []) or []:
        machine_type = defect_condition.get("MachineType", "None")
        no_measurement = defect_condition.get("NoMeasurementDefaultResult", "")
        for measurement_condition in defect_condition.get("MeasurementConditions", []) or []:
            root_op = measurement_condition.get("RootLogicalOperator", "None")
            default_result = measurement_condition.get("DefaultResultValue", "")
            for spec in measurement_condition.get("Specifications", []) or []:
                expressions = spec.get("Expressions", []) or []
                if not expressions:
                    continue
                for expression in expressions:
                    conditions.append(
                        AiSpecCondition(
                            measurementName=spec.get("MeasurementName", "None"),
                            unit=spec.get("Unit", "None"),
                            operator=expression.get("InequalitySign", "none"),
                            value=expression.get("Value", ""),
                            rootLogicalOperator=root_op,
                            machineType=machine_type,
                            defaultResultValue=default_result,
                            noMeasurementDefaultResult=no_measurement,
                        )
                    )
    row = SpecRow(
        aiCode=item.get("AI_Code", ""),
        side=item.get("Side", ""),
        unitDummy=item.get("Unit_Dummy", ""),
        area=item.get("Area", ""),
        defectName=item.get("DefectName", ""),
        remark=item.get("Remark"),
        conditions=conditions,
    )
    row.aiSpecText = render_ai_spec(row)
    return row


def render_ai_spec(row: SpecRow) -> str:
    if not row.conditions:
        return "No conditions"
    lines = []
    for condition in row.conditions:
        unit = "" if condition.unit in ("None", None) else condition.unit
        unit = unit.replace("MicroMeter", "um").replace("Percent", "%")
        lines.append(
            f"[{condition.machineType}] {condition.measurementName} {condition.operator} {condition.value}{unit}"
        )
    return "\n".join(lines)
