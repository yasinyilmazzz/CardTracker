import { ListOrdered } from 'lucide-react';
import type { DayTimes, PrayerKey } from '../lib/types';
import { PRAYER_NAMES_TR, PRAYER_ORDER } from '../lib/time';
import { PRAYER_ICONS } from '../lib/prayerIcons';

interface Props {
  day: DayTimes;
  /** Bugün için sıradaki vakit (yarına geçtiyse null) */
  nextKey: PrayerKey | null;
  /** Şu anki (içinde bulunulan) vakit */
  currentKey: PrayerKey | null;
  /** Günün tüm vakitleri geçtiyse true (sıradaki vakit yarın) */
  allPassed?: boolean;
}

export default function TodayTimes({ day, nextKey, currentKey, allPassed = false }: Props) {
  const nextIndex = nextKey ? PRAYER_ORDER.indexOf(nextKey) : -1;

  return (
    <section
      className="animate-fade-up rounded-3xl border border-night-700 bg-night-850 p-5 shadow-lg"
      style={{ animationDelay: '80ms' }}
    >
      <div className="mb-4 flex items-center gap-2">
        <ListOrdered className="h-5 w-5 text-gold-400" />
        <h3 className="text-base font-extrabold text-cream">Bugünün Vakitleri</h3>
      </div>

      <ul className="space-y-1.5">
        {PRAYER_ORDER.map((key, i) => {
          const Icon = PRAYER_ICONS[key];
          const isNext = key === nextKey;
          const isCurrent = key === currentKey;
          const isPassed = allPassed || (nextIndex !== -1 && i < nextIndex);

          return (
            <li
              key={key}
              className={`flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition-colors ${
                isNext
                  ? 'animate-soft-pulse border-gold-500/60 bg-gold-500/10'
                  : 'border-transparent bg-night-800/60'
              } ${isPassed ? 'opacity-45' : ''}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  isNext
                    ? 'bg-gold-500 text-night-950'
                    : isCurrent
                      ? 'bg-night-600 text-gold-300'
                      : 'bg-night-750 text-sage'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <span
                className={`flex-1 text-[15px] font-bold ${
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
              {isCurrent && !isNext && (
                <span className="rounded-full border border-night-500 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-sage uppercase">
                  Şu An
                </span>
              )}
              <span
                className={`text-[15px] font-extrabold tabular-nums ${
                  isNext ? 'text-gold-300' : 'text-cream'
                }`}
              >
                {day.times[key]}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
