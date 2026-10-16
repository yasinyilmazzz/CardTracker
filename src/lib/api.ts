import type { AyahData, DayTimes, PrayerCache, PrayerKey, WeatherData } from './types';
import { PRAYER_ORDER, addDays, cleanTime, toKey } from './time';

/** Zaman aşımına sahip fetch */
async function fetchJSON(url: string, timeoutMs = 12000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------------------ */
/*  Namaz Vakitleri — Aladhan API (ücretsiz, anahtarsız)               */
/*  https://aladhan.com/prayer-times-api                               */
/* ------------------------------------------------------------------ */

interface MonthResult {
  days: Record<string, DayTimes>;
  timezone: string;
}

async function fetchMonth(
  lat: number,
  lon: number,
  method: number,
  year: number,
  month: number,
): Promise<MonthResult> {
  const url =
    `https://api.aladhan.com/v1/calendar/${year}/${month}` +
    `?latitude=${lat}&longitude=${lon}&method=${method}`;
  const json = await fetchJSON(url);
  if (json.code !== 200 || !Array.isArray(json.data)) {
    throw new Error('Vakit verisi alınamadı');
  }

  const days: Record<string, DayTimes> = {};
  let timezone = 'Europe/Istanbul';

  for (const item of json.data) {
    const g = item?.date?.gregorian;
    const h = item?.date?.hijri;
    const t = item?.timings;
    if (!g || !t) continue;

    const key = `${g.year}-${String(g.month.number).padStart(2, '0')}-${String(
      g.day,
    ).padStart(2, '0')}`;

    const times = {} as Record<PrayerKey, string>;
    for (const pk of PRAYER_ORDER) {
      times[pk] = cleanTime(String(t[pk] ?? ''));
    }

    days[key] = {
      times,
      hijriDay: String(h?.day ?? ''),
      hijriMonth: Number(h?.month?.number ?? 0),
      hijriYear: String(h?.year ?? ''),
    };

    if (item?.meta?.timezone) timezone = item.meta.timezone;
  }

  return { days, timezone };
}

/**
 * Bugünden 3 gün öncesini ve en az 1 ay ilerisini kapsayacak şekilde
 * gerekli ayların tamamını indirir (ay sınırlarında 2-3 ay olabilir).
 */
export async function fetchPrayerWindow(
  lat: number,
  lon: number,
  method: number,
  today: Date,
): Promise<PrayerCache> {
  const start = addDays(today, -3);
  const end = addDays(today, 30);

  const months = new Set<string>();
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cursor.getTime() <= last.getTime()) {
    months.add(`${cursor.getFullYear()}-${cursor.getMonth() + 1}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const results = await Promise.all(
    [...months].map((mk) => {
      const [y, m] = mk.split('-').map(Number);
      return fetchMonth(lat, lon, method, y, m);
    }),
  );

  const days: Record<string, DayTimes> = {};
  let timezone = results[0]?.timezone ?? 'Europe/Istanbul';
  for (const r of results) {
    Object.assign(days, r.days);
    if (r.timezone) timezone = r.timezone;
  }

  return { fetchedAt: new Date().toISOString(), timezone, days };
}

/* ------------------------------------------------------------------ */
/*  Ayet — AlQuran Cloud API (ücretsiz, anahtarsız)                    */
/*  https://alquran.cloud/api                                          */
/* ------------------------------------------------------------------ */

// İlk ayetlerin başında gelen besmele (uthmani metinde birleşik gelir)
const BISMILLAH_PREFIXES = [
  'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
  'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
];

function stripBismillah(text: string, surahNumber: number, ayahNumber: number): string {
  if (ayahNumber !== 1 || surahNumber === 1 || surahNumber === 9) return text;
  for (const prefix of BISMILLAH_PREFIXES) {
    if (text.startsWith(prefix)) {
      return text.slice(prefix.length).trim();
    }
  }
  return text;
}

/** Rastgele bir ayetin Arapça metnini ve Diyanet mealini getirir */
export async function fetchRandomAyah(): Promise<AyahData> {
  const ref = Math.floor(Math.random() * 6236) + 1;
  const url = `https://api.alquran.cloud/v1/ayah/${ref}/editions/quran-uthmani,tr.diyanet`;
  const json = await fetchJSON(url);
  if (json.code !== 200 || !Array.isArray(json.data)) {
    throw new Error('Ayet verisi alınamadı');
  }

  const arabicEdition =
    json.data.find((d: any) => d?.edition?.identifier === 'quran-uthmani') ?? json.data[0];
  const turkishEdition =
    json.data.find((d: any) => d?.edition?.identifier === 'tr.diyanet') ?? json.data[1];

  const surahNumber = Number(arabicEdition?.surah?.number ?? 0);
  const ayahNumber = Number(arabicEdition?.numberInSurah ?? 0);

  return {
    fetchedAt: new Date().toISOString(),
    arabic: stripBismillah(String(arabicEdition?.text ?? ''), surahNumber, ayahNumber),
    translation: String(turkishEdition?.text ?? ''),
    surahNumber,
    ayahNumber,
    globalNumber: ref,
  };
}

/* ------------------------------------------------------------------ */
/*  Hava Durumu — Open-Meteo API (ücretsiz, anahtarsız)                */
/*  https://open-meteo.com                                             */
/* ------------------------------------------------------------------ */

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
  const json = await fetchJSON(url);
  const c = json?.current;
  if (!c) throw new Error('Hava durumu alınamadı');

  return {
    fetchedAt: new Date().toISOString(),
    temperature: Math.round(Number(c.temperature_2m)),
    feelsLike: Math.round(Number(c.apparent_temperature)),
    humidity: Math.round(Number(c.relative_humidity_2m)),
    windSpeed: Math.round(Number(c.wind_speed_10m)),
    weatherCode: Number(c.weather_code),
    isDay: Number(c.is_day) === 1,
    tempMax: Math.round(Number(json?.daily?.temperature_2m_max?.[0] ?? c.temperature_2m)),
    tempMin: Math.round(Number(json?.daily?.temperature_2m_min?.[0] ?? c.temperature_2m)),
  };
}

/** WMO hava durumu kodunun Türkçe karşılığı */
export function weatherLabel(code: number): string {
  if (code === 0) return 'Açık';
  if (code === 1) return 'Çoğunlukla Açık';
  if (code === 2) return 'Parçalı Bulutlu';
  if (code === 3) return 'Kapalı';
  if (code === 45 || code === 48) return 'Sisli';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Çisenti';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Yağmurlu';
  if ([71, 73, 75, 77].includes(code)) return 'Kar Yağışlı';
  if ([80, 81, 82].includes(code)) return 'Sağanak Yağışlı';
  if ([85, 86].includes(code)) return 'Kar Sağanağı';
  if (code === 95) return 'Gök Gürültülü Sağanak';
  if ([96, 99].includes(code)) return 'Dolu Yağışlı';
  return 'Bilinmiyor';
}

/* ------------------------------------------------------------------ */
/*  Ters Geokodlama — BigDataCloud (ücretsiz, anahtarsız istemci API)  */
/*  https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api */
/* ------------------------------------------------------------------ */

/** Koordinattan okunabilir yer adı üretir, örn. "Kadıköy, İstanbul" */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url =
      `https://api.bigdatacloud.net/data/reverse-geocode-client` +
      `?latitude=${lat}&longitude=${lon}&localityLanguage=tr`;
    const json = await fetchJSON(url, 8000);
    const city: string = json?.city || json?.principalSubdivision || '';
    const locality: string = json?.locality || '';
    if (locality && city && locality !== city) return `${locality}, ${city}`;
    return city || locality || null;
  } catch {
    return null;
  }
}

export { toKey };
