import { apiGet } from '../../shared/utils/apiClient';
import type { ReviewRecord } from '../review/types';

export async function fetchHistory() {
  return apiGet<{ reviews: ReviewRecord[] }>('/api/history');
}
