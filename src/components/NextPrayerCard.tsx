import { CalendarDays, Loader2, LocateFixed, MapPin } from 'lucide-react';
import type { DayTimes } from '../lib/types';
import {
  PRAYER_NAMES_TR,
  formatCountdown,
  formatDateTR,
  hijriLabel,
  type NextPrayerInfo,
} from '../lib/time';
import { PRAYER_ICONS } from '../lib/prayerIcons';
import PatternBackground from './PatternBackground';

interface Props {
  cityName: string;
  countryName: string;
  next: NextPrayerInfo | null;
  now: Date;
  todayDay: DayTimes | null;
  loading: boolean;
  isDeviceLocation?: boolean;
}

export default function NextPrayerCard({
  cityName,
  countryName,
  next,
  now,
  todayDay,
  loading,
  isDeviceLocation = false,
}: Props) {
  const remainingMs = next ? next.at.getTime() - now.getTime() : 0;
  const progress =
    next?.prevAt != null
      ? Math.min(
          100,
          Math.max(
            0,
            ((now.getTime() - next.prevAt.getTime()) /
              (next.at.getTime() - next.prevAt.getTime())) *
              100,
          ),
        )
      : null;

  const NextIcon = next ? PRAYER_ICONS[next.key] : null;

  return (
    <section className="animate-fade-up relative overflow-hidden rounded-3xl border border-night-700 bg-night-800 shadow-xl">
      {/* Arka plan görseli */}
      <img
        src="/images/hero-mosque.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-night-950/60" />
      <PatternBackground id="hero-pattern" className="opacity-[0.05]" />

      <div className="relative px-5 pt-5 pb-6 sm:px-7">
        {/* Üst bilgi: şehir + tarihler */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-lg font-extrabold text-cream">
              {isDeviceLocation ? (
                <LocateFixed className="h-5 w-5 text-emerald-300" />
              ) : (
                <MapPin className="h-5 w-5 text-gold-400" />
              )}
              {cityName}
            </p>
            <p className="mt-0.5 text-xs font-medium tracking-wide text-cream/70 uppercase">
              {countryName}
            </p>
          </div>
          <div className="text-right">
            <p className="flex items-center justify-end gap-1.5 text-[13px] font-semibold text-cream/90">
              <CalendarDays className="h-4 w-4 text-gold-400" />
              {formatDateTR(now)}
            </p>
            {todayDay && (
              <p className="mt-0.5 text-xs font-medium text-gold-300/90">
                {hijriLabel(todayDay)} (Hicrî)
              </p>
            )}
          </div>
        </div>

        {/* Sıradaki vakit + geri sayım */}
        <div className="mt-7 text-center">
          {next && NextIcon ? (
            <>
              <p className="text-[11px] font-bold tracking-[0.3em] text-gold-400 uppercase">
                Sıradaki Vakit{next.isTomorrow ? ' · Yarın' : ''}
              </p>
              <div className="mt-2 flex items-center justify-center gap-3">
                <NextIcon className="h-9 w-9 text-gold-300" strokeWidth={1.6} />
                <h2 className="text-4xl font-extrabold tracking-tight text-cream sm:text-5xl">
                  {next.name}
                </h2>
                <span className="rounded-full border border-gold-500/50 bg-night-950/50 px-3 py-1 text-sm font-bold text-gold-300 tabular-nums">
                  {next.time}
                </span>
              </div>

              <p
                className="mt-4 font-extrabold tracking-tight text-cream tabular-nums"
                style={{ fontSize: 'clamp(2.6rem, 12vw, 4.2rem)', lineHeight: 1.05 }}
                aria-label={`${next.name} vaktine kalan süre`}
              >
                {formatCountdown(remainingMs)}
              </p>
              <p className="mt-1 text-xs font-semibold tracking-[0.25em] text-cream/60 uppercase">
                Kalan Süre
              </p>

              {progress !== null && next.prevKey && (
                <div className="mx-auto mt-6 max-w-md">
                  <div className="h-2 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full rounded-full bg-gold-400 transition-[width] duration-1000 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2 flex justify-between text-[11px] font-semibold text-cream/70">
                    <span>
                      {PRAYER_NAMES_TR[next.prevKey]}{' '}
                      <span className="tabular-nums">
                        {next.prevAt &&
                          `${String(next.prevAt.getHours()).padStart(2, '0')}:${String(
                            next.prevAt.getMinutes(),
                          ).padStart(2, '0')}`}
                      </span>
                    </span>
                    <span className="text-gold-300">
                      {next.name} <span className="tabular-nums">{next.time}</span>
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-10">
              {loading ? (
                <>
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold-400" />
                  <p className="mt-3 text-sm font-medium text-cream/80">
                    Vakitler yükleniyor…
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium text-cream/80">
                  Vakit bilgisi bulunamadı.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
