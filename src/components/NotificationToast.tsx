import { BellRing, X } from 'lucide-react';
import type { AppNotification } from '../lib/types';

interface Props {
  toast: AppNotification | null;
  onDismiss: () => void;
}

/** Uygulama içi bildirim şeridi (sistem bildirimi gösterilemese bile görünür) */
export default function NotificationToast({ toast, onDismiss }: Props) {
  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex justify-center px-4">
      <div
        role="alert"
        className="animate-pop-in pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-gold-500/50 bg-night-800 p-4 shadow-2xl"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500 text-night-950">
          <BellRing className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-[15px] font-extrabold text-cream">{toast.title}</p>
          <p className="mt-0.5 text-sm leading-relaxed text-cream/80">{toast.body}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Kapat"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sage transition-colors hover:bg-night-700 hover:text-cream"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
