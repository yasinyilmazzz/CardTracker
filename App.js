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
  Platform,
  ImageBackground
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

  // Page-related handlers (moved implementations into page handler modules)
  const fetchAndSetRandomVerse = createFetchAndSetRandomVerse({ setVerseLoading, setVerseData });
  const fetchWeatherData = createFetchWeatherData({ setWeatherLoading, setWeatherData, setLocationError });

  const cardHandlers = createCardHandlers({ cards, setCards, newTitle, setNewTitle, newValue, setNewValue, setShowTitleInput, setEditingCardId, editInputType, setEditInputType, editValue, setEditValue });
  const { handleCreateCard, handleAddValue, handleEditValue, handleDeleteCard, getCardTotal, exportToCSV: exportToCSVString } = cardHandlers;

  const { getChartData } = createReportsHelpers({ cards, chartPeriod });

  const vakitHandlers = createVakitHandlers({ setLoadingPrayer, setPrayerTimes, selectedCity, setSyncingPrayers });
  const { loadPrayerTimesFromStorage, fetchPrayerTimes, syncAllCities: syncAllCitiesHandler, isPrayerPassed } = vakitHandlers;

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

  // loadPrayerTimesFromStorage implementation moved to src/pages/vakitHandlers

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
    <ImageBackground source={require('./assets/bg_night.jpg')} style={styles.backgroundImage} resizeMode="cover">
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
            {pages.map(page => (
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
        <SettingsPage styles={styles} syncAllCities={syncAllCities} syncingPrayers={syncingPrayers} />
      )}
    </View>
    </ImageBackground>
  );
}

// Styles have been moved to src/styles.js