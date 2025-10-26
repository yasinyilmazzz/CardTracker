import React, { useState, useEffect } from 'react';
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
  Platform
} from 'react-native';
import { Menu, Plus, Minus, Trash2, Download, X, Check, Edit2, Cloud } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';
import localPrayerTimes from './src/sources/prayer_times.json';
import RandomVerseFetcher, { fetchRandomVerseFunction } from './src/components/RandomVerseFetcher';

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

  const cities = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Sivas", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"];

  const prayerNames = ["İmsak", "Güneş", "Öğle", "İkindi", "Akşam", "Yatsı"];

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

  const fetchAndSetRandomVerse = async () => {
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

  const fetchWeatherData = async () => {
    try {
      setWeatherLoading(true);
      setLocationError(null);

      // Konum izni iste
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Konum izni reddedildi');
        setWeatherLoading(false);
        return;
      }

      // Mevcut konumu al
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Hava durumu API'sine istek at
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

  // Uygulama açılışında kaydedilmiş şehri yükle
  React.useEffect(() => {
    const initialize = async () => {
      await requestNotificationPermissions();
      await initializePrayerTimes();
      await loadSavedCity();
    };
    initialize();
  }, []);

  // Şehir değiştiğinde veya sayfa Vakitler'e geçtiğinde vakitleri yükle
  React.useEffect(() => {
    if (selectedCity && currentPage === 'Vakitler') {
      loadPrayerTimesFromStorage(selectedCity);
    }
  }, [selectedCity, currentPage]);

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
      } else {
        await saveCity('İstanbul');
      }
    } catch (error) {
      console.error('Şehir yüklenirken hata:', error);
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

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);
  };

  const loadPrayerTimesFromStorage = async (city) => {
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
        Alert.alert('Uyarı', 'Namaz vakitleri henüz eşitlenmemiş. Lütfen Ayarlar sayfasından "Vakitleri Eşitle" butonuna basın.');
        return;
      }

      const dates = JSON.parse(data);
      const today = new Date().toISOString().split('T')[0];

      if (dates[today]) {
        const times = dates[today];
        const formattedTimes = times.map((time, index) => ({
          vakit: prayerNames[index],
          saat: time
        }));
        setPrayerTimes(formattedTimes);
        console.log('Vakitler AsyncStorage\'den yüklendi:', cityKey, today);
      } else {
        Alert.alert('Uyarı', `${city} için bugünün vakitleri bulunamadı. Lütfen vakitleri eşitleyin.`);
      }
    } catch (error) {
      console.error('Storage\'dan veri yükleme hatası:', error);
      Alert.alert('Hata', 'Vakitler yüklenirken bir hata oluştu.');
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

        dates[today] = times;

        await AsyncStorage.setItem(`prayer_times_${cityLower}`, JSON.stringify(dates));
        console.log('Vakitler AsyncStorage\'e kaydedildi:', cityLower);

        return { success: true, data: data.result };
      } else {
        throw new Error('Namaz vakitleri alınamadı');
      }
    } catch (error) {
      console.error('Prayer Times Error:', error);
      return { success: false, error: error.message };
    }
  };

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
    setSelectedCity(city);
    setShowCityDropdown(false);
    await saveCity(city);
    loadPrayerTimesFromStorage(city);
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

  const isPrayerPassed = (prayerTime) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [hours, minutes] = prayerTime.split(':').map(Number);
    const prayerMinutes = hours * 60 + minutes;
    return prayerMinutes < currentMinutes;
  };

  const nextPrayer = getNextPrayer();

  const handleCreateCard = () => {
    if (newTitle.trim() && newValue && parseFloat(newValue) > 0) {
      const newCard = {
        id: Date.now(),
        title: newTitle.trim().slice(0, 30),
        entries: [{
          value: parseFloat(newValue),
          date: new Date().toISOString()
        }]
      };
      setCards([...cards, newCard]);
      setNewTitle('');
      setNewValue('');
      setShowTitleInput(false);
      setSelectedCard(newCard.id);
    }
  };

  const handleAddValue = () => {
    if (newValue && parseFloat(newValue) > 0) {
      const updatedCards = cards.map(card => {
        if (card.id === selectedCard) {
          return {
            ...card,
            entries: [...card.entries, {
              value: parseFloat(newValue) * (inputType === 'add' ? 1 : -1),
              date: new Date().toISOString()
            }]
          };
        }
        return card;
      });
      setCards(updatedCards);
      setNewValue('');
      setShowValueInput(false);
    }
  };

  const handleEditValue = (cardId) => {
    if (editValue && parseFloat(editValue) > 0) {
      const updatedCards = cards.map(card => {
        if (card.id === cardId) {
          return {
            ...card,
            entries: [...card.entries, {
              value: parseFloat(editValue) * (editInputType === 'add' ? 1 : -1),
              date: new Date().toISOString()
            }]
          };
        }
        return card;
      });
      setCards(updatedCards);
      setEditValue('');
      setEditInputType(null);
      setEditingCardId(null);
    }
  };

  const handleDeleteCard = (cardId) => {
    Alert.alert(
      'Kartı Sil',
      'Bu kartı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => {
            setCards(cards.filter(card => card.id !== cardId));
            if (selectedCard === cardId) {
              setSelectedCard('New');
            }
          }
        }
      ]
    );
  };

  const exportToCSV = async () => {
    try {
      if (cards.length === 0) {
        Alert.alert('Uyarı', 'Henüz export edilecek veri yok!');
        return;
      }

      let csv = '\uFEFFKart Adı,Değer,Tarih\n';
      cards.forEach(card => {
        card.entries.forEach(entry => {
          const date = new Date(entry.date).toLocaleDateString('tr-TR');
          csv += `${card.title},${entry.value},${date}\n`;
        });
      });

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

  const getCardTotal = (card) => {
    return card.entries.reduce((sum, entry) => sum + entry.value, 0);
  };

  const getChartData = (cardData = null) => {
    const now = new Date();
    const periods = {
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      biannual: 180
    };

    const days = periods[chartPeriod];
    const values = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      let total = 0;
      const cardsToProcess = cardData ? [cardData] : cards;

      cardsToProcess.forEach(card => {
        card.entries.forEach(entry => {
          const entryDate = new Date(entry.date);
          if (entryDate.toDateString() === date.toDateString()) {
            total += entry.value;
          }
        });
      });

      values.push(total);
    }

    return values;
  };

  const selectedCardData = cards.find(c => c.id === selectedCard);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kart Takip</Text>
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
            {['Home', 'Cards', 'Reports', 'Vakitler', 'Ayarlar'].map(page => (
              <TouchableOpacity
                key={page}
                onPress={() => navigateTo(page)}
                style={styles.menuItem}
              >
                <Text style={styles.menuItemText}>{page}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Home Page */}
      {currentPage === 'Home' && (
        <ScrollView style={styles.content}>
          <View style={styles.homeContentContainer}>
            {nextPrayer && (
              <View style={[styles.nextPrayerBox, { width: '100%' }]}>
                <Text style={styles.nextPrayerTitle}>{selectedCity.toUpperCase()}</Text>
                <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
                <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
                <Text style={[styles.nextPrayerCountdown, { color: '#6d1a0cff' }]}>
                  {nextPrayer.hours > 0 && `${nextPrayer.hours} saat `}
                  {nextPrayer.minutes} dakika {nextPrayer.seconds} saniye
                </Text>
              </View>
            )}
            
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

            {/* Weather card */}
            <View style={[styles.weatherCard, { marginTop: 16 }]}>
              {weatherLoading ? (
                <View style={styles.weatherLoadingContainer}>
                  <Cloud color="white" size={40} />
                  <Text style={styles.weatherLoadingText}>Hava durumu yükleniyor...</Text>
                </View>
              ) : locationError ? (
                <View style={styles.weatherErrorContainer}>
                  <Cloud color="white" size={40} />
                  <Text style={styles.weatherErrorText}>{locationError}</Text>
                  <TouchableOpacity
                    onPress={fetchWeatherData}
                    style={styles.weatherRetryButton}
                  >
                    <Text style={styles.weatherRetryText}>Tekrar Dene</Text>
                  </TouchableOpacity>
                </View>
              ) : weatherData ? (
                <View style={styles.weatherInfoContainer}>
                  <Cloud color="white" size={50} />
                  <Text style={styles.weatherTitle}>Hava Durumu</Text>
                  <Text style={styles.weatherTemperature}>
                    {weatherData.temperature.toFixed(1)}°C
                  </Text>
                </View>
              ) : (
                <View style={styles.weatherErrorContainer}>
                  <Cloud color="white" size={40} />
                  <Text style={styles.weatherErrorText}>Hava durumu verisi yüklenemedi</Text>
                  <TouchableOpacity
                    onPress={fetchWeatherData}
                    style={styles.weatherRetryButton}
                  >
                    <Text style={styles.weatherRetryText}>Tekrar Dene</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View>  
              <Text>  </Text>
              <Text>  </Text>
              <Text>  </Text>
              <Text style={{ fontSize: 12 }}>Namaz Vakti v1.0 @2025</Text>
            </View>
          </View>
        </ScrollView>
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

            <TouchableOpacity
              onPress={exportToCSV}
              style={[styles.exportButton, { width: '50%' }]}
            >
              <Download color="white" size={20} />
              <Text style={styles.buttonText}>CSV Export</Text>
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

          <View style={styles.cardGrid}>
            <TouchableOpacity
              onPress={() => setSelectedChartCard(null)}
              style={[
                styles.chartCardButton,
                selectedChartCard === null && styles.chartCardButtonActive
              ]}
            >
              <Text style={[
                styles.chartCardButtonText,
                selectedChartCard === null && styles.chartCardButtonTextActive
              ]}>
                Tümü
              </Text>
            </TouchableOpacity>
            {cards.map(card => (
              <TouchableOpacity
                key={card.id}
                onPress={() => setSelectedChartCard(card)}
                style={[
                  styles.chartCardButton,
                  selectedChartCard?.id === card.id && styles.chartCardButtonActive
                ]}
              >
                <Text style={[
                  styles.chartCardButtonText,
                  selectedChartCard?.id === card.id && styles.chartCardButtonTextActive
                ]}>
                  {card.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {cards.length === 0 && (
            <Text style={styles.emptyText}>Henüz kart eklenmemiş</Text>
          )}
        </ScrollView>
      )}
      
      {/* Vakitler Page */}
      {currentPage === 'Vakitler' && (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Şehirler</Text>

          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCityDropdown(!showCityDropdown)}
          >
            <Text style={styles.dropdownText}>{selectedCity}</Text>
          </TouchableOpacity>

          {showCityDropdown && (
            <ScrollView style={styles.cityDropdownMenu} nestedScrollEnabled>
              {cities.map(city => (
                <TouchableOpacity
                  key={city}
                  style={styles.dropdownItem}
                  onPress={() => handleCityChange(city)}
                >
                  <Text style={styles.dropdownItemText}>{city}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {nextPrayer && (
            <View style={styles.nextPrayerBox}>
              <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
              <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
              <Text style={[styles.nextPrayerCountdown, { color: '#d12608ff' }]}>
                {nextPrayer.hours > 0 && `${nextPrayer.hours} saat `}
                {nextPrayer.minutes} dakika {nextPrayer.seconds} saniye
              </Text>
            </View>
          )}

          <View style={styles.card}>
            {loadingPrayer ? (
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            ) : (
              <View style={styles.prayerTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.tableCell]}>Vakit</Text>
                  <Text style={[styles.tableHeaderText, styles.tableCell]}>Saat</Text>
                </View>
                {prayerTimes.map((time, index) => {
                  const passed = isPrayerPassed(time.saat);
                  return (
                    <View
                      key={index}
                      style={[
                        styles.tableRow,
                        index % 2 === 0 && styles.tableRowEven,
                        passed && styles.tableRowPassed
                      ]}
                    >
                      <Text style={[
                        styles.tableCellText,
                        styles.tableCell,
                        passed && styles.tableCellTextPassed
                      ]}>
                        {time.vakit}
                      </Text>
                      <Text style={[
                        styles.tableCellText,
                        styles.tableCell,
                        passed && styles.tableCellTextPassed
                      ]}>
                        {time.saat}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={syncAllCities}
            style={[styles.syncButtonBottom, syncingPrayers && styles.syncButtonDisabled]}
            disabled={syncingPrayers}
          >
            <Text style={styles.syncButtonText}>
              {syncingPrayers ? 'Eşitleniyor...' : 'Vakitleri Eşitle'}
            </Text>
          </TouchableOpacity>
          <View>
            <Text>  </Text>
            <Text>  </Text>
            <Text>  </Text>
            <Text style={{ fontSize: 12 }}>Namaz Vakti v1.0 @2025</Text>
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
             <View>
            <Text>  </Text>
            <Text>  </Text>
            <Text>  </Text>
            <Text style={{ fontSize: 12 }}>Namaz Vakti v1.0 @2025</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
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
    backgroundColor: '#2563EB',
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
  settingsNote: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500'
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