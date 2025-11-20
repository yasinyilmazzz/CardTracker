import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Cloud } from 'lucide-react-native';

export default function HomePage(props) {
  const {
    styles,
    nextPrayer,
    selectedCity,
    verseLoading,
    verseData,
    fetchAndSetRandomVerse,
    weatherLoading,
    weatherData,
    locationError,
    fetchWeatherData
  } = props;

  return (
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

{/*               <TouchableOpacity
                onPress={fetchAndSetRandomVerse}
                style={[styles.syncButton, { marginTop: 12 }]}
              >
                <Text style={styles.syncButtonText}>Yeni Ayet Getir</Text>
              </TouchableOpacity> */}
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
              <TouchableOpacity onPress={fetchWeatherData} style={styles.weatherRetryButton}>
                <Text style={styles.weatherRetryText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : weatherData ? (
            <View style={styles.weatherInfoContainer}>
              <Cloud color="white" size={50} />
              <Text style={styles.weatherTitle}>Hava Durumu</Text>
              <Text style={styles.weatherTemperature}>{weatherData.temperature.toFixed(1)}°C</Text>
            </View>
          ) : (
            <View style={styles.weatherErrorContainer}>
              <Cloud color="white" size={40} />
              <Text style={styles.weatherErrorText}>Hava durumu verisi yüklenemedi</Text>
              <TouchableOpacity onPress={fetchWeatherData} style={styles.weatherRetryButton}>
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
  );
}
