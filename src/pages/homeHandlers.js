import * as Location from 'expo-location';
import { fetchRandomVerseFunction } from '../components/RandomVerseFetcher';

export function createFetchAndSetRandomVerse({ setVerseLoading, setVerseData }) {
  return async function fetchAndSetRandomVerse() {
    try {
      setVerseLoading(true);
      const result = await fetchRandomVerseFunction();
      if (result) {
        setVerseData({
          surah_name: result.surah_name || '',
          surah_id: result.surah_id || '',
          verse_number: result.verse_number || '',
          verse_simplified: result.verse_simplified || '',
          translation: result.translation || ''
        });
      }
    } catch (err) {
      console.error('Random verse fetch error:', err);
    } finally {
      setVerseLoading(false);
    }
  };
}

export function createFetchWeatherData({ setWeatherLoading, setWeatherData, setLocationError }) {
  return async function fetchWeatherData() {
    try {
      setWeatherLoading(true);
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Konum izni reddedildi');
        setWeatherLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`
      );

      if (!response.ok) {
        throw new Error('Hava durumu verileri alınamadı');
      }

      const data = await response.json();

      if (data.current && data.current.temperature_2m !== undefined) {
        setWeatherData({
          temperature: data.current.temperature_2m,
          weatherCode: data.current.weather_code
        });
      } else {
        throw new Error('Veri formatı hatalı');
      }
    } catch (error) {
      console.error('Hava durumu hatası:', error);
      setLocationError(error.message);
    } finally {
      setWeatherLoading(false);
    }
  };
}
