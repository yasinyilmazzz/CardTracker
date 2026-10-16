import { useCallback, useEffect, useRef, useState } from 'react';
import type { AyahData } from '../lib/types';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage';
import { fetchRandomAyah } from '../lib/api';

export interface AyahState {
  ayah: AyahData | null;
  loading: boolean;
  /** Gösterilen veri güncel değil (çevrimdışı veya son deneme başarısız) */
  isStale: boolean;
  refresh: () => void;
}

/**
 * Rastgele ayet: internet varsa yeni ayet çekilir ve önbelleğe alınır;
 * yoksa son ayet gösterilir ve isStale=true olur.
 */
export function useAyah(online: boolean): AyahState {
  const [ayah, setAyah] = useState<AyahData | null>(() =>
    loadJSON<AyahData>(STORAGE_KEYS.ayah),
  );
  const [loading, setLoading] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const inFlight = useRef(false);
  const fetchedOnce = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current || !navigator.onLine) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const data = await fetchRandomAyah();
      saveJSON(STORAGE_KEYS.ayah, data);
      setAyah(data);
      setFetchFailed(false);
    } catch {
      setFetchFailed(true);
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  // Uygulama açılışında (internet varsa) yeni bir ayet getir
  useEffect(() => {
    if (online && !fetchedOnce.current) {
      fetchedOnce.current = true;
      void load();
    }
  }, [online, load]);

  const refresh = useCallback(() => {
    void load();
  }, [load]);

  return {
    ayah,
    loading,
    isStale: !online || fetchFailed,
    refresh,
  };
}
