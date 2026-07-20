import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-surface rounded-xl shadow-lg border border-border w-full max-w-md p-6 space-y-4 animate-in">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${danger ? 'bg-danger-light' : 'bg-warning-light'}`}>
            <AlertTriangle size={20} className={danger ? 'text-danger' : 'text-warning'} />
          </div>
          <div>
            <h3 className="font-poppins font-semibold text-base text-text-primary">{title}</h3>
            <p className="font-poppins text-sm text-text-secondary mt-1">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border font-poppins text-sm text-text-secondary hover:bg-surface-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-poppins text-sm text-white transition-colors ${
              danger
                ? 'bg-danger hover:bg-danger-dark'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
