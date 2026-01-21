import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly message?: ReactNode;
  readonly confirmText?: string;
  readonly cancelText?: string;
  readonly variant?: 'danger' | 'warning' | 'default';
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmStyles =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-500 text-white'
      : variant === 'warning'
      ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
      : 'bg-blue-600 hover:bg-blue-500 text-white';

  const iconColor =
    variant === 'danger'
      ? 'text-red-400'
      : variant === 'warning'
      ? 'text-yellow-400'
      : 'text-blue-400';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl shadow-2xl">
        <div className="p-5 border-b border-gray-700 flex items-start gap-3">
          <AlertTriangle className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {message && <div className="mt-1 text-sm text-gray-300">{message}</div>}
          </div>
        </div>

        <div className="p-5 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors min-h-[48px]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-4 font-medium rounded-lg transition-colors min-h-[48px] ${confirmStyles}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

