import { apiPost } from '../../shared/utils/apiClient';
import type { GeneralSpec } from '../generalSpec/types';
import type { CompareResultDetail } from './types';

export async function runCompare(aiCode: string, generalSpec: GeneralSpec): Promise<CompareResultDetail> {
  return apiPost<CompareResultDetail>('/api/compare/' + aiCode, generalSpec);
}
