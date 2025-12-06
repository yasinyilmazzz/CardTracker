import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  ImageBackground,
  Platform
} from 'react-native';
import { Menu, Plus, Minus, Trash2, Download, X, Check, Edit2, Cloud, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import localPrayerTimes from './src/sources/prayer_times.json';
import * as ImagePicker from 'expo-image-picker';
import RandomVerseFetcher, { fetchRandomVerseFunction } from './src/components/RandomVerseFetcher';
import HomePage from './src/pages/HomePage';
import CardsPage from './src/pages/CardsPage';
import ReportsPage from './src/pages/ReportsPage';
import VakitlerPage from './src/pages/VakitlerPage';
import SettingsPage from './src/pages/SettingsPage';
import styles from './src/styles';

import { createFetchAndSetRandomVerse, createFetchWeatherData } from './src/pages/homeHandlers';
import { createCardHandlers } from './src/pages/cardsHandlers';
import { createReportsHelpers } from './src/pages/reportsHandlers';
import { createVakitHandlers } from './src/pages/vakitHandlers';

// Bildirim ayarları
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('Home');
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState('New');
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [showValueInput, setShowValueInput] = useState(false);
  const [inputType, setInputType] = useState('add');
  const [newTitle, setNewTitle] = useState('');
  const [newValue, setNewValue] = useState('');
  const [chartPeriod, setChartPeriod] = useState('weekly');
  const [selectedChartCard, setSelectedChartCard] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState('İstanbul');
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [loadingPrayer, setLoadingPrayer] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [syncingPrayers, setSyncingPrayers] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Random verse state
  const [verseLoading, setVerseLoading] = useState(false);
  const [verseData, setVerseData] = useState({
    surah_name: '',
    surah_id: '',
    verse_number: '',
    verse_simplified: '',
    translation: ''
  });
  const [editingCardId, setEditingCardId] = useState(null);
  const [editInputType, setEditInputType] = useState('add');
  const [editValue, setEditValue] = useState('');

  // Weather state
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [backgroundUri, setBackgroundUri] = useState(null);

  // Ref to track if cards have been loaded from storage
  const cardsLoadedRef = useRef(false);
  const cities = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Sivas", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"];

  // Pages (internal key vs UI label)
  const pages = [
    { key: 'Home', label: 'Ana Sayfa' },
    { key: 'Cards', label: 'Tespihler' },
    { key: 'Reports', label: 'Raporlar' },
    { key: 'Vakitler', label: 'Vakitler' },
    { key: 'Ayarlar', label: 'Ayarlar' }
  ];

  const prayerNames = ["İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"];
  // Tarih formatlama fonksiyonu
  const formatDateForDisplay = (date) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const dayName = days[date.getDay()];

    return `${day} ${month} ${year}, ${dayName}`;
  };
  // Bir sonraki güne geçiş
  const handleNextDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 7);

    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    if (nextDate <= maxDate) {
      setSelectedDate(nextDate);
    }
  };
  // İleri butonunun aktif olup olmadığını kontrol et
  const canGoForward = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 6); // Bugünden 6 gün sonrası = toplam 7 gün


    const currentSelectedDate = new Date(selectedDate);
    currentSelectedDate.setHours(0, 0, 0, 0);

    return currentSelectedDate < maxDate;
  };
  // Bir önceki güne geçiş
  const handlePreviousDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const previousDate = new Date(selectedDate);
    previousDate.setDate(previousDate.getDate() - 1);

    if (previousDate >= today) {
      setSelectedDate(previousDate);
    }
  };
  // Geri butonunun aktif olup olmadığını kontrol et
  const canGoBack = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentSelectedDate = new Date(selectedDate);
    currentSelectedDate.setHours(0, 0, 0, 0);

    return currentSelectedDate > today;
  };
  // Canlı saat güncellemesi
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      checkPrayerTimeNotification();
    }, 1000);
    return () => clearInterval(interval);
  }, [prayerTimes]);

  // Fetch a random verse when Home page is shown
  React.useEffect(() => {
    if (currentPage === 'Home') {
      fetchAndSetRandomVerse();
      fetchWeatherData();
    }
  }, [currentPage]);

  // fetchAndSetRandomVerse implementation moved to src/pages/homeHandlers

  // fetchWeatherData implementation moved to src/pages/homeHandlers

  // Uygulama açılışında kaydedilmiş şehri yükle
  React.useEffect(() => {
    const initialize = async () => {
      await requestNotificationPermissions();
      await initializePrayerTimes();
      await loadSavedCity();
      await loadSavedBackground();
    };
    initialize();
  }, []);

  const loadSavedBackground = async () => {
    try {
      const uri = await AsyncStorage.getItem('background_uri');
      if (uri) {
        setBackgroundUri(uri);
      }
    } catch (err) {
      console.warn('Arka plan yüklenemedi:', err);
    }
  };

  const selectAndSetBackground = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Galeriden resim seçebilmek için izin gereklidir.');
        return;
      }

      // Build options defensively so we don't access undefined properties on older/newer SDKs
      const mediaTypesOption = (ImagePicker.MediaType && ImagePicker.MediaType.Images)
        || (ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images);

      const pickerOptions = {
        allowsEditing: true,
        quality: 0.8,
      };

      if (mediaTypesOption) pickerOptions.mediaTypes = mediaTypesOption;

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      // Handle both legacy and new result shapes.
      // Legacy: { cancelled: false, uri }
      // New: { canceled: false, assets: [{ uri, ... }] }
      let uri;
      if (typeof result.cancelled !== 'undefined') {
        // legacy
        if (!result.cancelled && result.uri) uri = result.uri;
      } else if (typeof result.canceled !== 'undefined') {
        // new
        if (!result.canceled && Array.isArray(result.assets) && result.assets[0] && result.assets[0].uri) {
          uri = result.assets[0].uri;
        }
      }

      if (uri) {
        setBackgroundUri(uri);
        await AsyncStorage.setItem('background_uri', uri);
      } else {
        // user cancelled or unexpected shape; do nothing
        return;
      }
    } catch (err) {
      console.error('Arka plan seçilemedi:', err);
      Alert.alert('Hata', 'Arka plan seçilirken bir hata oluştu.');
    }
  };

  // Uygulama açılışında kaydedilmiş şehri yükle
  React.useEffect(() => {
    const initialize = async () => {
      await requestNotificationPermissions();
      await initializePrayerTimes();
      const city = await loadSavedCity();
      await loadSavedBackground();
      await loadCards();
      if (city) {
        await loadPrayerTimesFromStorage(city);
      }
    };
    initialize();
  }, []);

  // Şehir değiştiğinde veya sayfa Vakitler'e geçtiğinde vakitleri yükle
  React.useEffect(() => {
    if (selectedCity && currentPage === 'Vakitler') {
      loadPrayerTimesFromStorage(selectedCity, selectedDate);
    }
  }, [selectedCity, currentPage, selectedDate]);

  // Kartlar değiştiğinde otomatik kaydet (sadece yükleme tamamlandıktan sonra)
  React.useEffect(() => {
    if (cardsLoadedRef.current) {
      saveCards(cards);
    }
  }, [cards]);

  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Bildirim İzni', 'Namaz vakti bildirimleri için izin gereklidir.');
    }
  };

  const checkPrayerTimeNotification = async () => {
    if (prayerTimes.length === 0) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const prayer of prayerTimes) {
      if (prayer.saat === currentTime) {
        const notificationSent = await AsyncStorage.getItem(`notification_${prayer.vakit}_${currentTime}`);

        if (!notificationSent) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${prayer.vakit} Vakti Girdi`,
              body: `${selectedCity} için ${prayer.vakit} vakti girmiştir.`,
              sound: true,
            },
            trigger: null,
          });

          await AsyncStorage.setItem(`notification_${prayer.vakit}_${currentTime}`, 'true');
        }
      }
    }
  };

  const initializePrayerTimes = async () => {
    try {
      const initialized = await AsyncStorage.getItem('prayer_times_initialized');

      if (!initialized) {
        console.log('İlk açılış: Namaz vakitleri yükleniyor...');

        for (const [city, dates] of Object.entries(localPrayerTimes)) {
          try {
            await AsyncStorage.setItem(`prayer_times_${city}`, JSON.stringify(dates));
            console.log(`${city} vakitleri kaydedildi`);
          } catch (error) {
            console.error(`${city} kaydedilemedi:`, error);
          }
        }

        await AsyncStorage.setItem('prayer_times_initialized', 'true');
        console.log('Tüm namaz vakitleri yüklendi');
        Alert.alert('Hoş Geldiniz!', 'Namaz vakitleri yüklendi. Güncel vakitler için "Vakitleri Eşitle" butonunu kullanabilirsiniz.');
      } else {
        console.log('Namaz vakitleri zaten mevcut');
      }
    } catch (error) {
      console.error('Prayer times initialize hatası:', error);
    }
  };

  const loadSavedCity = async () => {
    try {
      const savedCity = await AsyncStorage.getItem('selectedCity');
      if (savedCity) {
        setSelectedCity(savedCity);
        console.log('Kaydedilmiş şehir yüklendi:', savedCity);
        // Load prayer times for saved city so Home's nextPrayer is available immediately
        try {
          await loadPrayerTimesFromStorage(savedCity);
        } catch (err) {
          console.warn('Vakitler yüklenemedi (savedCity):', err);
        }
      } else {
        await saveCity('İstanbul');
        // Load default city times as well
        try {
          await loadPrayerTimesFromStorage('İstanbul');
        } catch (err) {
          console.warn('Vakitler yüklenemedi (default İstanbul):', err);
        }
      }
    } catch (error) {
      console.error('Şehir yüklenirken hata:', error);
      return 'İstanbul';
    }
  };

  const saveCity = async (city) => {
    try {
      await AsyncStorage.setItem('selectedCity', city);
      console.log('Şehir kaydedildi:', city);
    } catch (error) {
      console.error('Şehir kaydedilirken hata:', error);
    }
  };

  const loadSavedBackground = async () => {
    try {
      const uri = await AsyncStorage.getItem('background_uri');
      if (uri) setBackgroundUri(uri);
    } catch (err) {
      console.warn('Arka plan yüklenemedi:', err);
    }
  };

  const loadCards = async () => {
    try {
      const savedCards = await AsyncStorage.getItem('cards');
      if (savedCards) {
        setCards(JSON.parse(savedCards));
        console.log('Kartlar yüklendi:', JSON.parse(savedCards).length, 'kart');
      }
    } catch (error) {
      console.error('Kartlar yüklenirken hata:', error);
    } finally {
      // Mark cards as loaded to enable auto-save
      cardsLoadedRef.current = true;
    }
  };

  const saveCards = async (cardsToSave) => {
    try {
      await AsyncStorage.setItem('cards', JSON.stringify(cardsToSave));
      console.log('Kartlar kaydedildi');
    } catch (error) {
      console.error('Kartlar kaydedilirken hata:', error);
    }
  };

  const selectAndSetBackground = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Galeriden resim seçebilmek için izin gereklidir.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setBackgroundUri(result.assets[0].uri);
        await AsyncStorage.setItem('background_uri', result.assets[0].uri);
      }
    } catch (err) {
      console.error('Arka plan seçilemedi:', err);
    }
  };

  const resetBackgroundToDefault = async () => {
    try {
      await AsyncStorage.removeItem('background_uri');
      setBackgroundUri(null);
    } catch (err) {
      console.warn('Arka plan sıfırlanamadı:', err);
    }
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);
  };

  const loadPrayerTimesFromStorage = async (city, date = null) => {
    setLoadingPrayer(true);
    try {
      const cityKey = city
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i')
        .toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u');

      const data = await AsyncStorage.getItem(`prayer_times_${cityKey}`);

      if (!data) {
        // Veri yok, API'den çek
        console.log(`${city} için veri yok, API'den çekiliyor...`);
        await fetchPrayerTimes(city);
        // Tekrar yükle
        const newData = await AsyncStorage.getItem(`prayer_times_${cityKey}`);
        if (newData) {
          const dates = JSON.parse(newData);
          const targetDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
          if (dates[targetDate]) {
            const times = dates[targetDate];
            const formattedTimes = times.map((time, index) => ({
              vakit: prayerNames[index],
              saat: time
            }));
            setPrayerTimes(formattedTimes);
          }
        }
        setLoadingPrayer(false);
        return;
      }

      const dates = JSON.parse(data);
      const targetDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      if (dates[targetDate]) {
        const times = dates[targetDate];
        const formattedTimes = times.map((time, index) => ({
          vakit: prayerNames[index],
          saat: time
        }));
        setPrayerTimes(formattedTimes);
        console.log('Vakitler AsyncStorage\'den yüklendi:', cityKey, targetDate);
      } else {
        // Seçili tarihin verisi yok, API'den çek
        console.log(`${city} için ${targetDate} verisi yok, API'den çekiliyor...`);
        await fetchPrayerTimes(city);
        // Tekrar yükle
        const newData = await AsyncStorage.getItem(`prayer_times_${cityKey}`);
        if (newData) {
          const newDates = JSON.parse(newData);
          if (newDates[targetDate]) {
            const times = newDates[targetDate];
            const formattedTimes = times.map((time, index) => ({
              vakit: prayerNames[index],
              saat: time
            }));
            setPrayerTimes(formattedTimes);
          }
        }
      }
    } catch (error) {
      console.error('Storage\'dan veri yükleme hatası:', error);
    } finally {
      setLoadingPrayer(false);
    }
  };

  const fetchPrayerTimes = async (city) => {
    setLoadingPrayer(true);
    setSyncingPrayers(true);
    try {
      const cityLower = city
        .replace(/İ/g, 'i')
        .replace(/I/g, 'i')
        .toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u');

      console.log('Requesting city:', cityLower);

      const response = await fetch(`https://api.collectapi.com/pray/all?city=${cityLower}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'authorization': 'apikey 6bhifejnOZi5grqhwDdjmN:7p0k9uaapOopk9cWT3GPj9'
        }
      });

      console.log('Response status:', response.status);

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

  // fetchPrayerTimes implementation moved to src/pages/vakitHandlers

  const syncAllCities = async () => {
    setSyncingPrayers(true);
    setLoadingPrayer(true);

    try {
      let successCount = 0;
      let failCount = 0;

      Alert.alert('Eşitleme Başladı', `${cities.length} şehir için namaz vakitleri çekiliyor. Bu işlem birkaç dakika sürebilir.`);

      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        console.log(`Eşitleniyor: ${city} (${i + 1}/${cities.length})`);

        const result = await fetchPrayerTimes(city);

        if (result.success) {
          successCount++;
          if (city === selectedCity) {
            setPrayerTimes(result.data);
          }
        } else {
          failCount++;
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      Alert.alert(
        'Eşitleme Tamamlandı!',
        `Başarılı: ${successCount} şehir\nBaşarısız: ${failCount} şehir`
      );

      await loadPrayerTimesFromStorage(selectedCity);

    } catch (error) {
      console.error('Toplu eşitleme hatası:', error);
      Alert.alert('Hata', 'Eşitleme sırasında bir hata oluştu.');
    } finally {
      setSyncingPrayers(false);
      setLoadingPrayer(false);
    }
  };

  const handleCityChange = async (city) => {
    setSelectedDate(new Date()); // Tarihi bugüne sıfırla
    setSelectedCity(city);
    setShowCityDropdown(false);
    await saveCity(city);

    // Önce storage'dan yükle
    await loadPrayerTimesFromStorage(city);

    // Eğer bugünün verisi yoksa, API'den çek
    const today = new Date().toISOString().split('T')[0];
    const cityKey = city.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');

    try {
      const storedData = await AsyncStorage.getItem(`prayer_times_${cityKey}`);
      if (storedData) {
        const dates = JSON.parse(storedData);
        if (!dates[today]) {
          // Bugünün verisi yok, API'den çek
          console.log(`${city} için bugünün verisi yok, API'den çekiliyor...`);
          await fetchPrayerTimes(city);
          await loadPrayerTimesFromStorage(city);
        }
      } else {
        // Hiç veri yok, API'den çek
        console.log(`${city} için hiç veri yok, API'den çekiliyor...`);
        await fetchPrayerTimes(city);
        await loadPrayerTimesFromStorage(city);
      }
    } catch (error) {
      console.error('Şehir değiştirme hatası:', error);
    }
  };

  const getNextPrayer = () => {
    if (prayerTimes.length === 0) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < prayerTimes.length; i++) {
      const [hours, minutes] = prayerTimes[i].saat.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        const diffMinutes = prayerMinutes - currentMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const mins = Math.floor(diffMinutes % 60);
        const secs = 60 - now.getSeconds();

        return {
          name: prayerTimes[i].vakit,
          time: prayerTimes[i].saat,
          hours,
          minutes: mins,
          seconds: secs === 60 ? 0 : secs
        };
      }
    }

    if (prayerTimes[0]) {
      const [hours, minutes] = prayerTimes[0].saat.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      const tomorrowMinutes = (24 * 60) - currentMinutes + prayerMinutes;
      const h = Math.floor(tomorrowMinutes / 60);
      const m = Math.floor(tomorrowMinutes % 60);
      const s = 60 - now.getSeconds();

      return {
        name: prayerTimes[0].vakit,
        time: prayerTimes[0].saat,
        hours: h,
        minutes: m,
        seconds: s === 60 ? 0 : s
      };
    }

    return null;
  };

  // isPrayerPassed moved to src/pages/vakitHandlers

  const nextPrayer = getNextPrayer();

  // Card handlers moved to src/pages/cardsHandlers

  // exportToCSV will use cardsHandlers to generate CSV; wrapper below

  const exportToCSV = async () => {
    try {
      const csv = await exportToCSVString();
      if (!csv) {
        Alert.alert('Uyarı', 'Henüz export edilecek veri yok!');
        return;
      }

      const fileUri = documentDirectory + 'kart_kayitlari.csv';
      await writeAsStringAsync(fileUri, csv, { encoding: EncodingType.UTF8 });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Kart Kayıtlarını Paylaş'
      });

      Alert.alert('Başarılı', 'CSV dosyası oluşturuldu!');
    } catch (error) {
      console.error('CSV Export Error:', error);
      Alert.alert('Hata', 'CSV export sırasında bir hata oluştu: ' + error.message);
    }
  };

  // getCardTotal & getChartData moved to cardsHandlers / reportsHandlers

  const selectedCardData = cards.find(c => c.id === selectedCard);

  return (
    <ImageBackground
      source={backgroundUri ? { uri: backgroundUri } : require('./assets/bg_night.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Namaz Vakitleri</Text>
          <TouchableOpacity onPress={() => setMenuOpen(!menuOpen)} style={styles.menuButton}>
            <Menu color="white" size={24} />
          </TouchableOpacity>
        </View>

        {/* Menu Modal */}
        <Modal visible={menuOpen} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setMenuOpen(false)}
          >
            <View style={styles.menuContainer}>
              {[
                { key: 'Home', label: 'Ana Sayfa' },
                { key: 'Cards', label: 'Dua ve Zikir' },
                { key: 'Reports', label: 'Raporlar' },
                { key: 'Vakitler', label: 'Namaz Vakitleri' },
                { key: 'Ayarlar', label: 'Ayarlar' }
              ].map(page => (
              <TouchableOpacity
                key={page.key}
                onPress={() => navigateTo(page.key)}
                style={styles.menuItem}
              >
                <Text style={styles.menuItemText}>{page.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Home Page */}
      {currentPage === 'Home' && (
        <HomePage
          styles={styles}
          nextPrayer={nextPrayer}
          selectedCity={selectedCity}
          verseLoading={verseLoading}
          verseData={verseData}
          fetchAndSetRandomVerse={fetchAndSetRandomVerse}
          weatherLoading={weatherLoading}
          weatherData={weatherData}
          locationError={locationError}
          fetchWeatherData={fetchWeatherData}
        />
      )}

      {/* Cards Page */}
      {currentPage === 'Cards' && (
        <ScrollView style={styles.content}>
          <View style={styles.cardPageHeader}>
            <TouchableOpacity
              onPress={() => setShowTitleInput(true)}
              style={styles.newButton}
            >
              <Plus color="white" size={20} />
              <Text style={[styles.buttonText, { width: '50%' }]}>Yeni</Text>
            </TouchableOpacity>

              {/* Random verse card */}
              <View style={[styles.cardSurah, { marginTop: 16 }]}>
                {verseLoading ? (
                  <Text style={styles.loadingText}>Bismillahirrahmanirrahim...</Text>
                ) : (
                  <>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                      {verseData.surah_name} {verseData.surah_id ? `(${verseData.surah_id})` : ''}
                    </Text>
                    <Text style={{ marginTop: 8 }}> {verseData.verse_number}. Ayet</Text>
                    <Text style={{ marginTop: 10, fontSize: 16, textAlign: 'right' }}>
                      {verseData.verse_simplified}
                    </Text>
                    <Text style={{ marginTop: 10, fontStyle: 'italic' }}>{verseData.translation}</Text>
                  </>
                )}
              </View>

          {showTitleInput && (
            <View style={styles.card}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Kart başlığı (max 30 karakter)"
                  value={newTitle}
                  onChangeText={(text) => setNewTitle(text.slice(0, 30))}
                  maxLength={30}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Pozitif sayı giriniz"
                  value={newValue}
                  onChangeText={(text) => {
                    if (text === '' || parseFloat(text) > 0) setNewValue(text);
                  }}
                  keyboardType="numeric"
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={handleCreateCard}
                    style={[styles.button, styles.saveButton]}
                  >
                    <Check color="white" size={20} />
                    <Text style={styles.buttonText}>Kaydet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowTitleInput(false);
                      setNewTitle('');
                      setNewValue('');
                    }}
                    style={[styles.button, styles.cancelButton]}
                  >
                    <X color="white" size={20} />
                    <Text style={styles.buttonText}>İptal</Text>
                  </TouchableOpacity>
                </View>
                </View>
              </View>
            )}

          {cards.map(card => (
            <View key={card.id} style={styles.cardItem}>
              <View style={styles.cardItemHeader}>
                <View style={styles.cardItemLeft}>
                  <Text style={styles.cardItemTitle}>{card.title}</Text>
                  <Text style={styles.cardItemTotal}>
                    {getCardTotal(card).toFixed(2)}
                  </Text>
                  <Text style={styles.cardItemEntries}>
                    {card.entries.length} kayıt
                  </Text>
                </View>

        {/* Cards Page */}
        {currentPage === 'Cards' && (
          <ScrollView style={styles.content}>
            <View style={styles.cardPageHeader}>
              <TouchableOpacity
                onPress={() => setShowTitleInput(true)}
                style={styles.newButton}
              >
                <Plus color="white" size={20} />
                <Text style={[styles.buttonText, { width: '50%' }]}>Yeni</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={exportToCSV}
                style={[styles.exportButton, { width: '50%' }]}
              >
                <Download color="white" size={20} />
                <Text style={styles.buttonText}>Dışa Aktar</Text>
              </TouchableOpacity>
            </View>

            {showTitleInput && (
              <View style={styles.card}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Kart başlığı (max 30 karakter)"
                    value={newTitle}
                    onChangeText={(text) => setNewTitle(text.slice(0, 30))}
                    maxLength={30}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Pozitif sayı giriniz"
                    value={newValue}
                    onChangeText={(text) => {
                      if (text === '' || parseFloat(text) > 0) setNewValue(text);
                    }}
                    keyboardType="numeric"
                  />
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      onPress={handleCreateCard}
                      style={[styles.button, styles.saveButton]}
                    >
                      <Check color="white" size={20} />
                      <Text style={styles.buttonText}>Kaydet</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setShowTitleInput(false);
                        setNewTitle('');
                        setNewValue('');
                      }}
                      style={[styles.button, styles.cancelButton]}
                    >
                      <X color="white" size={20} />
                      <Text style={styles.buttonText}>İptal</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {cards.map(card => (
              <View key={card.id} style={styles.cardItem}>
                <View style={styles.cardItemHeader}>
                  <View style={styles.cardItemLeft}>
                    <Text style={styles.cardItemTitle}>{card.title}</Text>
                    <Text style={styles.cardItemTotal}>
                      {getCardTotal(card).toFixed(2)}
                    </Text>
                    <Text style={styles.cardItemEntries}>
                      {card.entries.length} kayıt
                    </Text>
                  </View>

                  <View style={styles.cardItemRight}>
                    <View style={styles.cardActionButtons}>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingCardId(card.id);
                          setEditInputType('add');
                        }}
                        style={[styles.cardActionButton, styles.addActionButton]}
                      >
                        <Plus color="white" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setEditingCardId(card.id);
                          setEditInputType('subtract');
                        }}
                        style={[styles.cardActionButton, styles.subtractActionButton]}
                      >
                        <Minus color="white" size={20} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteCard(card.id)}
                      style={styles.deleteButtonBottom}
                    >
                      <Trash2 color="#DC2626" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>

                {editingCardId === card.id && editInputType !== null && (
                  <View style={styles.editSection}>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Pozitif sayı giriniz"
                        value={editValue}
                        onChangeText={(text) => {
                          if (text === '' || parseFloat(text) > 0) setEditValue(text);
                        }}
                        keyboardType="numeric"
                      />
                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          onPress={() => handleEditValue(card.id)}
                          style={[styles.button, styles.saveButton]}
                        >
                          <Check color="white" size={20} />
                          <Text style={styles.buttonText}>Kaydet</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            setEditInputType(null);
                            setEditValue('');
                            setEditingCardId(null);
                          }}
                          style={[styles.button, styles.cancelButton]}
                        >
                          <X color="white" size={20} />
                          <Text style={styles.buttonText}>İptal</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ))}

            {cards.length === 0 && !showTitleInput && (
              <Text style={styles.emptyText}>Henüz kart eklenmemiş</Text>
            )}
          </ScrollView>
        )}

        {/* Reports Page */}
        {currentPage === 'Reports' && (
          <ScrollView style={styles.content}>
            <View style={styles.card}>
              <View style={styles.periodButtons}>
                {[
                  { key: 'weekly', label: 'Haftalık' },
                  { key: 'monthly', label: 'Aylık' },
                  { key: 'quarterly', label: '3 Aylık' },
                  { key: 'biannual', label: '6 Aylık' }
                ].map(period => (
                  <TouchableOpacity
                    key={period.key}
                    onPress={() => setChartPeriod(period.key)}
                    style={[
                      styles.periodButton,
                      chartPeriod === period.key && styles.periodButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.periodButtonText,
                      chartPeriod === period.key && styles.periodButtonTextActive
                    ]}>
                      {period.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.chartTitle}>
                {selectedChartCard ? selectedChartCard.title : 'Tüm Kayıtlar'}
              </Text>

              {cards.length > 0 && (
                <LineChart
                  data={{
                    labels: [],
                    datasets: [{ data: getChartData(selectedChartCard) }]
                  }}
                  width={Dimensions.get('window').width - 64}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                    style: { borderRadius: 16 }
                  }}
                  bezier
                  style={styles.chart}
                />
              )}
            </View>
          ))}

          {cards.length === 0 && !showTitleInput && (
            <Text style={styles.emptyText}>Henüz kart eklenmemiş</Text>
          )}
        </ScrollView>
      )}

      {/* Reports Page */}
      {currentPage === 'Reports' && (
        <ReportsPage
          styles={styles}
          cards={cards}
          chartPeriod={chartPeriod}
          setChartPeriod={setChartPeriod}
          selectedChartCard={selectedChartCard}
          setSelectedChartCard={setSelectedChartCard}
          getChartData={getChartData}
        />
      )}
      
      {/* Vakitler Page */}
      {currentPage === 'Vakitler' && (
        <VakitlerPage
          styles={styles}
          selectedCity={selectedCity}
          showCityDropdown={showCityDropdown}
          setShowCityDropdown={setShowCityDropdown}
          cities={cities}
          nextPrayer={nextPrayer}
          prayerTimes={prayerTimes}
          loadingPrayer={loadingPrayer}
          isPrayerPassed={isPrayerPassed}
          syncAllCities={syncAllCities}
          syncingPrayers={syncingPrayers}
          handleCityChange={handleCityChange}
        />
      )}
      
      {/* Ayarlar Page */}
      {currentPage === 'Ayarlar' && (
        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.settingsTitle}>Namaz Vakitleri</Text>
            <Text style={styles.settingsDescription}>
              Tüm şehirler için güncel namaz vakitlerini günceller.
            </Text>
            <TouchableOpacity
              onPress={syncAllCities}
              style={[styles.syncButtonBottom, syncingPrayers && styles.syncButtonDisabled]}
              disabled={syncingPrayers}
            >
              <Text style={styles.syncButtonText}>
                {syncingPrayers ? 'Eşitleniyor...' : 'Vakitleri Eşitle'}
              </Text>
            </TouchableOpacity>
            */}
            <View>
              <Text>  </Text>
              <Text style={{ fontSize: 12, color: '#d12608ff', fontWeight: '600', elevation: 3, opacity: 0.8, textAlign: 'center' }}>Namaz Vakti v1.0 @2025</Text>
              <Text>  </Text>
              <Text>  </Text>
            </View>
          </ScrollView>
        )}

        {/* Ayarlar Page */}
        {currentPage === 'Ayarlar' && (
          <ScrollView style={styles.content}>
            <View style={styles.card}>
              <Text style={styles.settingsTitle}>Namaz Vakitleri</Text>
              <Text style={styles.settingsDescription}>
                Tüm şehirler için güncel namaz vakitlerini günceller.
              </Text>
              <TouchableOpacity
                onPress={() => syncAllCities()}
                style={[styles.syncButton, syncingPrayers && styles.syncButtonDisabled]}
                disabled={syncingPrayers}
              >
                <Text style={styles.syncButtonText}>
                  {syncingPrayers ? 'Eşitleniyor...' : 'Vakitleri Eşitle'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.card, { marginBottom: 16 }]}>
              <Text style={styles.settingsTitle}>Arka Plan</Text>
              <Text style={styles.settingsDescription}>
                Uygulama arka planını özelleştirin
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={selectAndSetBackground}
                  style={[styles.button, styles.saveButton, { flex: 1 }]}
                >
                  <Text style={styles.buttonText}>Galeriden Seç</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={resetBackgroundToDefault}
                  style={[styles.button, styles.cancelButton, { flex: 1 }]}
                >
                  <Text style={styles.buttonText}>Sıfırla</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <Text>  </Text>
              <Text>  </Text>
              <Text>  </Text>
              <Text style={{ fontSize: 12 }}>Namaz Vakti v1.0 @2025</Text>
            </View>
          </ScrollView>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  homeContentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB'
  },
  header: {
    backgroundColor: 'transparent',
    padding: 16,
    paddingTop: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  menuButton: {
    padding: 8
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  },
  menuContainer: {
    backgroundColor: 'white',
    marginTop: 80,
    marginRight: 16,
    borderRadius: 8,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  menuItemText: {
    fontSize: 16
  },
  content: {
    flex: 1,
    padding: 16
  },
  cardPageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8
  },
  newButton: {
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    minHeight: 48
  },
  exportButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    flex: 1,
    minHeight: 48
  },
  cardItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cardItemLeft: {
    flex: 1
  },
  cardItemRight: {
    alignItems: 'flex-end',
    gap: 8
  },
  cardActionButtons: {
    flexDirection: 'row',
    gap: 8
  },
  cardActionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButtonBottom: {
    padding: 4
  },
  editSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  cardItemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  cardItemTotal: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  dropdown: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  dropdownText: {
    fontSize: 16
  },
  dropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB'
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  dropdownItemText: {
    fontSize: 16
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    opacity: 1,
    elevation: 3
  },
  cardSurah: {
    width: '100%',
    backgroundColor: '#d17a08ff',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  weatherCard: {
    width: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 150
  },
  weatherLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  weatherLoadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12
  },
  weatherErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  weatherErrorText: {
    color: 'white',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center'
  },
  weatherRetryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12
  },
  weatherRetryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  weatherInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  weatherTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12
  },
  weatherTemperature: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 8
  },
  weatherRefreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16
  },
  weatherRefreshText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  addButton: {
    padding: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputContainer: {
    gap: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8
  },
  saveButton: {
    backgroundColor: '#16A34A'
  },
  cancelButton: {
    backgroundColor: '#6B7280'
  },
  buttonText: {
    color: 'white',
    fontWeight: '600'
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8
  },
  cardTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 24
  },
  actionButton: {
    flex: 1,
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  addActionButton: {
    backgroundColor: '#16A34A'
  },
  subtractActionButton: {
    backgroundColor: '#DC2626'
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 48,
    fontSize: 16
  },
  periodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  periodButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  periodButtonActive: {
    backgroundColor: '#2563EB'
  },
  periodButtonText: {
    color: '#374151',
    fontWeight: '600'
  },
  periodButtonTextActive: {
    color: 'white'
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16
  },
  chartCardButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    minWidth: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  chartCardButtonActive: {
    backgroundColor: '#2563EB'
  },
  chartCardButtonText: {
    color: '#374151',
    fontWeight: '600'
  },
  chartCardButtonTextActive: {
    color: 'white'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937'
  },
  cityDropdownMenu: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#17191bff',
    maxHeight: 300
  },
  prayerTable: {
    width: '100%'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tableRowEven: {
    backgroundColor: '#F9FAFB'
  },
  tableCell: {
    flex: 1,
    textAlign: 'center'
  },
  tableCellText: {
    fontSize: 16,
    color: '#374151'
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    padding: 20
  },
  nextPrayerBox: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    opacity: 0.8,
    elevation: 3
  },
  nextPrayerBoxHome: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextPrayerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  nextPrayerName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4
  },
  nextPrayerTime: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12
  },
  nextPrayerCountdown: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500'
  },
  tableRowPassed: {
    backgroundColor: '#7C2D12'
  },
  tableCellTextPassed: {
    color: '#FEF2F2',
    textDecorationLine: 'line-through'
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937'
  },
  settingsDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20
  },
  syncButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12
  },
  syncButtonDisabled: {
    backgroundColor: '#9CA3AF'
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600'
  },
  settingsNote: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500'
  },
  dateNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    opacity: 0.8,
    elevation: 3
  },
  syncButtonBottom: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    marginHorizontal: 16
  }
});
