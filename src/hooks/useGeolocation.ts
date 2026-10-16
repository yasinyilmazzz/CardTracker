import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import type { GeoPoint, PermissionState } from '../lib/types';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage';
import { reverseGeocode } from '../lib/api';
import { findNearestCity } from '../data/locations';

interface StoredGeo extends GeoPoint {
  at: string;
}

export interface GeolocationState {
  permission: PermissionState;
  /** Son bilinen cihaz konumu (adıyla birlikte) */
  point: GeoPoint | null;
  loading: boolean;
  error: string | null;
  /**
   * Konum izni ister ve güncel konumu alır. İzin daha önce verilmediyse
   * sistem izin penceresi gösterir. Başarısızlıkta null döner.
   */
  request: () => Promise<GeoPoint | null>;
}

async function getCoordinates(): Promise<{ lat: number; lon: number }> {
  if (Capacitor.isNativePlatform()) {
    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted') {
      const requested = await Geolocation.requestPermissions();
      if (requested.location !== 'granted') {
        const error: any = new Error('Konum izni reddedildi');
        error.code = 1;
        throw error;
      }
    }
    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10 * 60 * 1000,
    });
    return {
      lat: Number(pos.coords.latitude.toFixed(4)),
      lon: Number(pos.coords.longitude.toFixed(4)),
    };
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
        });
      },
      reject,
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 10 * 60 * 1000,
      },
    );
  });
}

/** Koordinat için yer adı üret (çevrimiçi: ters geokodlama; değilse en yakın şehir) */
async function nameFor(lat: number, lon: number): Promise<string> {
  if (navigator.onLine) {
    const n = await reverseGeocode(lat, lon);
    if (n) return n;
  }
  return findNearestCity(lat, lon).city.name;
}

export function useGeolocation(): GeolocationState {
  const isNative = Capacitor.isNativePlatform();
  const supported = isNative || (typeof navigator !== 'undefined' && 'geolocation' in navigator);
  const [permission, setPermission] = useState<PermissionState>(
    supported ? 'prompt' : 'unsupported',
  );
  const [point, setPoint] = useState<GeoPoint | null>(() => {
    const s = loadJSON<StoredGeo>(STORAGE_KEYS.geo);
    return s ? { lat: s.lat, lon: s.lon, name: s.name } : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<Promise<GeoPoint | null> | null>(null);

  const persist = useCallback((p: GeoPoint) => {
    setPoint(p);
    saveJSON(STORAGE_KEYS.geo, { ...p, at: new Date().toISOString() } satisfies StoredGeo);
  }, []);

  const request = useCallback((): Promise<GeoPoint | null> => {
    if (!supported) {
      setError('Bu cihaz konum servisini desteklemiyor.');
      return Promise.resolve(null);
    }
    if (inFlight.current) return inFlight.current;

    const p = (async () => {
      setLoading(true);
      setError(null);
      try {
        const { lat, lon } = await getCoordinates();
        setPermission('granted');
        const name = await nameFor(lat, lon);
        const gp: GeoPoint = { lat, lon, name };
        persist(gp);
        return gp;
      } catch (e: any) {
        if (e?.code === 1 || e?.message?.includes('denied')) {
          setPermission('denied');
          setError(
            'Konum izni reddedildi. Cihaz ayarlarından bu uygulama için konum iznini açmanız gerekir.',
          );
        } else if (e?.code === 2) {
          setError('Konum belirlenemedi. GPS veya konum servislerinin açık olduğundan emin olun.');
        } else if (e?.code === 3) {
          setError('Konum alınırken zaman aşımı oluştu. Lütfen tekrar deneyin.');
        } else {
          setError('Konum alınamadı. Lütfen cihaz konum servislerini kontrol edin.');
        }
        return null;
      } finally {
        setLoading(false);
        inFlight.current = null;
      }
    })();

    inFlight.current = p;
    return p;
  }, [supported, persist]);

  // Başlangıçta ve izin değişimlerinde durumu kontrol et
  useEffect(() => {
    if (!supported) return;

    if (isNative) {
      Geolocation.checkPermissions()
        .then((res) => {
          if (res.location === 'granted') {
            setPermission('granted');
          } else if (res.location === 'denied') {
            setPermission('denied');
          } else {
            setPermission('prompt');
          }
        })
        .catch(() => {});
      return;
    }

    let status: globalThis.PermissionStatus | null = null;
    let cancelled = false;

    const apply = (state: globalThis.PermissionState) => {
      if (cancelled) return;
      setPermission(state);
      if (state === 'granted') void request();
    };

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((s) => {
          status = s;
          apply(s.state);
          s.onchange = () => apply(s.state);
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
      if (status) status.onchange = null;
    };
  }, [supported, isNative, request]);

  return { permission, point, loading, error, request };
}
