import { apiGet, apiPost } from '../../shared/utils/apiClient';
import type { SpecRow, SpecStoreResponse, SpecUploadResponse } from './types';

export async function uploadSpecFile(file: File): Promise<SpecUploadResponse> {
  const form = new FormData();
  form.append('file', file);
  return apiPost<SpecUploadResponse>('/api/spec/upload', form);
}

export async function fetchSpecs(): Promise<SpecStoreResponse> {
  return apiGet<SpecStoreResponse>('/api/specs');
}

export async function fetchSpec(aiCode: string): Promise<SpecRow> {
  return apiGet<SpecRow>('/api/specs/' + aiCode);
}
