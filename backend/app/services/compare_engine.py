from __future__ import annotations

from app.models.domain import ComparableItem, CompareResult, CompareResultDetail, GeneralSpec, SpecRow

NG_OPERATORS = {"gte", "gt", "lte", "lt", "eq"}


def _to_float(value: float | str) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def compare_numeric_ng(ai_operator: str, ai_value: float, general_operator: str, general_value: float) -> CompareResult:
    if ai_operator == general_operator and ai_value == general_value:
        return CompareResult.SAME
    if ai_operator in {"gte", "gt"} and general_operator in {"gte", "gt"}:
        return CompareResult.STRICTER if ai_value < general_value else CompareResult.LOOSER
    if ai_operator in {"lte", "lt"} and general_operator in {"lte", "lt"}:
        return CompareResult.STRICTER if ai_value > general_value else CompareResult.LOOSER
    return CompareResult.NOT_COMPARABLE


def compare_spec(spec: SpecRow, general_spec: GeneralSpec) -> CompareResultDetail:
    comparable: list[ComparableItem] = []
    ai_by_metric = {condition.measurementName: condition for condition in spec.conditions}

    for general_condition in general_spec.structuredConditions:
        if not general_condition.compareAvailable:
            continue
        ai_condition = ai_by_metric.get(general_condition.metric)
        if ai_condition is None:
            continue
        ai_value = _to_float(ai_condition.value)
        general_value = _to_float(general_condition.value)
        if ai_value is None or general_value is None:
            result = CompareResult.NOT_COMPARABLE
        elif general_condition.judgement == "NG" and ai_condition.operator in NG_OPERATORS:
            result = compare_numeric_ng(ai_condition.operator, ai_value, general_condition.operator, general_value)
        else:
            result = CompareResult.NOT_COMPARABLE
        comparable.append(
            ComparableItem(
                metric=general_condition.metric,
                aiOperator=ai_condition.operator,
                aiValue=ai_condition.value,
                aiUnit=ai_condition.unit,
                generalOperator=general_condition.operator,
                generalValue=general_condition.value,
                generalUnit=general_condition.unit,
                result=result,
                reason=_reason(result, ai_condition.value, general_condition.value),
            )
        )

    result = _aggregate_result(comparable, len(general_spec.unavailableConditions))
    return CompareResultDetail(
        aiCode=spec.aiCode,
        result=result,
        summary=_summary(result),
        comparableItems=comparable,
        unavailableItems=general_spec.unavailableConditions,
    )


def _aggregate_result(items: list[ComparableItem], unavailable_count: int) -> CompareResult:
    if not items and unavailable_count > 0:
        return CompareResult.NOT_COMPARABLE
    if not items:
        return CompareResult.NOT_REVIEWED
    results = {item.result for item in items}
    if unavailable_count > 0 or CompareResult.NOT_COMPARABLE in results or len(results) > 1:
        return CompareResult.PARTIAL
    return next(iter(results))


def _reason(result: CompareResult, ai_value: float | str, general_value: float | str) -> str:
    if result == CompareResult.STRICTER:
        return f"AI Spec value ({ai_value}) is stricter than General Spec value ({general_value})."
    if result == CompareResult.LOOSER:
        return f"AI Spec value ({ai_value}) is looser than General Spec value ({general_value})."
    if result == CompareResult.SAME:
        return "AI Spec and General Spec have the same numeric condition."
    return "Automatic comparison is limited by metric, operator, unit, or judgement differences."


def _summary(result: CompareResult) -> str:
    return {
        CompareResult.STRICTER: "AI Spec is stricter than General Spec.",
        CompareResult.LOOSER: "AI Spec is looser than General Spec.",
        CompareResult.SAME: "AI Spec and General Spec are equivalent.",
        CompareResult.PARTIAL: "Only part of the spec could be compared automatically.",
        CompareResult.NOT_COMPARABLE: "Automatic comparison is not available. Manual review is required.",
        CompareResult.NOT_REVIEWED: "General Spec conditions are not available yet.",
    }[result]
