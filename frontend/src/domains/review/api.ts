import { apiGet, apiPost, apiPut } from '../../shared/utils/apiClient';
import type { ReviewRecord } from './types';

export async function fetchReviews(): Promise<{ reviews: ReviewRecord[] }> {
  return apiGet<{ reviews: ReviewRecord[] }>('/api/reviews');
}

export async function fetchReviewsByAiCode(aiCode: string): Promise<{ reviews: ReviewRecord[] }> {
  return apiGet<{ reviews: ReviewRecord[] }>('/api/reviews/' + aiCode);
}

export async function createReview(payload: ReviewRecord): Promise<ReviewRecord> {
  return apiPost<ReviewRecord>('/api/reviews', payload);
}

export async function updateReview(reviewId: string, payload: ReviewRecord): Promise<ReviewRecord> {
  return apiPut<ReviewRecord>('/api/reviews/' + reviewId, payload);
}
