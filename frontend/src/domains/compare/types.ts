import type { UnavailableCondition } from '../generalSpec/types';

export type CompareResult = 'STRICTER' | 'LOOSER' | 'SAME' | 'PARTIAL' | 'NOT_COMPARABLE' | 'NOT_REVIEWED';
export type ReviewStatus = 'NOT_STARTED' | 'IN_REVIEW' | 'NEED_DISCUSSION' | 'DISCUSSION_DONE' | 'FINALIZED';

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
