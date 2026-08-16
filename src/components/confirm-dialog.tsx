"use client";

import { useEffect, useId, useState } from "react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger,
  pending,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay show"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onCancel}
    >
      <div className="card form-card static confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 id={titleId}>{title}</h3>
        <p className="confirm-msg">{message}</p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={pending}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const [state, setState] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    resolve: (ok: boolean) => void;
  } | null>(null);

  function confirm(opts: {
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
  }) {
    return new Promise<boolean>((resolve) => {
      setState({ ...opts, resolve });
    });
  }

  const dialog = (
    <ConfirmDialog
      open={Boolean(state)}
      title={state?.title || ""}
      message={state?.message || ""}
      confirmLabel={state?.confirmLabel}
      danger={state?.danger}
      onCancel={() => {
        state?.resolve(false);
        setState(null);
      }}
      onConfirm={() => {
        state?.resolve(true);
        setState(null);
      }}
    />
  );

  return { confirm, dialog };
}
