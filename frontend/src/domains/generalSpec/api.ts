import { apiGet, apiPut } from '../../shared/utils/apiClient';
import type { GeneralSpec } from './types';

export async function fetchGeneralSpec(aiCode: string): Promise<GeneralSpec | null> {
  try {
    return await apiGet<GeneralSpec>('/api/general-specs/' + aiCode);
  } catch {
    return null;
  }
}

export async function saveGeneralSpec(aiCode: string, spec: GeneralSpec): Promise<GeneralSpec> {
  return apiPut<GeneralSpec>('/api/general-specs/' + aiCode, spec);
}
