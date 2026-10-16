export interface CityDef {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface CountryDef {
  id: string;
  name: string;
  /** Aladhan hesaplama yöntemi id'si */
  method: number;
  methodName: string;
  cities: CityDef[];
}

export interface GeoPoint {
  lat: number;
  lon: number;
  /** Ters geokodlama ile bulunan yer adı (örn. "Kadıköy, İstanbul") */
  name: string;
}

export interface Settings {
  countryId: string;
  cityId: string;
  /** 'city' = seçilen şehir, 'location' = cihaz konumu */
  mode?: 'city' | 'location';
  /** mode === 'location' iken kullanılan koordinatlar */
  location?: GeoPoint;
}

export interface NotificationSettings {
  enabled: boolean;
  /** Vakitten kaç dakika önce hatırlatılsın (0 = kapalı) */
  minutesBefore: number;
  /** Vakit girdiğinde bildir */
  onTime: boolean;
  /** Titreşim */
  vibrate: boolean;
  /** Hangi vakitler için bildirim gönderilsin */
  prayers: Record<PrayerKey, boolean>;
}

export type PermissionState = 'unsupported' | 'prompt' | 'granted' | 'denied';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  at: number;
}

export type PrayerKey = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export interface DayTimes {
  /** "HH:MM" formatında vakitler */
  times: Record<PrayerKey, string>;
  hijriDay: string;
  hijriMonth: number;
  hijriYear: string;
}

export interface PrayerCache {
  /** ISO tarih - son indirme zamanı */
  fetchedAt: string;
  /** Şehrin IANA saat dilimi, örn. "Europe/Istanbul" */
  timezone: string;
  /** "YYYY-MM-DD" -> günün vakitleri */
  days: Record<string, DayTimes>;
}

export interface AyahData {
  fetchedAt: string;
  arabic: string;
  translation: string;
  surahNumber: number;
  /** Sure içindeki ayet numarası */
  ayahNumber: number;
  /** Kuran genelindeki ayet numarası (1-6236) */
  globalNumber: number;
}

export interface WeatherData {
  fetchedAt: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  tempMax: number;
  tempMin: number;
}

export type PageKey = 'home' | 'times' | 'settings';
