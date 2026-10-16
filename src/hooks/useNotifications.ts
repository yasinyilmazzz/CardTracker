import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type {
  AppNotification,
  NotificationSettings,
  PermissionState,
  PrayerCache,
  PrayerKey,
} from '../lib/types';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage';
import { PRAYER_NAMES_TR, getNextPrayer, toKey } from '../lib/time';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  minutesBefore: 15,
  onTime: true,
  vibrate: true,
  prayers: {
    Fajr: true,
    Sunrise: false,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
};

const NOTIFICATION_ICON = '/images/icon.png';
const CHANNEL_ID = 'prayer-times';

let channelCreated = false;
async function ensureNotificationChannel() {
  if (channelCreated || !Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: 'Namaz Vakitleri',
      description: 'Namaz vakti hatırlatmaları ve vakit giriş bildirimleri',
      importance: 5,
      visibility: 1,
      vibration: true,
    });
    channelCreated = true;
  } catch {
    /* Kanal oluşturulamazsa devam et */
  }
}

function getWebNotificationPermission(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  const p = Notification.permission;
  return p === 'default' ? 'prompt' : p;
}

/** Sistem bildirimi göster (Capacitor Native veya Web Notification) */
async function showSystemNotification(title: string, body: string, vibrate: boolean): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      await ensureNotificationChannel();
      const perms = await LocalNotifications.checkPermissions();
      if (perms.display !== 'granted') return false;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 2147483647),
            title,
            body,
            channelId: CHANNEL_ID,
            schedule: { at: new Date(Date.now() + 150) },
          },
        ],
      });
      return true;
    } catch (e) {
      console.warn('Native bildirim gönderilemedi:', e);
      return false;
    }
  }

  // Web ortamı
  if (getWebNotificationPermission() !== 'granted') return false;
  const options: NotificationOptions & { vibrate?: number[] } = {
    body,
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    tag: `namaz-${Date.now()}`,
    lang: 'tr',
  };
  if (vibrate) options.vibrate = [200, 100, 200];

  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
  } catch {
    /* SW yoksa aşağıya düş */
  }
  try {
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}

/** Kısa ve yumuşak bir uyarı sesi (WebAudio; kullanıcı etkileşimi sonrası çalışır) */
function playChime() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = [659.25, 783.99, 987.77];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.55);
    });
    setTimeout(() => void ctx.close(), 1500);
  } catch {
    /* ses çalınamadı */
  }
}

export interface NotificationsState {
  permission: PermissionState;
  settings: NotificationSettings;
  updateSettings: (patch: Partial<NotificationSettings>) => void;
  togglePrayer: (key: PrayerKey) => void;
  requestPermission: () => Promise<PermissionState>;
  /** Ekranda gösterilen uygulama içi bildirim */
  toast: AppNotification | null;
  dismissToast: () => void;
  /** Test bildirimi gönder */
  sendTest: () => void;
}

/**
 * Namaz vakti bildirimleri:
 * - Vakte X dakika kala hatırlatma
 * - Vakit girdiğinde bildirim
 * Sistem bildirimi (izin varsa) + uygulama içi toast + titreşim + ses.
 */
export function useNotifications(
  cache: PrayerCache | null,
  now: Date,
  placeName: string | null,
): NotificationsState {
  const isNative = Capacitor.isNativePlatform();
  const [permission, setPermission] = useState<PermissionState>(
    isNative ? 'prompt' : getWebNotificationPermission(),
  );

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const stored = loadJSON<Partial<NotificationSettings>>(STORAGE_KEYS.notificationSettings);
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...stored,
      prayers: { ...DEFAULT_NOTIFICATION_SETTINGS.prayers, ...(stored?.prayers ?? {}) },
    };
  });
  const [toast, setToast] = useState<AppNotification | null>(null);
  const notifiedRef = useRef<Set<string>>(
    new Set(loadJSON<string[]>(STORAGE_KEYS.notifiedIds) ?? []),
  );
  const toastTimer = useRef<number | null>(null);

  const persistNotified = () => {
    const arr = [...notifiedRef.current].slice(-60);
    notifiedRef.current = new Set(arr);
    saveJSON(STORAGE_KEYS.notifiedIds, arr);
  };

  const dismissToast = useCallback(() => {
    setToast(null);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const notify = useCallback(
    (title: string, body: string) => {
      void showSystemNotification(title, body, settings.vibrate);
      if (settings.vibrate && navigator.vibrate) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch {
          /* yoksay */
        }
      }
      playChime();
      setToast({ id: `${Date.now()}`, title, body, at: Date.now() });
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(null), 12000);
    },
    [settings.vibrate],
  );

  const updateSettings = useCallback((patch: Partial<NotificationSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveJSON(STORAGE_KEYS.notificationSettings, next);
      return next;
    });
  }, []);

  const togglePrayer = useCallback((key: PrayerKey) => {
    setSettings((prev) => {
      const next = { ...prev, prayers: { ...prev.prayers, [key]: !prev.prayers[key] } };
      saveJSON(STORAGE_KEYS.notificationSettings, next);
      return next;
    });
  }, []);

  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (isNative) {
      try {
        await ensureNotificationChannel();
        const res = await LocalNotifications.requestPermissions();
        const p: PermissionState =
          res.display === 'granted' ? 'granted' : res.display === 'denied' ? 'denied' : 'prompt';
        setPermission(p);
        return p;
      } catch (err) {
        console.error('LocalNotifications izin isteği başarısız:', err);
        return 'denied';
      }
    }

    if (!('Notification' in window)) return 'unsupported';
    try {
      const result = await Notification.requestPermission();
      const p: PermissionState = result === 'default' ? 'prompt' : result;
      setPermission(p);
      return p;
    } catch {
      const p = getWebNotificationPermission();
      setPermission(p);
      return p;
    }
  }, [isNative]);

  // İzin durumunu kontrol et
  useEffect(() => {
    if (isNative) {
      void ensureNotificationChannel();
      LocalNotifications.checkPermissions().then((res) => {
        if (res.display === 'granted') setPermission('granted');
        else if (res.display === 'denied') setPermission('denied');
        else setPermission('prompt');
      }).catch(() => {});
      return;
    }

    const onVis = () => setPermission(getWebNotificationPermission());
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [isNative]);

  const sendTest = useCallback(() => {
    notify(
      'Namaz Vakitleri · Test',
      `Bildirimler çalışıyor.${placeName ? ` Konum: ${placeName}` : ''}`,
    );
  }, [notify, placeName]);

  // Zamanlayıcı: her "now" güncellemesinde (saniyede bir) kontrol
  useEffect(() => {
    if (!settings.enabled || !cache) return;
    const next = getNextPrayer(cache.days, now);
    if (!next) return;

    const place = placeName ? ` (${placeName})` : '';

    // 1) Vakte X dakika kala hatırlatma
    if (settings.minutesBefore > 0 && settings.prayers[next.key]) {
      const remainingMs = next.at.getTime() - now.getTime();
      const thresholdMs = settings.minutesBefore * 60_000;
      // Eşik geçildikten sonra en fazla 5 dk içinde bildir
      if (remainingMs > 0 && remainingMs <= thresholdMs && remainingMs > thresholdMs - 5 * 60_000) {
        const id = `before:${toKey(next.at)}:${next.key}`;
        if (!notifiedRef.current.has(id)) {
          notifiedRef.current.add(id);
          persistNotified();
          const mins = Math.max(1, Math.round(remainingMs / 60_000));
          notify(
            `${next.name} vaktine ${mins} dakika kaldı`,
            `${next.name} vakti ${next.time}'de giriyor${place}.`,
          );
        }
      }
    }

    // 2) Vakit girdi (önceki vakit son 2 dakika içinde başladıysa)
    if (settings.onTime && next.prevKey && next.prevAt && settings.prayers[next.prevKey]) {
      const sinceMs = now.getTime() - next.prevAt.getTime();
      if (sinceMs >= 0 && sinceMs < 2 * 60_000) {
        const id = `time:${toKey(next.prevAt)}:${next.prevKey}`;
        if (!notifiedRef.current.has(id)) {
          notifiedRef.current.add(id);
          persistNotified();
          const prevName = PRAYER_NAMES_TR[next.prevKey];
          const hh = String(next.prevAt.getHours()).padStart(2, '0');
          const mm = String(next.prevAt.getMinutes()).padStart(2, '0');
          notify(
            `${prevName} vakti girdi`,
            `${prevName} vakti (${hh}:${mm})${place}. Sıradaki vakit: ${next.name} ${next.time}.`,
          );
        }
      }
    }
  }, [now, cache, settings, placeName, notify]);

  return {
    permission,
    settings,
    updateSettings,
    togglePrayer,
    requestPermission,
    toast,
    dismissToast,
    sendTest,
  };
}
