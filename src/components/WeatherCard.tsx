import {
  ArrowDown,
  ArrowUp,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudOff,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Loader2,
  LocateFixed,
  MapPin,
  Moon,
  RefreshCw,
  Sun,
  Thermometer,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { WeatherData } from '../lib/types';
import { weatherLabel } from '../lib/api';
import OfflineBadge from './OfflineBadge';

interface Props {
  weather: WeatherData | null;
  loading: boolean;
  isStale: boolean;
  online: boolean;
  cityName: string;
  /** Cihaz konumuna göre mi gösteriliyor? */
  fromDevice?: boolean;
  onRefresh: () => void;
}

function weatherIcon(code: number, isDay: boolean): LucideIcon {
  if (code === 0) return isDay ? Sun : Moon;
  if (code === 1 || code === 2) return isDay ? CloudSun : CloudMoon;
  if (code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if ([51, 53, 55, 56, 57].includes(code)) return CloudDrizzle;
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return CloudRain;
  if ([71, 73, 75, 77, 85, 86].includes(code)) return CloudSnow;
  if ([95, 96, 99].includes(code)) return CloudLightning;
  return Cloud;
}

export default function WeatherCard({
  weather,
  loading,
  isStale,
  online,
  cityName,
  fromDevice = false,
  onRefresh,
}: Props) {
  const Icon = weather ? weatherIcon(weather.weatherCode, weather.isDay) : Cloud;

  return (
    <section
      className="animate-fade-up relative rounded-3xl border border-night-700 bg-night-850 p-5 shadow-lg"
      style={{ animationDelay: '240ms' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudSun className="h-5 w-5 text-gold-400" />
          <h3 className="text-base font-extrabold text-cream">Hava Durumu</h3>
        </div>
        <div className="flex items-center gap-2">
          {isStale && weather && <OfflineBadge lastUpdated={weather.fetchedAt} />}
          <button
            type="button"
            onClick={onRefresh}
            disabled={!online || loading}
            aria-label="Hava durumunu yenile"
            title={online ? 'Yenile' : 'İnternet bağlantısı yok'}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-night-600 bg-night-800 text-sage transition-all hover:border-gold-500/60 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-sage">
        {fromDevice ? (
          <>
            <LocateFixed className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-emerald-200">{cityName}</span>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-emerald-300 uppercase">
              Konumum
            </span>
          </>
        ) : (
          <>
            <MapPin className="h-3.5 w-3.5 text-gold-500" />
            {cityName}
            <span className="text-sage-dark">· Seçili şehir</span>
          </>
        )}
      </p>

      {weather ? (
        <>
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-night-750 text-gold-300">
              <Icon className="h-9 w-9" strokeWidth={1.5} />
            </span>
            <div className="flex-1">
              <p className="text-4xl font-extrabold tracking-tight text-cream tabular-nums">
                {weather.temperature}°
              </p>
              <p className="text-sm font-semibold text-gold-300">
                {weatherLabel(weather.weatherCode)}
              </p>
            </div>
            <div className="space-y-1 text-right text-sm font-bold">
              <p className="flex items-center justify-end gap-1 text-cream tabular-nums">
                <ArrowUp className="h-3.5 w-3.5 text-orange-300" />
                {weather.tempMax}°
              </p>
              <p className="flex items-center justify-end gap-1 text-sage tabular-nums">
                <ArrowDown className="h-3.5 w-3.5 text-sky-300" />
                {weather.tempMin}°
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-night-700/70 pt-4">
            <div className="rounded-2xl bg-night-800/70 px-3 py-2.5 text-center">
              <Thermometer className="mx-auto h-4 w-4 text-gold-400" />
              <p className="mt-1 text-sm font-extrabold text-cream tabular-nums">
                {weather.feelsLike}°
              </p>
              <p className="text-[10px] font-semibold tracking-wide text-sage uppercase">
                Hissedilen
              </p>
            </div>
            <div className="rounded-2xl bg-night-800/70 px-3 py-2.5 text-center">
              <Droplets className="mx-auto h-4 w-4 text-gold-400" />
              <p className="mt-1 text-sm font-extrabold text-cream tabular-nums">
                %{weather.humidity}
              </p>
              <p className="text-[10px] font-semibold tracking-wide text-sage uppercase">
                Nem
              </p>
            </div>
            <div className="rounded-2xl bg-night-800/70 px-3 py-2.5 text-center">
              <Wind className="mx-auto h-4 w-4 text-gold-400" />
              <p className="mt-1 text-sm font-extrabold text-cream tabular-nums">
                {weather.windSpeed} km/s
              </p>
              <p className="text-[10px] font-semibold tracking-wide text-sage uppercase">
                Rüzgâr
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="py-6 text-center">
          {loading ? (
            <>
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-gold-400" />
              <p className="mt-3 text-sm text-sage">Hava durumu yükleniyor…</p>
            </>
          ) : (
            <>
              <CloudOff className="mx-auto h-7 w-7 text-sage-dark" />
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-sage">
                {online
                  ? 'Hava durumu getirilemedi. Lütfen tekrar deneyin.'
                  : 'İnternet bağlantısı olmadığı için hava durumu gösterilemiyor.'}
              </p>
              {online && (
                <button
                  type="button"
                  onClick={onRefresh}
                  className="mt-4 rounded-xl bg-gold-500 px-4 py-2 text-sm font-bold text-night-950 transition-colors hover:bg-gold-400"
                >
                  Tekrar Dene
                </button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
