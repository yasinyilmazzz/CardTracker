import { useState } from 'react';
import {
  Clock3,
  Home,
  LocateFixed,
  Lock,
  MapPin,
  Menu,
  MoonStar,
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import type { PageKey } from '../lib/types';
import PatternBackground from './PatternBackground';

interface Props {
  page: PageKey;
  onNavigate: (page: PageKey) => void;
  cityLabel: string | null;
  /** Konum cihazdan alınıyorsa farklı ikon göster */
  isDeviceLocation?: boolean;
  online: boolean;
  /** İlk kurulum tamamlanmadıysa diğer sayfalar kilitlenir */
  locked: boolean;
}

const NAV_ITEMS: { key: PageKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Ana Sayfa', icon: Home },
  { key: 'times', label: 'Namaz Vakitleri', icon: Clock3 },
  { key: 'settings', label: 'Ayarlar', icon: SettingsIcon },
];

export default function Header({
  page,
  onNavigate,
  cityLabel,
  isDeviceLocation = false,
  online,
  locked,
}: Props) {
  const [open, setOpen] = useState(false);
  const LocIcon = isDeviceLocation ? LocateFixed : MapPin;
  const locIconCls = isDeviceLocation ? 'text-emerald-300' : 'text-gold-500';

  const handleNav = (key: PageKey) => {
    if (locked && key !== 'settings') return;
    onNavigate(key);
    setOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-night-700/60 bg-night-900/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-500/50 bg-night-800 text-gold-400">
              <MoonStar className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="leading-tight">
              <p className="text-[15px] font-extrabold tracking-tight text-cream">
                Namaz Vakitleri
              </p>
              {cityLabel && (
                <p className="flex items-center gap-1 text-xs font-medium text-sage">
                  <LocIcon className={`h-3 w-3 ${locIconCls}`} />
                  {cityLabel}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Menüyü aç"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-night-700 bg-night-800 text-cream transition-colors hover:border-gold-500/60 hover:text-gold-300 active:scale-95"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Karartma */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Yan menü (drawer) */}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-l border-night-700 bg-night-900 shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <div className="relative overflow-hidden border-b border-night-700/70 px-5 py-6">
          <PatternBackground id="drawer-pattern" className="opacity-[0.06]" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-500/50 bg-night-800 text-gold-400">
                <MoonStar className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-extrabold text-cream">Namaz Vakitleri</p>
                <p className="text-xs text-sage">Ezan saatleri &amp; geri sayım</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Menüyü kapat"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-sage transition-colors hover:bg-night-800 hover:text-cream"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {cityLabel && (
            <p className="relative mt-4 flex items-center gap-1.5 text-sm font-semibold text-gold-300">
              <MapPin className="h-4 w-4" />
              {cityLabel}
            </p>
          )}
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = page === item.key;
            const isLocked = locked && item.key !== 'settings';
            return (
              <button
                key={item.key}
                type="button"
                disabled={isLocked}
                onClick={() => handleNav(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[15px] font-semibold transition-all ${
                  isActive
                    ? 'border border-gold-500/40 bg-gold-500/10 text-gold-300'
                    : 'border border-transparent text-cream hover:bg-night-800'
                } ${isLocked ? 'cursor-not-allowed opacity-45' : ''}`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-gold-400' : 'text-sage'}`} />
                <span className="flex-1">{item.label}</span>
                {isLocked && <Lock className="h-4 w-4 text-sage" />}
              </button>
            );
          })}

          {locked && (
            <p className="px-4 pt-2 text-xs leading-relaxed text-sage">
              Devam etmek için önce Ayarlar bölümünden şehrinizi seçin.
            </p>
          )}
        </nav>

        <div className="border-t border-night-700/70 px-5 py-4">
          <p
            className={`flex items-center gap-2 text-sm font-semibold ${
              online ? 'text-emerald-300' : 'text-amber-300'
            }`}
          >
            {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {online ? 'Çevrimiçi' : 'Çevrimdışı'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-sage-dark">
            {online
              ? 'Veriler güncel tutuluyor.'
              : 'Vakitler cihazdaki kayıttan gösteriliyor.'}
          </p>
        </div>
      </aside>
    </>
  );
}
