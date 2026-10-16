/** localStorage için güvenli JSON yardımcıları */

export function loadJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Depolama dolu olabilir; sessizce geç
  }
}

export const STORAGE_KEYS = {
  settings: 'namaz-vakitleri:settings',
  ayah: 'namaz-vakitleri:ayah',
  geo: 'namaz-vakitleri:geo',
  notificationSettings: 'namaz-vakitleri:notif-settings',
  notifiedIds: 'namaz-vakitleri:notified',
  onboardingDone: 'namaz-vakitleri:onboarding-done',
  /** locationKey: "TR:istanbul" veya "loc:41.010:28.980" */
  prayers: (locationKey: string) => `namaz-vakitleri:prayers:${locationKey}`,
  weather: (locationKey: string) => `namaz-vakitleri:weather:${locationKey}`,
};
