import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CloudOff,
  Database,
  Loader2,
} from 'lucide-react';
import type { PrayerCache } from '../lib/types';
import {
  PRAYER_NAMES_TR,
  PRAYER_ORDER,
  addDays,
  formatDateTR,
  formatDateTimeTR,
  formatRemainingShort,
  getNextPrayer,
  hijriLabel,
  keyToDate,
  toKey,
} from '../lib/time';
import { PRAYER_ICONS } from '../lib/prayerIcons';

interface Props {
  cache: PrayerCache | null;
  now: Date;
  cityName: string;
  online: boolean;
  loading: boolean;
  onRefresh: () => void;
}

export default function PrayerTimesPage({
  cache,
  now,
  cityName,
  online,
  loading,
  onRefresh,
}: Props) {
  const todayKey = toKey(now);
  const minKey = toKey(addDays(now, -3));
  const maxKey = toKey(addDays(now, 5));

  const [selectedKey, setSelectedKey] = useState<string>(todayKey);
  // Seçili tarihi izin verilen aralığa sabitle
  const effectiveKey =
    selectedKey < minKey ? minKey : selectedKey > maxKey ? maxKey : selectedKey;

  const selectedDate = keyToDate(effectiveKey);
  const day = cache?.days[effectiveKey] ?? null;
  const isToday = effectiveKey === todayKey;

  const dayDiff = Math.round(
    (keyToDate(effectiveKey).getTime() - keyToDate(todayKey).getTime()) / 86400000,
  );
  const relativeLabel =
    dayDiff === 0
      ? 'Bugün'
      : dayDiff === 1
        ? 'Yarın'
        : dayDiff === -1
          ? 'Dün'
          : dayDiff > 1
            ? `${dayDiff} gün sonra`
            : `${Math.abs(dayDiff)} gün önce`;

  const next = useMemo(
    () => (cache && isToday ? getNextPrayer(cache.days, now) : null),
    [cache, isToday, now],
  );
  const nextKey = next && !next.isTomorrow ? next.key : null;
  const nextIndex = nextKey ? PRAYER_ORDER.indexOf(nextKey) : -1;

  const cacheRange = useMemo(() => {
    if (!cache) return null;
    const keys = Object.keys(cache.days).sort();
    if (keys.length === 0) return null;
    return { from: keys[0], to: keys[keys.length - 1], count: keys.length };
  }, [cache]);

  const goDay = (delta: number) => {
    const target = toKey(addDays(keyToDate(effectiveKey), delta));
    if (target >= minKey && target <= maxKey) setSelectedKey(target);
  };

  return (
    <div className="space-y-4">
      {/* Başlık */}
      <section className="animate-fade-up">
        <h2 className="flex items-center gap-2 text-xl font-extrabold text-cream">
          <Clock3 className="h-6 w-6 text-gold-400" />
          Namaz Vakitleri
        </h2>
        <p className="mt-1 text-sm text-sage">
          {cityName} için ezan saatleri · Geçmiş 3 gün, gelecek 5 gün görüntülenebilir.
        </p>
      </section>

      {/* Tarih seçici */}
      <section className="animate-fade-up rounded-3xl border border-night-700 bg-night-850 p-4 shadow-lg" style={{ animationDelay: '60ms' }}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goDay(-1)}
            disabled={effectiveKey <= minKey}
            aria-label="Önceki gün"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-night-600 bg-night-800 text-cream transition-all hover:border-gold-500/60 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="relative flex-1">
            <CalendarDays className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gold-400" />
            <input
              type="date"
              value={effectiveKey}
              min={minKey}
              max={maxKey}
              onChange={(e) => {
                if (e.target.value) setSelectedKey(e.target.value);
              }}
              aria-label="Tarih seç"
              className="h-11 w-full rounded-xl border border-night-600 bg-night-800 pr-3 pl-9 text-[15px] font-bold text-cream transition-colors outline-none focus:border-gold-500"
            />
          </div>

          <button
            type="button"
            onClick={() => goDay(1)}
            disabled={effectiveKey >= maxKey}
            aria-label="Sonraki gün"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-night-600 bg-night-800 text-cream transition-all hover:border-gold-500/60 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[15px] font-extrabold text-cream">
              {formatDateTR(selectedDate)}
            </p>
            <p className="text-xs font-medium text-sage">
              {day ? `${hijriLabel(day)} (Hicrî)` : '—'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-night-500 px-2.5 py-1 text-[11px] font-bold text-sage">
              {relativeLabel}
            </span>
            {!isToday && (
              <button
                type="button"
                onClick={() => setSelectedKey(todayKey)}
                className="rounded-full bg-gold-500 px-3 py-1 text-[11px] font-extrabold text-night-950 transition-colors hover:bg-gold-400"
              >
                Bugüne Dön
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Vakit tablosu */}
      <section
        className="animate-fade-up overflow-hidden rounded-3xl border border-night-700 bg-night-850 shadow-lg"
        style={{ animationDelay: '120ms' }}
      >
        {day ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-night-700 bg-night-800/80">
                <th className="px-5 py-3 text-left text-[11px] font-extrabold tracking-[0.2em] text-sage uppercase">
                  Vakit
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-extrabold tracking-[0.2em] text-sage uppercase">
                  Saat
                </th>
              </tr>
            </thead>
            <tbody>
              {PRAYER_ORDER.map((key, i) => {
                const Icon = PRAYER_ICONS[key];
                const isNext = isToday && key === nextKey;
                const isPassed = isToday && nextIndex !== -1 && i < nextIndex;
                const allPassed = isToday && !!next?.isTomorrow;

                return (
                  <tr
                    key={key}
                    className={`border-b border-night-700/50 last:border-b-0 ${
                      isNext ? 'bg-gold-500/10' : ''
                    } ${isPassed || allPassed ? 'opacity-45' : ''}`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isNext
                              ? 'bg-gold-500 text-night-950'
                              : 'bg-night-750 text-sage'
                          }`}
                        >
                          <Icon className="h-5 w-5" strokeWidth={1.9} />
                        </span>
                        <span
                          className={`text-[15px] font-bold ${
                            isNext ? 'text-gold-300' : 'text-cream'
                          }`}
                        >
                          {PRAYER_NAMES_TR[key]}
                        </span>
                        {isNext && (
                          <span className="rounded-full bg-gold-500 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-night-950 uppercase">
                            Sıradaki
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`text-base font-extrabold tabular-nums ${
                          isNext ? 'text-gold-300' : 'text-cream'
                        }`}
                      >
                        {day.times[key]}
                      </span>
                      {isNext && next && (
                        <span className="block text-[11px] font-semibold text-gold-400/80">
                          {formatRemainingShort(next.at.getTime() - now.getTime())} kaldı
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center">
            {loading ? (
              <>
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-gold-400" />
                <p className="mt-3 text-sm text-sage">Vakitler yükleniyor…</p>
              </>
            ) : (
              <>
                <CloudOff className="mx-auto h-8 w-8 text-sage-dark" />
                <h3 className="mt-3 font-extrabold text-cream">
                  Bu tarih için veri yok
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-sage">
                  {online
                    ? 'Seçilen tarihe ait vakitler cihazda bulunamadı. Verileri şimdi indirebilirsiniz.'
                    : 'Seçilen tarihe ait vakitler cihazda bulunamadı ve internet bağlantısı yok. Bağlantı kurulduğunda veriler otomatik indirilecektir.'}
                </p>
                {online && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    className="mt-4 rounded-xl bg-gold-500 px-5 py-2.5 text-sm font-bold text-night-950 transition-colors hover:bg-gold-400"
                  >
                    Verileri İndir
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* Alt bilgi */}
      {cache && cacheRange && (
        <p className="flex items-start justify-center gap-1.5 px-2 text-center text-[11px] leading-relaxed font-medium text-sage-dark">
          <Database className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Cihazda kayıtlı aralık: {formatDateTR(keyToDate(cacheRange.from))} —{' '}
            {formatDateTR(keyToDate(cacheRange.to))} ({cacheRange.count} gün) · Son
            güncelleme: {formatDateTimeTR(cache.fetchedAt)}
          </span>
        </p>
      )}
    </div>
  );
}
