"use client";

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open) {
      if (typeof dialog.showModal === 'function') {
        if (!dialog.open) dialog.showModal();
      } else {
        // jsdom (unit tests) has no HTMLDialogElement.showModal implementation.
        dialog.setAttribute('open', '');
      }
    } else if (typeof dialog.close === 'function') {
      if (dialog.open) dialog.close();
    } else {
      dialog.removeAttribute('open');
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      onClick={e => {
        if (e.target === ref.current) onCancel();
      }}
      className="surface-card rounded-[2rem] p-6 w-full max-w-sm border backdrop:bg-black/40"
    >
      <h2 className="font-black text-lg">{title}</h2>
      {description && <p className="text-sm text-card-muted-fg mt-2">{description}</p>}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-2xl font-bold text-card-muted-fg hover:bg-muted-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 rounded-2xl font-bold bg-danger text-danger-fg hover:opacity-90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
