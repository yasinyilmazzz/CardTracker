import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { formatDateTimeTR } from '../lib/time';

interface Props {
  /** Verinin son güncellenme zamanı (ISO) */
  lastUpdated?: string | null;
}

/**
 * İnternet yokken / veri güncellenemezken gösterilen uyarı simgesi.
 * Simgeye dokunulduğunda açıklama baloncuğu (tooltip) açılır.
 * Göreli konumlu (relative) bir kapsayıcı içinde kullanılmalıdır.
 */
export default function OfflineBadge({ lastUpdated }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Bağlantı uyarısı"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 transition-transform hover:scale-105 active:scale-95"
      >
        <TriangleAlert className="h-4 w-4" />
      </button>

      {open && (
        <>
          {/* Dışarı tıklayınca kapat */}
          <span
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <span
            role="tooltip"
            className="animate-pop-in absolute top-full right-0 z-40 mt-2 block w-64 rounded-xl border border-amber-400/30 bg-night-800 p-3 text-left shadow-2xl"
          >
            <span className="flex items-center gap-1.5 text-[13px] font-bold text-amber-300">
              <TriangleAlert className="h-3.5 w-3.5" />
              Güncel veri yok
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-cream/85">
              Cihaz internete bağlı olmadığından güncel veri gösterilemiyor.
              Ekrandaki bilgiler son güncellemeye aittir.
            </span>
            {lastUpdated && (
              <span className="mt-1.5 block text-[11px] font-semibold text-sage">
                Son güncelleme: {formatDateTimeTR(lastUpdated)}
              </span>
            )}
          </span>
        </>
      )}
    </span>
  );
}
