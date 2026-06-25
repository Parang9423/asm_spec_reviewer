export function GeneralSpecTextArea(props: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="stack">
      <strong>General Spec Raw Text</strong>
      <textarea value={props.value} onChange={(event) => props.onChange(event.target.value)} />
    </label>
  );
}
