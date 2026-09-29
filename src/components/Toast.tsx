import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastMessage {
  id: number;
  text: string;
  isError: boolean;
}

interface ToastProps {
  toast: ToastMessage | null;
}

export function Toast({ toast }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className={`absolute top-16 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 pointer-events-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-bold border ${
          toast.isError
            ? 'bg-slate-900/95 border-red-500/60 text-red-300'
            : 'bg-slate-900/95 border-emerald-500/60 text-emerald-300'
        }`}
      >
        {toast.isError ? (
          <AlertCircle className="w-4 h-4 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        )}
        <span>{toast.text}</span>
      </div>
    </div>
  );
}
