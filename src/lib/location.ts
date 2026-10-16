import type { CityDef, CountryDef, Settings } from './types';
import { findNearestCity, getCity, getCountry } from '../data/locations';

export interface ResolvedLocation {
  lat: number;
  lon: number;
  /** Kullanıcıya gösterilecek ad */
  displayName: string;
  /** Kısa ad (hava durumu başlığı vb.) */
  shortName: string;
  countryName: string;
  /** Aladhan hesaplama yöntemi */
  method: number;
  methodName: string;
  /** Önbellek anahtarı */
  key: string;
  isDeviceLocation: boolean;
  country: CountryDef;
  city: CityDef;
}

export function locationKey(lat: number, lon: number): string {
  return `loc:${lat.toFixed(3)}:${lon.toFixed(3)}`;
}

/** Ayarlardan, vakit ve hava durumu için kullanılacak konumu çözer */
export function resolveSettingsLocation(settings: Settings): ResolvedLocation | null {
  if (settings.mode === 'location' && settings.location) {
    const { lat, lon, name } = settings.location;
    const nearest = findNearestCity(lat, lon);
    return {
      lat,
      lon,
      displayName: name || nearest.city.name,
      shortName: (name || nearest.city.name).split(',')[0].trim(),
      countryName: nearest.country.name,
      method: nearest.country.method,
      methodName: nearest.country.methodName,
      key: locationKey(lat, lon),
      isDeviceLocation: true,
      country: nearest.country,
      city: nearest.city,
    };
  }

  const country = getCountry(settings.countryId);
  const city = getCity(settings.countryId, settings.cityId);
  if (!country || !city) return null;
  return {
    lat: city.lat,
    lon: city.lon,
    displayName: city.name,
    shortName: city.name,
    countryName: country.name,
    method: country.method,
    methodName: country.methodName,
    key: `${country.id}:${city.id}`,
    isDeviceLocation: false,
    country,
    city,
  };
}
