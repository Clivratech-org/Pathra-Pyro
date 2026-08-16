export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="loader-ring" />
      <p>{label}</p>
    </div>
  );
}

export function InlineSpinner({ label }: { label?: string }) {
  return (
    <span className="inline-spinner" aria-hidden={!label}>
      <span className="spinner-dot" />
      {label ? <span>{label}</span> : null}
    </span>
  );
}
