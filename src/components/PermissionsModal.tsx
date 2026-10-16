import { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Loader2,
  MapPin,
  MoonStar,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type { PermissionState } from '../lib/types';
import PatternBackground from './PatternBackground';

interface Props {
  notificationPermission: PermissionState;
  locationPermission: PermissionState;
  onRequestNotification: () => Promise<PermissionState>;
  onRequestLocation: () => Promise<unknown>;
  onDone: () => void;
}

function StatusPill({ state }: { state: PermissionState }) {
  if (state === 'granted')
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-emerald-300">
        <CheckCircle2 className="h-4 w-4" /> Verildi
      </span>
    );
  if (state === 'denied')
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-red-300">
        <XCircle className="h-4 w-4" /> Reddedildi
      </span>
    );
  if (state === 'unsupported')
    return <span className="text-xs font-bold text-sage">Desteklenmiyor</span>;
  return <span className="text-xs font-bold text-amber-300">Bekliyor</span>;
}

/** İlk kurulumda bildirim ve konum izinlerini isteyen karşılama penceresi */
export default function PermissionsModal({
  notificationPermission,
  locationPermission,
  onRequestNotification,
  onRequestLocation,
  onDone,
}: Props) {
  const [busy, setBusy] = useState(false);

  const allSettled =
    notificationPermission !== 'prompt' && locationPermission !== 'prompt';

  const requestAll = async () => {
    setBusy(true);
    try {
      if (notificationPermission === 'prompt') await onRequestNotification();
      if (locationPermission === 'prompt') await onRequestLocation();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="animate-fade-up relative w-full max-w-md overflow-hidden rounded-3xl border border-night-600 bg-night-900 shadow-2xl">
        <div className="relative overflow-hidden border-b border-night-700 px-6 py-6">
          <PatternBackground id="perm-pattern" className="opacity-[0.07]" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/50 bg-night-800 text-gold-400">
              <MoonStar className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-cream">Hoş Geldiniz</h2>
              <p className="text-sm text-sage">Uygulamayı kurmak için izinler gerekli</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-6 py-5">
          <div className="flex items-start gap-3 rounded-2xl border border-night-700 bg-night-850 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-night-750 text-gold-300">
              <Bell className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-extrabold text-cream">Bildirim İzni</p>
                <StatusPill state={notificationPermission} />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-sage">
                Namaz vakti yaklaştığında ve vakit girdiğinde cihazınıza bildirim
                gönderebilmemiz için gereklidir.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-night-700 bg-night-850 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-night-750 text-gold-300">
              <MapPin className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-extrabold text-cream">Konum İzni</p>
                <StatusPill state={locationPermission} />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-sage">
                Vakitleri ve hava durumunu bulunduğunuz konuma göre gösterebilmemiz
                için gereklidir. Dilerseniz şehrinizi elle de seçebilirsiniz.
              </p>
            </div>
          </div>

          <p className="flex items-start gap-2 px-1 text-[11px] leading-relaxed text-sage-dark">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-600" />
            Konum bilginiz yalnızca cihazınızda saklanır; herhangi bir sunucuya
            gönderilmez.
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-night-700 px-6 py-4 sm:flex-row-reverse">
          {allSettled ? (
            <button
              type="button"
              onClick={onDone}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold-500 text-[15px] font-extrabold text-night-950 transition-colors hover:bg-gold-400"
            >
              <CheckCircle2 className="h-5 w-5" />
              Devam Et
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={requestAll}
                disabled={busy}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gold-500 text-[15px] font-extrabold text-night-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    İzinler isteniyor…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5" />
                    İzinleri Ver
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onDone}
                disabled={busy}
                className="h-12 rounded-xl border border-night-600 px-5 text-sm font-bold text-sage transition-colors hover:bg-night-800 hover:text-cream disabled:opacity-50"
              >
                Şimdi Değil
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
