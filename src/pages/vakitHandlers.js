import AsyncStorage from '@react-native-async-storage/async-storage';
import localPrayerTimes from '../../src/sources/prayer_times.json';

export function createVakitHandlers({ setLoadingPrayer, setPrayerTimes, selectedCity, setSyncingPrayers }) {
  const normalizeCityKey = (city) => city
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u');

  const loadPrayerTimesFromStorage = async (city) => {
    setLoadingPrayer(true);
    try {
      const cityKey = normalizeCityKey(city);
      const data = await AsyncStorage.getItem(`prayer_times_${cityKey}`);

      if (!data) {
        return { success: false, message: 'Namaz vakitleri henüz eşitlenmemiş.' };
      }

      const dates = JSON.parse(data);
      const today = new Date().toISOString().split('T')[0];

      if (dates[today]) {
        const prayerNames = ["İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"];
        const times = dates[today];
        const formattedTimes = times.map((time, index) => ({ vakit: prayerNames[index], saat: time }));
        setPrayerTimes(formattedTimes);
        return { success: true };
      } else {
        return { success: false, message: 'Bugünün vakitleri bulunamadı.' };
      }
    } catch (error) {
      console.error('Storage\'dan veri yükleme hatası:', error);
      return { success: false, error: error.message };
    } finally {
      setLoadingPrayer(false);
    }
  };

  const fetchPrayerTimes = async (city) => {
    setLoadingPrayer(true);
    setSyncingPrayers(true);
    try {
      const cityLower = normalizeCityKey(city);

      const response = await fetch(`https://api.collectapi.com/pray/all?city=${cityLower}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'authorization': 'apikey 6bhifejnOZi5grqhwDdjmN:7p0k9uaapOopk9cWT3GPj9'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`API Hatası: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.result && data.result.length > 0) {
        const times = data.result.map(item => item.saat);
        const today = new Date().toISOString().split('T')[0];

        const existingData = await AsyncStorage.getItem(`prayer_times_${cityLower}`);
        const dates = existingData ? JSON.parse(existingData) : {};

        dates[today] = times;

        await AsyncStorage.setItem(`prayer_times_${cityLower}`, JSON.stringify(dates));

        return { success: true, data: data.result };
      } else {
        throw new Error('Namaz vakitleri alınamadı');
      }
    } catch (error) {
      console.error('Prayer Times Error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoadingPrayer(false);
      setSyncingPrayers(false);
    }
  };

  const syncAllCities = async (cities, setPrayerTimesForSelected) => {
    setSyncingPrayers(true);
    setLoadingPrayer(true);

    try {
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        const result = await fetchPrayerTimes(city);

        if (result.success) {
          successCount++;
          if (city === selectedCity && setPrayerTimesForSelected) {
            setPrayerTimesForSelected(result.data);
          }
        } else {
          failCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      return { success: true, successCount, failCount };
    } catch (error) {
      console.error('Toplu eşitleme hatası:', error);
      return { success: false, error: error.message };
    } finally {
      setSyncingPrayers(false);
      setLoadingPrayer(false);
    }
  };

  const isPrayerPassed = (prayerTime) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;
    return prayerMinutes < currentMinutes;
  };

  const handleCityChange = async (city, saveCityFn) => {
    if (saveCityFn) await saveCityFn(city);
    if (loadPrayerTimesFromStorage) await loadPrayerTimesFromStorage(city);
  };

  return {
    loadPrayerTimesFromStorage,
    fetchPrayerTimes,
    syncAllCities,
    isPrayerPassed,
    handleCityChange
  };
}
