import { useCallback, useEffect, useRef, useState } from 'react';
import type { WeatherData } from '../lib/types';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage';
import { fetchWeather } from '../lib/api';

export interface WeatherTarget {
  lat: number;
  lon: number;
  /** Önbellek anahtarı */
  key: string;
  /** Gösterilecek ad */
  name: string;
  /** Cihaz konumundan mı? */
  isDeviceLocation: boolean;
}

export interface WeatherState {
  weather: WeatherData | null;
  loading: boolean;
  /** Gösterilen veri güncel değil (çevrimdışı veya son deneme başarısız) */
  isStale: boolean;
  refresh: () => void;
}

/**
 * Hava durumu: internet varsa güncel veri çekilir ve önbelleğe alınır;
 * yoksa son bilinen veri gösterilir ve isStale=true olur.
 * Hedef konum (cihaz konumu veya seçili şehir) dışarıdan verilir.
 */
export function useWeather(target: WeatherTarget | null, online: boolean): WeatherState {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const inFlight = useRef<string | null>(null);
  const lastFetchFor = useRef<string | null>(null);

  const key = target?.key ?? null;
  const lat = target?.lat;
  const lon = target?.lon;

  const load = useCallback(
    async (force = false) => {
      if (!key || lat === undefined || lon === undefined) return;
      if (!navigator.onLine) return;
      if (inFlight.current === key) return;
      if (!force && lastFetchFor.current === key) return;

      inFlight.current = key;
      setLoading(true);
      try {
        const data = await fetchWeather(lat, lon);
        saveJSON(STORAGE_KEYS.weather(key), data);
        setWeather(data);
        setFetchFailed(false);
        lastFetchFor.current = key;
      } catch {
        setFetchFailed(true);
      } finally {
        inFlight.current = null;
        setLoading(false);
      }
    },
    [key, lat, lon],
  );

  // Hedef değiştiğinde önce önbelleği göster
  useEffect(() => {
    if (!key) {
      setWeather(null);
      return;
    }
    setWeather(loadJSON<WeatherData>(STORAGE_KEYS.weather(key)));
    setFetchFailed(false);
  }, [key]);

  // İnternet varsa güncel veriyi çek
  useEffect(() => {
    if (online) void load(false);
  }, [online, load]);

  // Açıkken 30 dakikada bir tazele
  useEffect(() => {
    const id = setInterval(
      () => {
        if (navigator.onLine) {
          lastFetchFor.current = null;
          void load(true);
        }
      },
      30 * 60_000,
    );
    return () => clearInterval(id);
  }, [load]);

  const refresh = useCallback(() => {
    lastFetchFor.current = null;
    void load(true);
  }, [load]);

  return {
    weather,
    loading,
    isStale: !online || fetchFailed,
    refresh,
  };
}
