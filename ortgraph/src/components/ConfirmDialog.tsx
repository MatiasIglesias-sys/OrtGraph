/**
 * In-app confirmation dialog — replaces the browser's native confirm().
 *
 * Renders a centered card over a dimmed backdrop with Sí / No buttons.
 * Closes on Escape or on a backdrop click (both count as "No").
 */

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 'danger' paints the confirm button red, 'neutral' blue */
  tone?: 'danger' | 'neutral';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Sí',
  cancelLabel = 'No',
  tone = 'neutral',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Escape closes the dialog
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const confirmClasses =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-500 border-red-500'
      : 'bg-blue-600 hover:bg-blue-500 border-blue-500';

  const iconClasses = tone === 'danger' ? 'text-red-400' : 'text-blue-400';

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] dialog-fade"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-[320px] rounded-xl border border-slate-700 bg-[#141822] shadow-2xl p-4 dialog-pop"
      >
        <div className="flex items-start gap-2.5 mb-3">
          <AlertTriangle size={16} className={`${iconClasses} shrink-0 mt-0.5`} />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-100 leading-snug">{title}</h2>
            <p className="text-[11px] text-slate-400 leading-snug mt-1">{message}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            className={`flex-1 px-3 py-2 rounded-lg border text-white text-xs font-semibold transition-all cursor-pointer ${confirmClasses}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
