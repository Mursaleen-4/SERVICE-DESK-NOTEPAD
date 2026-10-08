import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle2,
          iconColor: 'text-emerald-400',
          titleColor: 'text-emerald-400',
          border: 'border-emerald-800/80'
        };
      case 'error':
        return {
          icon: AlertCircle,
          iconColor: 'text-rose-400',
          titleColor: 'text-rose-400',
          border: 'border-rose-800/80'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
          titleColor: 'text-amber-400',
          border: 'border-amber-800/80'
        };
      default:
        return {
          icon: Info,
          iconColor: 'text-sky-400',
          titleColor: 'text-sky-400',
          border: 'border-sky-800/80'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type);
        const Icon = styles.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-lg bg-zinc-950 border ${styles.border} p-3 shadow-2xl flex items-start gap-3 transition-all duration-200 animate-in fade-in slide-in-from-top-1`}
          >
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${styles.iconColor}`} />
            <div className="flex-1 min-w-0">
              {toast.title && (
                <div className={`text-xs font-bold uppercase tracking-wider ${styles.titleColor}`}>
                  {toast.title}
                </div>
              )}
              <div className="text-xs text-slate-300 mt-0.5 leading-snug">
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
