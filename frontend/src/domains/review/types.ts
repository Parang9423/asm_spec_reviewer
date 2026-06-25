import type { CompareResult, ReviewStatus } from '../compare/types';

export interface ReviewRecord {
  id: string;
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
  createdAt: string;
  updatedAt: string;
}
