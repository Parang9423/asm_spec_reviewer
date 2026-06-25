export type CompareResult = 'STRICTER' | 'LOOSER' | 'SAME' | 'PARTIAL' | 'NOT_COMPARABLE' | 'NOT_REVIEWED';
export type ReviewStatus = 'NOT_STARTED' | 'IN_REVIEW' | 'NEED_DISCUSSION' | 'DISCUSSION_DONE' | 'FINALIZED';

export interface AiSpecCondition {
  measurementName: string;
  unit: string;
  operator: string;
  value: number | string;
  rootLogicalOperator: string;
  machineType: string;
  defaultResultValue: string;
  noMeasurementDefaultResult: string;
}

export interface SpecRow {
  aiCode: string;
  side: string;
  unitDummy: string;
  area: string;
  defectName: string;
  remark?: string | null;
  conditions: AiSpecCondition[];
  aiSpecText: string;
  reviewStatus: ReviewStatus;
  compareResult: CompareResult;
}

export interface RmsSummary {
  customer: string;
  category3: string;
  customized: string;
  rmsRev?: number | null;
  rmsRevDateTime: string;
  threshold?: number | null;
  defectCount: number;
}

export interface GeneralSpecCondition {
  id?: string;
  metric: string;
  operator: string;
  value: number | string;
  unit: string;
  judgement: 'NG' | 'OK' | 'UNKNOWN';
  compareAvailable: boolean;
  note?: string | null;
}

export interface UnavailableCondition {
  id?: string;
  text: string;
  reason: string;
  category: 'HEIGHT' | 'VISUAL' | 'MICROSCOPE' | 'SPECIFIC_AREA' | 'METAL_EXPOSURE' | 'MANUAL_JUDGEMENT' | 'OTHER';
}

export interface GeneralSpec {
  id?: string;
  aiCode: string;
  side: string;
  unitDummy: string;
  area: string;
  defectName: string;
  rawText: string;
  structuredConditions: GeneralSpecCondition[];
  unavailableConditions: UnavailableCondition[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ComparableItem {
  metric: string;
  aiOperator: string;
  aiValue: number | string;
  aiUnit: string;
  generalOperator: string;
  generalValue: number | string;
  generalUnit: string;
  result: CompareResult;
  reason: string;
}

export interface CompareResultDetail {
  aiCode: string;
  result: CompareResult;
  summary: string;
  comparableItems: ComparableItem[];
  unavailableItems: UnavailableCondition[];
  generatedAt: string;
}

export interface ReviewRecord {
  id?: string;
  aiCode: string;
  side: string;
  unitDummy: string;
  area: string;
  defectName: string;
  currentAiSpecText: string;
  generalSpecText: string;
  autoCompareResult: CompareResult;
  autoCompareSummary: string;
  reviewerDecision: string;
  aiTeamProposal: string;
  department: string;
  firstDiscussionResult: string;
  secondDiscussionResult?: string | null;
  finalResult: string;
  status: ReviewStatus;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}
