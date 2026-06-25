import type { CompareResult, ReviewStatus } from '../compare/types';

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
  rmsRev: number | null;
  rmsRevDateTime: string;
  threshold: number | null;
  defectCount: number;
}

export interface SpecStoreResponse {
  summary: RmsSummary | null;
  specs: SpecRow[];
}

export interface SpecUploadResponse {
  summary: RmsSummary;
  specs: SpecRow[];
}
