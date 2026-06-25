import type { GeneralSpec } from '../types';
import { GeneralSpecTextArea } from './GeneralSpecTextArea';

export function GeneralSpecEditor(props: { value: GeneralSpec; onChange: (value: GeneralSpec) => void; onSave: () => void }) {
  const { value, onChange, onSave } = props;
  return (
    <div className="card stack">
      <GeneralSpecTextArea value={value.rawText} onChange={(rawText) => onChange({ ...value, rawText })} />
      <button type="button" onClick={onSave}>Save General Spec</button>
    </div>
  );
}
