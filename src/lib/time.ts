import type { DayTimes, PrayerKey } from './types';

export const PRAYER_ORDER: PrayerKey[] = [
  'Fajr',
  'Sunrise',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];

export const PRAYER_NAMES_TR: Record<PrayerKey, string> = {
  Fajr: 'İmsak',
  Sunrise: 'Güneş',
  Dhuhr: 'Öğle',
  Asr: 'İkindi',
  Maghrib: 'Akşam',
  Isha: 'Yatsı',
};

export const HIJRI_MONTHS_TR = [
  'Muharrem',
  'Safer',
  'Rebiülevvel',
  'Rebiülâhir',
  'Cemaziyelevvel',
  'Cemaziyelâhir',
  'Recep',
  'Şaban',
  'Ramazan',
  'Şevval',
  'Zilkade',
  'Zilhicce',
];

const pad = (n: number) => String(n).padStart(2, '0');

/** Date -> "YYYY-MM-DD" (yerel duvar saati bileşenleriyle) */
export function toKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function keyToDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() + n);
  return copy;
}

/**
 * Verilen IANA saat dilimindeki "şu an"ı, duvar-saati bileşenleri o dilime ait
 * olan bir Date olarak döner. Böylece vakitler (duvar saati) ile doğrudan
 * karşılaştırılabilir; cihaz hangi dilimde olursa olsun sonuç doğrudur.
 */
export function nowInTimezone(timezone?: string): Date {
  const now = new Date();
  if (!timezone) return now;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).formatToParts(now);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
    return new Date(
      get('year'),
      get('month') - 1,
      get('day'),
      get('hour') % 24,
      get('minute'),
      get('second'),
    );
  } catch {
    return now;
  }
}

/** API'den gelen "05:12 (+03)" formatını "05:12" yapar */
export function cleanTime(raw: string): string {
  const m = raw.match(/(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : raw;
}

/** Belirli bir gün + "HH:MM" için Date üretir */
export function timeOnDate(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0);
}

export interface NextPrayerInfo {
  key: PrayerKey;
  name: string;
  /** Vaktin duvar-saati Date karşılığı */
  at: Date;
  /** "HH:MM" */
  time: string;
  /** Önceki vakit (ilerleme çubuğu için) */
  prevKey: PrayerKey | null;
  prevAt: Date | null;
  isTomorrow: boolean;
}

/** Cache içinden bir sonraki vakti bulur (gerekirse yarına bakar) */
export function getNextPrayer(
  days: Record<string, DayTimes>,
  now: Date,
): NextPrayerInfo | null {
  const todayKey = toKey(now);
  const today = days[todayKey];

  let prevKey: PrayerKey | null = null;
  let prevAt: Date | null = null;

  // Günün ilk vaktinden önceyse önceki vakit dünün Yatsı'sıdır
  const yesterday = addDays(now, -1);
  const yesterdayDay = days[toKey(yesterday)];
  if (yesterdayDay) {
    prevKey = 'Isha';
    prevAt = timeOnDate(yesterday, yesterdayDay.times.Isha);
  }

  if (today) {
    for (const key of PRAYER_ORDER) {
      const at = timeOnDate(now, today.times[key]);
      if (at.getTime() > now.getTime()) {
        return {
          key,
          name: PRAYER_NAMES_TR[key],
          at,
          time: today.times[key],
          prevKey,
          prevAt,
          isTomorrow: false,
        };
      }
      prevKey = key;
      prevAt = at;
    }
  }

  // Bugünün vakitleri bitti -> yarının İmsak'ı
  const tomorrow = addDays(now, 1);
  const tomorrowDay = days[toKey(tomorrow)];
  if (tomorrowDay) {
    const at = timeOnDate(tomorrow, tomorrowDay.times.Fajr);
    return {
      key: 'Fajr',
      name: PRAYER_NAMES_TR.Fajr,
      at,
      time: tomorrowDay.times.Fajr,
      prevKey,
      prevAt,
      isTomorrow: true,
    };
  }

  return null;
}

/** Milisaniyeyi "SS:DD:ss" geri sayımına çevirir */
export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Kısa kalan süre etiketi: "2 sa 14 dk" */
export function formatRemainingShort(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h} sa ${m} dk`;
  if (m > 0) return `${m} dk`;
  return 'şimdi';
}

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  weekday: 'long',
});

/** "12 Şubat 2026 Perşembe" */
export function formatDateTR(d: Date): string {
  return dateFormatter.format(d);
}

const dateTimeFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

/** "12 Şubat 14:30" */
export function formatDateTimeTR(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return dateTimeFormatter.format(d);
}

export function hijriLabel(day?: DayTimes | null): string {
  if (!day) return '';
  const month = HIJRI_MONTHS_TR[day.hijriMonth - 1] ?? '';
  return `${Number(day.hijriDay)} ${month} ${day.hijriYear}`;
}
