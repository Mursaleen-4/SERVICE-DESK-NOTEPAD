import React from 'react';
import { X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export default function MessageBoxModal({
  isOpen,
  title = 'Confirmation Required',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'info'
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: AlertTriangle,
          iconColor: 'text-rose-400',
          confirmBtn: 'bg-rose-700 hover:bg-rose-600 border-rose-500/60 text-white',
          border: 'border-zinc-800'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
          confirmBtn: 'bg-amber-700 hover:bg-amber-600 border-amber-500/60 text-white',
          border: 'border-zinc-800'
        };
      default:
        return {
          icon: Info,
          iconColor: 'text-sky-400',
          confirmBtn: 'bg-sky-700 hover:bg-sky-600 border-sky-500/60 text-white',
          border: 'border-zinc-800'
        };
    }
  };

  const styles = getTypeStyles();
  const Icon = styles.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-xl bg-[#0c1017] border border-zinc-800 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Icon className={`w-4 h-4 ${styles.iconColor}`} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 text-xs text-slate-300 leading-relaxed">
          {message}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-950/60 flex items-center justify-end gap-2.5">
          {cancelText && (
            <button
              onClick={onCancel}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-1.5 rounded-lg border text-xs font-bold tracking-wide transition-colors cursor-pointer ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
