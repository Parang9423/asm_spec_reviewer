export type Operator = 'gte' | 'gt' | 'lte' | 'lt' | 'eq' | 'none';

export interface GeneralSpecCondition {
  id: string;
  metric: string;
  operator: Operator | string;
  value: number | string;
  unit: string;
  judgement: 'NG' | 'OK' | 'UNKNOWN';
  compareAvailable: boolean;
  note?: string | null;
}

export interface UnavailableCondition {
  id: string;
  text: string;
  reason: string;
  category: 'HEIGHT' | 'VISUAL' | 'MICROSCOPE' | 'SPECIFIC_AREA' | 'METAL_EXPOSURE' | 'MANUAL_JUDGEMENT' | 'OTHER';
}

export interface GeneralSpec {
  id: string;
  aiCode: string;
  side: string;
  unitDummy: string;
  area: string;
  defectName: string;
  rawText: string;
  structuredConditions: GeneralSpecCondition[];
  unavailableConditions: UnavailableCondition[];
  createdAt: string;
  updatedAt: string;
}

export function createEmptyGeneralSpec(aiCode: string, defaults?: Partial<GeneralSpec>): GeneralSpec {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    aiCode,
    side: defaults?.side ?? '',
    unitDummy: defaults?.unitDummy ?? '',
    area: defaults?.area ?? '',
    defectName: defaults?.defectName ?? '',
    rawText: defaults?.rawText ?? '',
    structuredConditions: defaults?.structuredConditions ?? [],
    unavailableConditions: defaults?.unavailableConditions ?? [],
    createdAt: defaults?.createdAt ?? now,
    updatedAt: defaults?.updatedAt ?? now,
  };
}
