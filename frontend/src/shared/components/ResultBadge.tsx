import type { CompareResult } from '../../domains/compare/types';

const labels: Record<CompareResult, string> = {
  STRICTER: 'Stricter',
  LOOSER: 'Looser',
  SAME: 'Same',
  PARTIAL: 'Partial',
  NOT_COMPARABLE: 'N/A',
  NOT_REVIEWED: 'Not reviewed',
};

const classes: Partial<Record<CompareResult, string>> = {
  STRICTER: 'strict',
  LOOSER: 'loose',
  SAME: 'same',
  PARTIAL: 'partial',
};

export function ResultBadge({ result }: { result: CompareResult }) {
  return <span className={'badge ' + (classes[result] ?? '')}>{labels[result]}</span>;
}
