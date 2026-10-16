import { useCallback, useEffect, useRef, useState } from 'react';
import type { PrayerCache, Settings } from '../lib/types';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage';
import { fetchPrayerWindow } from '../lib/api';
import { resolveSettingsLocation } from '../lib/location';
import { addDays, nowInTimezone, toKey } from '../lib/time';

/** Bir ISO anının, verilen saat dilimindeki tarih anahtarı */
function dateKeyInTz(iso: string, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date(iso));
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}`;
  } catch {
    return toKey(new Date(iso));
  }
}

function loadCacheFor(settings: Settings | null): PrayerCache | null {
  if (!settings) return null;
  const loc = resolveSettingsLocation(settings);
  if (!loc) return null;
  return loadJSON<PrayerCache>(STORAGE_KEYS.prayers(loc.key));
}

export interface PrayerStore {
  settings: Settings | null;
  cache: PrayerCache | null;
  loading: boolean;
  error: string | null;
  saveSettings: (s: Settings) => void;
  refresh: (force?: boolean) => void;
}

/**
 * Ayarlar + namaz vakitleri önbelleğini yönetir.
 * - Şehir/konum seçilince 1 aylık veri indirilir ve cihaza kaydedilir.
 * - Uygulama her gün (internet varsa) verileri bir kez tazeler.
 * - Vakitler çevrimdışı iken önbellekten okunur.
 */
export function usePrayerStore(online: boolean): PrayerStore {
  const [settings, setSettings] = useState<Settings | null>(() =>
    loadJSON<Settings>(STORAGE_KEYS.settings),
  );
  const [cache, setCache] = useState<PrayerCache | null>(() =>
    loadCacheFor(loadJSON<Settings>(STORAGE_KEYS.settings)),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlightRef = useRef<string | null>(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const cacheRef = useRef(cache);
  cacheRef.current = cache;

  const doFetch = useCallback(async (s: Settings, existing: PrayerCache | null) => {
    const loc = resolveSettingsLocation(s);
    if (!loc) return;

    if (inFlightRef.current === loc.key) return;
    inFlightRef.current = loc.key;

    setLoading(true);
    setError(null);
    try {
      const today = nowInTimezone(existing?.timezone);
      const fresh = await fetchPrayerWindow(loc.lat, loc.lon, loc.method, today);

      // Eski verilerle birleştir, 7 günden eski günleri temizle
      const merged: PrayerCache = {
        fetchedAt: fresh.fetchedAt,
        timezone: fresh.timezone,
        days: { ...(existing?.days ?? {}), ...fresh.days },
      };
      const cutoff = toKey(addDays(nowInTimezone(fresh.timezone), -7));
      for (const k of Object.keys(merged.days)) {
        if (k < cutoff) delete merged.days[k];
      }

      saveJSON(STORAGE_KEYS.prayers(loc.key), merged);
      // Bu sırada ayar değiştiyse state'i ezme
      const current = settingsRef.current;
      const currentLoc = current ? resolveSettingsLocation(current) : null;
      if (currentLoc?.key === loc.key) {
        setCache(merged);
      }
    } catch {
      setError(
        'Vakitler güncellenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.',
      );
    } finally {
      inFlightRef.current = null;
      setLoading(false);
    }
  }, []);

  /** Veriye ihtiyaç var mı? (yoksa, bugün eksikse veya bugün henüz tazelenmediyse) */
  const needsFetch = useCallback((c: PrayerCache | null): boolean => {
    if (!c) return true;
    const todayKey = toKey(nowInTimezone(c.timezone));
    if (!c.days[todayKey]) return true;
    // Günde bir kez tazeleme kuralı
    return dateKeyInTz(c.fetchedAt, c.timezone) !== todayKey;
  }, []);

  const refresh = useCallback(
    (force = false) => {
      const s = settingsRef.current;
      if (!s || !navigator.onLine) return;
      if (!force && !needsFetch(cacheRef.current)) return;
      void doFetch(s, cacheRef.current);
    },
    [doFetch, needsFetch],
  );

  const saveSettings = useCallback(
    (s: Settings) => {
      saveJSON(STORAGE_KEYS.settings, s);
      setSettings(s);
      settingsRef.current = s;
      setError(null);
      const existing = loadCacheFor(s);
      setCache(existing);
      cacheRef.current = existing;
      if (navigator.onLine) {
        // Konum değişiminde her zaman taze veri indir
        void doFetch(s, existing);
      }
    },
    [doFetch],
  );

  // Açılışta ve internet geri geldiğinde günlük tazeleme kontrolü
  useEffect(() => {
    if (online) refresh(false);
  }, [online, refresh]);

  // Uygulama açıkken de (ör. gece yarısı geçildiğinde) günde bir kez tazele
  useEffect(() => {
    const id = setInterval(() => {
      if (navigator.onLine) refresh(false);
    }, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  return { settings, cache, loading, error, saveSettings, refresh };
}
