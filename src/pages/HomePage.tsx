import { CloudOff, Database, Loader2 } from 'lucide-react';
import type { PrayerCache, Settings } from '../lib/types';
import type { AyahState } from '../hooks/useAyah';
import type { WeatherState } from '../hooks/useWeather';
import { resolveSettingsLocation } from '../lib/location';
import { formatDateTimeTR, getNextPrayer, toKey } from '../lib/time';
import NextPrayerCard from '../components/NextPrayerCard';
import TodayTimes from '../components/TodayTimes';
import AyahCard from '../components/AyahCard';
import WeatherCard from '../components/WeatherCard';

interface Props {
  settings: Settings;
  cache: PrayerCache | null;
  now: Date;
  loading: boolean;
  error: string | null;
  online: boolean;
  onRetry: () => void;
  ayahState: AyahState;
  weatherState: WeatherState;
  /** Hava durumunun gösterildiği yer adı */
  weatherPlaceName: string;
  /** Hava durumu cihaz konumuna göre mi? */
  weatherFromDevice: boolean;
}

export default function HomePage({
  settings,
  cache,
  now,
  loading,
  error,
  online,
  onRetry,
  ayahState,
  weatherState,
  weatherPlaceName,
  weatherFromDevice,
}: Props) {
  const loc = resolveSettingsLocation(settings);

  const todayKey = toKey(now);
  const todayDay = cache?.days[todayKey] ?? null;
  const next = cache ? getNextPrayer(cache.days, now) : null;

  const nextKey = next && !next.isTomorrow ? next.key : null;
  const currentKey =
    next?.prevAt && toKey(next.prevAt) === todayKey ? next.prevKey : null;

  if (!loc) return null;

  return (
    <div className="space-y-4">
      <NextPrayerCard
        cityName={loc.displayName}
        countryName={loc.isDeviceLocation ? `${loc.countryName} · Cihaz konumu` : loc.countryName}
        isDeviceLocation={loc.isDeviceLocation}
        next={next}
        now={now}
        todayDay={todayDay}
        loading={loading}
      />

      {/* Veri yoksa bilgilendirme */}
      {!todayDay && !loading && (
        <section className="animate-fade-up rounded-3xl border border-amber-400/30 bg-night-850 p-5 text-center shadow-lg">
          <CloudOff className="mx-auto h-8 w-8 text-amber-300" />
          <h3 className="mt-3 font-extrabold text-cream">Vakit verisi bulunamadı</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-sage">
            {online
              ? (error ?? 'Veriler indirilemedi. Lütfen tekrar deneyin.')
              : 'Bu şehir için cihaza kayıtlı vakit verisi yok. Vakitleri indirmek için internet bağlantısı gereklidir; bağlantı kurulduğunda otomatik indirilecektir.'}
          </p>
          {online && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-bold text-night-950 transition-colors hover:bg-gold-400"
            >
              Vakitleri İndir
            </button>
          )}
        </section>
      )}

      {!todayDay && loading && (
        <section className="animate-fade-up flex items-center justify-center gap-3 rounded-3xl border border-night-700 bg-night-850 p-6 shadow-lg">
          <Loader2 className="h-5 w-5 animate-spin text-gold-400" />
          <p className="text-sm font-medium text-sage">
            {loc.displayName} için aylık vakitler indiriliyor…
          </p>
        </section>
      )}

      {todayDay && (
        <TodayTimes
          day={todayDay}
          nextKey={nextKey}
          currentKey={currentKey}
          allPassed={!!next?.isTomorrow}
        />
      )}

      <AyahCard
        ayah={ayahState.ayah}
        loading={ayahState.loading}
        isStale={ayahState.isStale}
        online={online}
        onRefresh={ayahState.refresh}
      />

      <WeatherCard
        weather={weatherState.weather}
        loading={weatherState.loading}
        isStale={weatherState.isStale}
        online={online}
        cityName={weatherPlaceName}
        fromDevice={weatherFromDevice}
        onRefresh={weatherState.refresh}
      />

      {cache && (
        <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px] font-medium text-sage-dark">
          <Database className="h-3.5 w-3.5" />
          Vakitler cihazda saklanıyor · Son güncelleme: {formatDateTimeTR(cache.fetchedAt)}
          {loading && ' · Güncelleniyor…'}
        </p>
      )}
    </div>
  );
}
