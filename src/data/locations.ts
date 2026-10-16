import type { CityDef, CountryDef } from '../lib/types';

/**
 * Ülke ve şehir listesi. Koordinatlar il merkezlerine aittir.
 * method: Aladhan API hesaplama yöntemi (13 = Diyanet İşleri Başkanlığı)
 */
export const COUNTRIES: CountryDef[] = [
  {
    id: 'TR',
    name: 'Türkiye',
    method: 13,
    methodName: 'Diyanet İşleri Başkanlığı',
    cities: [
      { id: 'adana', name: 'Adana', lat: 37.0, lon: 35.32 },
      { id: 'adiyaman', name: 'Adıyaman', lat: 37.76, lon: 38.28 },
      { id: 'afyonkarahisar', name: 'Afyonkarahisar', lat: 38.76, lon: 30.54 },
      { id: 'agri', name: 'Ağrı', lat: 39.72, lon: 43.05 },
      { id: 'aksaray', name: 'Aksaray', lat: 38.37, lon: 34.03 },
      { id: 'amasya', name: 'Amasya', lat: 40.65, lon: 35.83 },
      { id: 'ankara', name: 'Ankara', lat: 39.93, lon: 32.86 },
      { id: 'antalya', name: 'Antalya', lat: 36.88, lon: 30.7 },
      { id: 'ardahan', name: 'Ardahan', lat: 41.11, lon: 42.7 },
      { id: 'artvin', name: 'Artvin', lat: 41.18, lon: 41.82 },
      { id: 'aydin', name: 'Aydın', lat: 37.84, lon: 27.85 },
      { id: 'balikesir', name: 'Balıkesir', lat: 39.65, lon: 27.89 },
      { id: 'bartin', name: 'Bartın', lat: 41.63, lon: 32.34 },
      { id: 'batman', name: 'Batman', lat: 37.88, lon: 41.13 },
      { id: 'bayburt', name: 'Bayburt', lat: 40.26, lon: 40.22 },
      { id: 'bilecik', name: 'Bilecik', lat: 40.14, lon: 29.98 },
      { id: 'bingol', name: 'Bingöl', lat: 38.88, lon: 40.5 },
      { id: 'bitlis', name: 'Bitlis', lat: 38.4, lon: 42.11 },
      { id: 'bolu', name: 'Bolu', lat: 40.74, lon: 31.61 },
      { id: 'burdur', name: 'Burdur', lat: 37.72, lon: 30.29 },
      { id: 'bursa', name: 'Bursa', lat: 40.19, lon: 29.06 },
      { id: 'canakkale', name: 'Çanakkale', lat: 40.15, lon: 26.41 },
      { id: 'cankiri', name: 'Çankırı', lat: 40.6, lon: 33.62 },
      { id: 'corum', name: 'Çorum', lat: 40.55, lon: 34.96 },
      { id: 'denizli', name: 'Denizli', lat: 37.78, lon: 29.1 },
      { id: 'diyarbakir', name: 'Diyarbakır', lat: 37.91, lon: 40.24 },
      { id: 'duzce', name: 'Düzce', lat: 40.84, lon: 31.16 },
      { id: 'edirne', name: 'Edirne', lat: 41.68, lon: 26.56 },
      { id: 'elazig', name: 'Elazığ', lat: 38.67, lon: 39.22 },
      { id: 'erzincan', name: 'Erzincan', lat: 39.75, lon: 39.49 },
      { id: 'erzurum', name: 'Erzurum', lat: 39.9, lon: 41.27 },
      { id: 'eskisehir', name: 'Eskişehir', lat: 39.78, lon: 30.52 },
      { id: 'gaziantep', name: 'Gaziantep', lat: 37.07, lon: 37.38 },
      { id: 'giresun', name: 'Giresun', lat: 40.91, lon: 38.39 },
      { id: 'gumushane', name: 'Gümüşhane', lat: 40.46, lon: 39.48 },
      { id: 'hakkari', name: 'Hakkari', lat: 37.57, lon: 43.74 },
      { id: 'hatay', name: 'Hatay', lat: 36.2, lon: 36.16 },
      { id: 'igdir', name: 'Iğdır', lat: 39.92, lon: 44.05 },
      { id: 'isparta', name: 'Isparta', lat: 37.76, lon: 30.56 },
      { id: 'istanbul', name: 'İstanbul', lat: 41.01, lon: 28.98 },
      { id: 'izmir', name: 'İzmir', lat: 38.42, lon: 27.14 },
      { id: 'kahramanmaras', name: 'Kahramanmaraş', lat: 37.58, lon: 36.93 },
      { id: 'karabuk', name: 'Karabük', lat: 41.21, lon: 32.62 },
      { id: 'karaman', name: 'Karaman', lat: 37.18, lon: 33.22 },
      { id: 'kars', name: 'Kars', lat: 40.6, lon: 43.1 },
      { id: 'kastamonu', name: 'Kastamonu', lat: 41.39, lon: 33.78 },
      { id: 'kayseri', name: 'Kayseri', lat: 38.72, lon: 35.49 },
      { id: 'kirikkale', name: 'Kırıkkale', lat: 39.85, lon: 33.51 },
      { id: 'kirklareli', name: 'Kırklareli', lat: 41.73, lon: 27.22 },
      { id: 'kirsehir', name: 'Kırşehir', lat: 39.15, lon: 34.16 },
      { id: 'kilis', name: 'Kilis', lat: 36.72, lon: 37.12 },
      { id: 'kocaeli', name: 'Kocaeli', lat: 40.85, lon: 29.88 },
      { id: 'konya', name: 'Konya', lat: 37.87, lon: 32.48 },
      { id: 'kutahya', name: 'Kütahya', lat: 39.42, lon: 29.98 },
      { id: 'malatya', name: 'Malatya', lat: 38.31, lon: 38.31 },
      { id: 'manisa', name: 'Manisa', lat: 38.61, lon: 27.43 },
      { id: 'mardin', name: 'Mardin', lat: 37.31, lon: 40.74 },
      { id: 'mersin', name: 'Mersin', lat: 36.81, lon: 34.64 },
      { id: 'mugla', name: 'Muğla', lat: 37.22, lon: 28.36 },
      { id: 'mus', name: 'Muş', lat: 38.75, lon: 41.51 },
      { id: 'nevsehir', name: 'Nevşehir', lat: 38.62, lon: 34.71 },
      { id: 'nigde', name: 'Niğde', lat: 37.97, lon: 34.68 },
      { id: 'ordu', name: 'Ordu', lat: 40.98, lon: 37.88 },
      { id: 'osmaniye', name: 'Osmaniye', lat: 37.07, lon: 36.25 },
      { id: 'rize', name: 'Rize', lat: 41.03, lon: 40.52 },
      { id: 'sakarya', name: 'Sakarya', lat: 40.77, lon: 30.4 },
      { id: 'samsun', name: 'Samsun', lat: 41.29, lon: 36.33 },
      { id: 'siirt', name: 'Siirt', lat: 37.93, lon: 41.94 },
      { id: 'sinop', name: 'Sinop', lat: 42.03, lon: 35.15 },
      { id: 'sivas', name: 'Sivas', lat: 39.75, lon: 37.02 },
      { id: 'sanliurfa', name: 'Şanlıurfa', lat: 37.16, lon: 38.79 },
      { id: 'sirnak', name: 'Şırnak', lat: 37.52, lon: 42.45 },
      { id: 'tekirdag', name: 'Tekirdağ', lat: 40.98, lon: 27.51 },
      { id: 'tokat', name: 'Tokat', lat: 40.32, lon: 36.55 },
      { id: 'trabzon', name: 'Trabzon', lat: 41.0, lon: 39.72 },
      { id: 'tunceli', name: 'Tunceli', lat: 39.11, lon: 39.55 },
      { id: 'usak', name: 'Uşak', lat: 38.68, lon: 29.41 },
      { id: 'van', name: 'Van', lat: 38.49, lon: 43.38 },
      { id: 'yalova', name: 'Yalova', lat: 40.65, lon: 29.27 },
      { id: 'yozgat', name: 'Yozgat', lat: 39.82, lon: 34.81 },
      { id: 'zonguldak', name: 'Zonguldak', lat: 41.46, lon: 31.79 },
    ],
  },
  {
    id: 'DE',
    name: 'Almanya',
    method: 3,
    methodName: 'Muslim World League',
    cities: [
      { id: 'berlin', name: 'Berlin', lat: 52.52, lon: 13.4 },
      { id: 'dortmund', name: 'Dortmund', lat: 51.51, lon: 7.47 },
      { id: 'duisburg', name: 'Duisburg', lat: 51.43, lon: 6.76 },
      { id: 'dusseldorf', name: 'Düsseldorf', lat: 51.23, lon: 6.78 },
      { id: 'essen', name: 'Essen', lat: 51.46, lon: 7.01 },
      { id: 'frankfurt', name: 'Frankfurt', lat: 50.11, lon: 8.68 },
      { id: 'hamburg', name: 'Hamburg', lat: 53.55, lon: 9.99 },
      { id: 'koln', name: 'Köln', lat: 50.94, lon: 6.96 },
      { id: 'munih', name: 'Münih', lat: 48.14, lon: 11.58 },
      { id: 'stuttgart', name: 'Stuttgart', lat: 48.78, lon: 9.18 },
    ],
  },
  {
    id: 'NL',
    name: 'Hollanda',
    method: 3,
    methodName: 'Muslim World League',
    cities: [
      { id: 'amsterdam', name: 'Amsterdam', lat: 52.37, lon: 4.9 },
      { id: 'eindhoven', name: 'Eindhoven', lat: 51.44, lon: 5.48 },
      { id: 'lahey', name: 'Lahey', lat: 52.07, lon: 4.3 },
      { id: 'rotterdam', name: 'Rotterdam', lat: 51.92, lon: 4.48 },
      { id: 'utrecht', name: 'Utrecht', lat: 52.09, lon: 5.12 },
    ],
  },
  {
    id: 'FR',
    name: 'Fransa',
    method: 12,
    methodName: "Union des Organisations Islamiques de France",
    cities: [
      { id: 'lyon', name: 'Lyon', lat: 45.76, lon: 4.84 },
      { id: 'marsilya', name: 'Marsilya', lat: 43.3, lon: 5.37 },
      { id: 'paris', name: 'Paris', lat: 48.86, lon: 2.35 },
      { id: 'strazburg', name: 'Strazburg', lat: 48.57, lon: 7.75 },
    ],
  },
  {
    id: 'BE',
    name: 'Belçika',
    method: 3,
    methodName: 'Muslim World League',
    cities: [
      { id: 'anvers', name: 'Anvers', lat: 51.22, lon: 4.4 },
      { id: 'bruksel', name: 'Brüksel', lat: 50.85, lon: 4.35 },
      { id: 'gent', name: 'Gent', lat: 51.05, lon: 3.72 },
    ],
  },
  {
    id: 'AT',
    name: 'Avusturya',
    method: 3,
    methodName: 'Muslim World League',
    cities: [
      { id: 'graz', name: 'Graz', lat: 47.07, lon: 15.44 },
      { id: 'linz', name: 'Linz', lat: 48.31, lon: 14.29 },
      { id: 'viyana', name: 'Viyana', lat: 48.21, lon: 16.37 },
    ],
  },
  {
    id: 'GB',
    name: 'İngiltere',
    method: 3,
    methodName: 'Muslim World League',
    cities: [
      { id: 'birmingham', name: 'Birmingham', lat: 52.48, lon: -1.9 },
      { id: 'londra', name: 'Londra', lat: 51.51, lon: -0.13 },
      { id: 'manchester', name: 'Manchester', lat: 53.48, lon: -2.24 },
    ],
  },
  {
    id: 'US',
    name: 'Amerika Birleşik Devletleri',
    method: 2,
    methodName: 'ISNA (Kuzey Amerika)',
    cities: [
      { id: 'chicago', name: 'Chicago', lat: 41.88, lon: -87.63 },
      { id: 'houston', name: 'Houston', lat: 29.76, lon: -95.37 },
      { id: 'los-angeles', name: 'Los Angeles', lat: 34.05, lon: -118.24 },
      { id: 'new-york', name: 'New York', lat: 40.71, lon: -74.01 },
      { id: 'washington', name: 'Washington', lat: 38.9, lon: -77.04 },
    ],
  },
];

export function getCountry(countryId: string): CountryDef | undefined {
  return COUNTRIES.find((c) => c.id === countryId);
}

export function getCity(countryId: string, cityId: string) {
  return getCountry(countryId)?.cities.find((c) => c.id === cityId);
}

/** İki koordinat arası mesafe (km) — Haversine */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Verilen koordinata en yakın şehir ve ülke */
export function findNearestCity(lat: number, lon: number): {
  country: CountryDef;
  city: CityDef;
  distanceKm: number;
} {
  let best: { country: CountryDef; city: CityDef; distanceKm: number } | null = null;
  for (const country of COUNTRIES) {
    for (const city of country.cities) {
      const d = distanceKm(lat, lon, city.lat, city.lon);
      if (!best || d < best.distanceKm) best = { country, city, distanceKm: d };
    }
  }
  return best!;
}
