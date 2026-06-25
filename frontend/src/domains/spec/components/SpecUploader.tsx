import { useSpecStore } from '../../../stores/specStore';

export function SpecUploader() {
  const uploadSpec = useSpecStore((state) => state.uploadSpec);
  const loading = useSpecStore((state) => state.loading);
  return (
    <div className="card stack">
      <strong>RMS Spec JSON Upload</strong>
      <input
        type="file"
        accept=".json,application/json"
        disabled={loading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadSpec(file);
        }}
      />
      <span className="muted">After upload, current AI spec rules are parsed by AI_Code.</span>
    </div>
  );
}
