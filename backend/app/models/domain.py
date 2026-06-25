from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Literal
from uuid import uuid4

from pydantic import BaseModel, Field


class CompareResult(str, Enum):
    STRICTER = "STRICTER"
    LOOSER = "LOOSER"
    SAME = "SAME"
    PARTIAL = "PARTIAL"
    NOT_COMPARABLE = "NOT_COMPARABLE"
    NOT_REVIEWED = "NOT_REVIEWED"


class ReviewStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_REVIEW = "IN_REVIEW"
    NEED_DISCUSSION = "NEED_DISCUSSION"
    DISCUSSION_DONE = "DISCUSSION_DONE"
    FINALIZED = "FINALIZED"


class GeneralSpecCondition(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    metric: str
    operator: str
    value: float | str
    unit: str
    judgement: Literal["NG", "OK", "UNKNOWN"] = "NG"
    compareAvailable: bool = True
    note: str | None = None


class UnavailableCondition(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    text: str
    reason: str
    category: Literal[
        "HEIGHT",
        "VISUAL",
        "MICROSCOPE",
        "SPECIFIC_AREA",
        "METAL_EXPOSURE",
        "MANUAL_JUDGEMENT",
        "OTHER",
    ] = "OTHER"


class GeneralSpec(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    aiCode: str
    side: str = ""
    unitDummy: str = ""
    area: str = ""
    defectName: str = ""
    rawText: str = ""
    structuredConditions: list[GeneralSpecCondition] = Field(default_factory=list)
    unavailableConditions: list[UnavailableCondition] = Field(default_factory=list)
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AiSpecCondition(BaseModel):
    measurementName: str
    unit: str
    operator: str
    value: float | str
    rootLogicalOperator: str = "None"
    machineType: str = "None"
    defaultResultValue: str = ""
    noMeasurementDefaultResult: str = ""


class SpecRow(BaseModel):
    aiCode: str
    side: str
    unitDummy: str
    area: str
    defectName: str
    remark: str | None = None
    conditions: list[AiSpecCondition] = Field(default_factory=list)
    aiSpecText: str = ""
    reviewStatus: ReviewStatus = ReviewStatus.NOT_STARTED
    compareResult: CompareResult = CompareResult.NOT_REVIEWED


class RmsSummary(BaseModel):
    customer: str = ""
    category3: str = ""
    customized: str = ""
    rmsRev: int | None = None
    rmsRevDateTime: str = ""
    threshold: int | float | None = None
    defectCount: int = 0


class SpecUploadResponse(BaseModel):
    summary: RmsSummary
    specs: list[SpecRow]


class ComparableItem(BaseModel):
    metric: str
    aiOperator: str
    aiValue: float | str
    aiUnit: str
    generalOperator: str
    generalValue: float | str
    generalUnit: str
    result: CompareResult
    reason: str


class CompareResultDetail(BaseModel):
    aiCode: str
    result: CompareResult
    summary: str
    comparableItems: list[ComparableItem] = Field(default_factory=list)
    unavailableItems: list[UnavailableCondition] = Field(default_factory=list)
    generatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ReviewRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    aiCode: str
    side: str = ""
    unitDummy: str = ""
    area: str = ""
    defectName: str = ""
    currentAiSpecText: str = ""
    generalSpecText: str = ""
    autoCompareResult: CompareResult = CompareResult.NOT_REVIEWED
    autoCompareSummary: str = ""
    reviewerDecision: str = ""
    aiTeamProposal: str = ""
    department: str = ""
    firstDiscussionResult: str = ""
    secondDiscussionResult: str | None = None
    finalResult: str = ""
    status: ReviewStatus = ReviewStatus.IN_REVIEW
    createdBy: str = "AI_TEAM"
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class JsonStore(BaseModel):
    summary: RmsSummary | None = None
    specs: list[SpecRow] = Field(default_factory=list)
    generalSpecs: list[GeneralSpec] = Field(default_factory=list)
    reviews: list[ReviewRecord] = Field(default_factory=list)
