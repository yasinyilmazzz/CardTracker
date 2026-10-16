import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  Building2,
  CheckCircle2,
  ChevronDown,
  CloudOff,
  Crosshair,
  Database,
  Globe2,
  Info,
  Loader2,
  LocateFixed,
  MapPin,
  MoonStar,
  Navigation,
  RefreshCw,
  Save,
  Settings as SettingsIcon,
  TriangleAlert,
  XCircle,
} from 'lucide-react';
import type { PermissionState, PrayerCache, Settings } from '../lib/types';
import { COUNTRIES, findNearestCity, getCountry } from '../data/locations';
import { formatDateTimeTR, PRAYER_NAMES_TR, PRAYER_ORDER } from '../lib/time';
import { resolveSettingsLocation } from '../lib/location';
import type { GeolocationState } from '../hooks/useGeolocation';
import type { NotificationsState } from '../hooks/useNotifications';
import { PRAYER_ICONS } from '../lib/prayerIcons';

interface Props {
  initialSettings: Settings | null;
  isFirstRun: boolean;
  cache: PrayerCache | null;
  online: boolean;
  loading: boolean;
  error: string | null;
  onSave: (s: Settings) => void;
  onRefreshData: () => void;
  geo: GeolocationState;
  notifications: NotificationsState;
}

const selectClass =
  'h-12 w-full appearance-none rounded-xl border border-night-600 bg-night-800 pr-10 pl-10 text-[15px] font-bold text-cream transition-colors outline-none focus:border-gold-500 disabled:opacity-50';

function PermissionBadge({ state }: { state: PermissionState }) {
  const map: Record<PermissionState, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
    granted: { label: 'İzin verildi', cls: 'text-emerald-300 border-emerald-400/30 bg-emerald-400/10', Icon: CheckCircle2 },
    denied: { label: 'Reddedildi', cls: 'text-red-300 border-red-400/30 bg-red-400/10', Icon: XCircle },
    prompt: { label: 'İzin istenmedi', cls: 'text-amber-300 border-amber-400/30 bg-amber-400/10', Icon: Info },
    unsupported: { label: 'Desteklenmiyor', cls: 'text-sage border-night-500 bg-night-800', Icon: XCircle },
  };
  const { label, cls, Icon } = map[state];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
        checked ? 'bg-gold-500' : 'bg-night-600'
      }`}
    >
      <span
        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-cream shadow transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}

export default function SettingsPage({
  initialSettings,
  isFirstRun,
  cache,
  online,
  loading,
  error,
  onSave,
  onRefreshData,
  geo,
  notifications,
}: Props) {
  const [countryId, setCountryId] = useState<string>(initialSettings?.countryId ?? 'TR');
  const [cityId, setCityId] = useState<string>(initialSettings?.cityId ?? '');
  const [savedMsg, setSavedMsg] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locMsg, setLocMsg] = useState<string | null>(null);

  const country = useMemo(() => getCountry(countryId), [countryId]);
  const activeLoc = initialSettings ? resolveSettingsLocation(initialSettings) : null;
  const usingLocation = !!activeLoc?.isDeviceLocation;

  const isDirty =
    initialSettings === null ||
    usingLocation ||
    initialSettings.countryId !== countryId ||
    initialSettings.cityId !== cityId;

  useEffect(() => {
    if (!savedMsg) return;
    const t = setTimeout(() => setSavedMsg(false), 3000);
    return () => clearTimeout(t);
  }, [savedMsg]);

  const handleCountryChange = (id: string) => {
    setCountryId(id);
    setCityId('');
    setSavedMsg(false);
  };

  const handleSaveCity = () => {
    if (!cityId) return;
    onSave({ countryId, cityId, mode: 'city' });
    if (!isFirstRun) setSavedMsg(true);
  };

  /** "Konumumu Kullan" — izin yoksa tarayıcı yeniden izin ister */
  const handleUseLocation = async () => {
    setLocating(true);
    setLocMsg(null);
    const point = await geo.request();
    setLocating(false);
    if (!point) return; // hata mesajı geo.error üzerinden gösterilir
    const nearest = findNearestCity(point.lat, point.lon);
    setCountryId(nearest.country.id);
    setCityId(nearest.city.id);
    onSave({
      countryId: nearest.country.id,
      cityId: nearest.city.id,
      mode: 'location',
      location: point,
    });
    setLocMsg(`Konumunuz kullanılıyor: ${point.name}`);
  };

  const cachedDayCount = cache ? Object.keys(cache.days).length : 0;
  const n = notifications;
  const notifBlocked = n.permission === 'denied' || n.permission === 'unsupported';

  return (
    <div className="space-y-4">
      <section className="animate-fade-up">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-cream">
          <SettingsIcon className="h-6 w-6 text-gold-400" />
          Ayarlar
        </h2>
        <p className="mt-1 text-sm text-sage">
          Vakitlerin hesaplanacağı konumu ve bildirim tercihlerinizi belirleyin.
        </p>
      </section>

      {isFirstRun && (
        <section className="animate-fade-up rounded-3xl border border-gold-500/40 bg-gold-500/8 p-5 shadow-lg" style={{ animationDelay: '40ms' }}>
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500 text-night-950">
              <MoonStar className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <div>
              <h3 className="font-extrabold text-cream">Hoş Geldiniz!</h3>
              <p className="mt-1 text-sm leading-relaxed text-cream/85">
                Başlamak için konumunuzu kullanın ya da ülke/şehir seçip kaydedin.
                Konumunuza ait <strong>1 aylık namaz vakitleri</strong> cihazınıza
                indirilecek; sonrasında internet olmadan da vakitleri görebileceksiniz.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Konuma göre */}
      <section className="animate-fade-up rounded-3xl border border-night-700 bg-night-850 p-5 shadow-lg" style={{ animationDelay: '60ms' }}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-gold-400" />
            <h3 className="text-base font-extrabold text-cream">Konumuma Göre</h3>
          </div>
          <PermissionBadge state={geo.permission} />
        </div>

        {usingLocation && activeLoc && (
          <div className="mb-3 flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/8 px-3.5 py-3">
            <LocateFixed className="h-4 w-4 shrink-0 text-emerald-300" />
            <p className="text-sm font-semibold text-emerald-200">
              Aktif: {activeLoc.displayName}
              <span className="ml-1 text-xs font-medium text-emerald-300/70">
                ({activeLoc.lat.toFixed(3)}, {activeLoc.lon.toFixed(3)})
              </span>
            </p>
          </div>
        )}

        <p className="text-sm leading-relaxed text-sage">
          Vakitler ve hava durumu, cihazınızın bulunduğu konuma göre alınır.
          {geo.permission === 'prompt' && ' Butona bastığınızda konum izni istenecektir.'}
        </p>

        <button
          type="button"
          onClick={handleUseLocation}
          disabled={locating || loading || geo.permission === 'unsupported'}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gold-500/50 bg-night-800 text-[15px] font-extrabold text-gold-300 transition-all hover:bg-gold-500/10 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {locating || geo.loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Konum alınıyor…
            </>
          ) : (
            <>
              <Crosshair className="h-5 w-5" />
              {geo.permission === 'granted' && usingLocation
                ? 'Konumumu Güncelle'
                : 'Konumumu Kullan'}
            </>
          )}
        </button>

        {locMsg && !geo.error && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            {locMsg}
          </p>
        )}

        {geo.error && (
          <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/5 px-3.5 py-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-xs leading-relaxed text-amber-200/90">{geo.error}</p>
          </div>
        )}

        {!usingLocation && geo.permission === 'granted' && geo.point && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-sage">
            <MapPin className="h-3.5 w-3.5 text-gold-500" />
            Tespit edilen konum: {geo.point.name}
          </p>
        )}
      </section>

      {/* Şehir seçimi */}
      <section className="animate-fade-up rounded-3xl border border-night-700 bg-night-850 p-5 shadow-lg" style={{ animationDelay: '80ms' }}>
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-gold-400" />
          <h3 className="text-base font-extrabold text-cream">Şehir Seçimi</h3>
          {!usingLocation && initialSettings && (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-emerald-300 uppercase">
              Aktif
            </span>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="country-select" className="mb-1.5 block text-xs font-extrabold tracking-[0.15em] text-sage uppercase">
              Ülke
            </label>
            <div className="relative">
              <Globe2 className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gold-400" />
              <select id="country-select" value={countryId} onChange={(e) => handleCountryChange(e.target.value)} className={selectClass}>
                {COUNTRIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-sage" />
            </div>
          </div>

          <div>
            <label htmlFor="city-select" className="mb-1.5 block text-xs font-extrabold tracking-[0.15em] text-sage uppercase">
              Şehir
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gold-400" />
              <select
                id="city-select"
                value={cityId}
                onChange={(e) => { setCityId(e.target.value); setSavedMsg(false); }}
                className={selectClass}
              >
                <option value="" disabled>Şehir Seçiniz</option>
                {country?.cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-sage" />
            </div>
            {!cityId && (
              <p className="mt-1.5 text-xs font-medium text-amber-300">
                Devam etmek için bir şehir seçmelisiniz.
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-2xl bg-night-800/70 px-3.5 py-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" />
            <p className="text-xs leading-relaxed text-sage">
              <span className="font-bold text-cream">Hesaplama yöntemi:</span>{' '}
              {country?.methodName}. Vakitler, seçilen konumun koordinatlarına göre hesaplanır.
            </p>
          </div>

          {!online && (
            <div className="flex items-start gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/5 px-3.5 py-3">
              <CloudOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <p className="text-xs leading-relaxed text-amber-200/90">
                Şu an internet bağlantısı yok. Seçiminiz kaydedilir ancak vakitler, bağlantı kurulduğunda indirilir.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-2xl border border-red-400/30 bg-red-400/5 px-3.5 py-3">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <p className="text-xs leading-relaxed text-red-200/90">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveCity}
            disabled={!cityId || loading}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-extrabold transition-all active:scale-[0.99] ${
              savedMsg && !isDirty ? 'bg-emerald-500 text-night-950' : 'bg-gold-500 text-night-950 hover:bg-gold-400'
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin" />Vakitler İndiriliyor…</>
            ) : savedMsg && !isDirty ? (
              <><CheckCircle2 className="h-5 w-5" />Kaydedildi</>
            ) : (
              <><Save className="h-5 w-5" />{isFirstRun ? 'Kaydet ve Vakitleri İndir' : usingLocation ? 'Bu Şehri Kullan' : 'Kaydet'}</>
            )}
          </button>
        </div>
      </section>

      {/* Bildirimler */}
      <section className="animate-fade-up rounded-3xl border border-night-700 bg-night-850 p-5 shadow-lg" style={{ animationDelay: '110ms' }}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-gold-400" />
            <h3 className="text-base font-extrabold text-cream">Bildirimler</h3>
          </div>
          <PermissionBadge state={n.permission} />
        </div>

        {n.permission === 'prompt' && (
          <button
            type="button"
            onClick={() => void n.requestPermission()}
            className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gold-500 text-sm font-extrabold text-night-950 transition-colors hover:bg-gold-400"
          >
            <BellRing className="h-4 w-4" />
            Bildirim İzni Ver
          </button>
        )}

        {n.permission === 'denied' && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-400/30 bg-amber-400/5 px-3.5 py-3">
            <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
            <p className="text-xs leading-relaxed text-amber-200/90">
              Bildirim izni reddedilmiş. Sistem bildirimleri için tarayıcı/cihaz ayarlarından bu
              uygulamaya izin verin. Uygulama açıkken ekran içi uyarılar yine gösterilir.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-2xl bg-night-800/70 px-3.5 py-3">
            <div>
              <p className="text-sm font-bold text-cream">Bildirimleri etkinleştir</p>
              <p className="text-xs text-sage">Vakit hatırlatmaları ve vakit girişi</p>
            </div>
            <Toggle checked={n.settings.enabled} onChange={() => n.updateSettings({ enabled: !n.settings.enabled })} label="Bildirimler" />
          </div>

          <div className={`space-y-2 transition-opacity ${n.settings.enabled ? '' : 'pointer-events-none opacity-40'}`}>
            <div className="flex items-center justify-between rounded-2xl bg-night-800/70 px-3.5 py-3">
              <div>
                <p className="text-sm font-bold text-cream">Vakit girdiğinde bildir</p>
                <p className="text-xs text-sage">Ezan vaktinde bildirim gönder</p>
              </div>
              <Toggle checked={n.settings.onTime} onChange={() => n.updateSettings({ onTime: !n.settings.onTime })} label="Vakit girdiğinde" />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-night-800/70 px-3.5 py-3">
              <div>
                <p className="text-sm font-bold text-cream">Önceden hatırlat</p>
                <p className="text-xs text-sage">Vakte kaç dakika kala</p>
              </div>
              <div className="relative">
                <select
                  value={n.settings.minutesBefore}
                  onChange={(e) => n.updateSettings({ minutesBefore: Number(e.target.value) })}
                  aria-label="Hatırlatma süresi"
                  className="h-10 appearance-none rounded-xl border border-night-600 bg-night-900 pr-8 pl-3 text-sm font-bold text-cream outline-none focus:border-gold-500"
                >
                  <option value={0}>Kapalı</option>
                  <option value={5}>5 dk</option>
                  <option value={10}>10 dk</option>
                  <option value={15}>15 dk</option>
                  <option value={30}>30 dk</option>
                  <option value={45}>45 dk</option>
                  <option value={60}>60 dk</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-sage" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-night-800/70 px-3.5 py-3">
              <div>
                <p className="text-sm font-bold text-cream">Titreşim</p>
                <p className="text-xs text-sage">Bildirimde cihazı titret</p>
              </div>
              <Toggle checked={n.settings.vibrate} onChange={() => n.updateSettings({ vibrate: !n.settings.vibrate })} label="Titreşim" />
            </div>

            <div className="rounded-2xl bg-night-800/70 px-3.5 py-3">
              <p className="mb-2 text-sm font-bold text-cream">Bildirim gönderilecek vakitler</p>
              <div className="grid grid-cols-3 gap-2">
                {PRAYER_ORDER.map((key) => {
                  const Icon = PRAYER_ICONS[key];
                  const on = n.settings.prayers[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => n.togglePrayer(key)}
                      aria-pressed={on}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-bold transition-all ${
                        on
                          ? 'border-gold-500/60 bg-gold-500/10 text-gold-300'
                          : 'border-night-600 bg-night-900 text-sage'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {PRAYER_NAMES_TR[key]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={n.sendTest}
            className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-night-500 bg-night-800 text-sm font-bold text-cream transition-all hover:border-gold-500/60 hover:text-gold-300"
          >
            <BellRing className="h-4 w-4" />
            Test Bildirimi Gönder
          </button>

          <p className="text-[11px] leading-relaxed text-sage-dark">
            {notifBlocked
              ? 'Sistem bildirimi kapalı; uygulama açıkken ekran içi uyarı, ses ve titreşim kullanılır.'
              : 'Bildirimler sistem bildirimi olarak gönderilir; ayrıca uygulama açıkken ekran içi uyarı gösterilir.'}
          </p>
        </div>
      </section>

      {/* Veri yönetimi */}
      {initialSettings && (
        <section className="animate-fade-up rounded-3xl border border-night-700 bg-night-850 p-5 shadow-lg" style={{ animationDelay: '140ms' }}>
          <div className="mb-3 flex items-center gap-2">
            <Database className="h-5 w-5 text-gold-400" />
            <h3 className="text-base font-extrabold text-cream">Veri Yönetimi</h3>
          </div>

          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-night-800/70 px-3.5 py-2.5">
              <dt className="font-semibold text-sage">Aktif konum</dt>
              <dd className="font-bold text-cream">{activeLoc?.displayName ?? '—'}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-night-800/70 px-3.5 py-2.5">
              <dt className="font-semibold text-sage">Son güncelleme</dt>
              <dd className="font-bold text-cream">{cache ? formatDateTimeTR(cache.fetchedAt) : 'Henüz yok'}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-night-800/70 px-3.5 py-2.5">
              <dt className="font-semibold text-sage">Cihazda kayıtlı gün</dt>
              <dd className="font-bold text-cream tabular-nums">{cachedDayCount} gün</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-night-800/70 px-3.5 py-2.5">
              <dt className="font-semibold text-sage">Bağlantı durumu</dt>
              <dd className={`font-bold ${online ? 'text-emerald-300' : 'text-amber-300'}`}>{online ? 'Çevrimiçi' : 'Çevrimdışı'}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={onRefreshData}
            disabled={!online || loading}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-night-500 bg-night-800 text-sm font-bold text-cream transition-all hover:border-gold-500/60 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Güncelleniyor…' : 'Vakitleri Şimdi Güncelle'}
          </button>

          <p className="mt-3 text-xs leading-relaxed text-sage-dark">
            Vakitler cihazınıza aylık olarak kaydedilir ve internetsiz kullanılabilir. Uygulama,
            internet bağlantısı olduğunda verileri günde bir kez otomatik tazeler.
          </p>
        </section>
      )}

      {/* Veri kaynakları */}
      <section className="animate-fade-up rounded-3xl border border-night-700 bg-night-850 p-5 shadow-lg" style={{ animationDelay: '200ms' }}>
        <h3 className="mb-2 text-base font-extrabold text-cream">Veri Kaynakları</h3>
        <p className="text-sm leading-relaxed text-sage">
          Tüm veriler <strong className="text-cream">ücretsiz ve açık</strong> kaynaklardan alınmaktadır:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-sage">
          {[
            ['Namaz vakitleri:', 'Aladhan API (Diyanet İşleri Başkanlığı hesaplama yöntemi)'],
            ['Ayet ve meal:', 'AlQuran Cloud API (Diyanet İşleri Meali)'],
            ['Hava durumu:', 'Open-Meteo API'],
            ['Konum adı:', 'BigDataCloud ücretsiz ters geokodlama'],
          ].map(([k, v]) => (
            <li key={k} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              <span><strong className="text-cream">{k}</strong> {v}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
