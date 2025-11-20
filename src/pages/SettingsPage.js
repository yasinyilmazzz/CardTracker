import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';

export default function SettingsPage(props) {
  const { styles, syncAllCities, syncingPrayers, backgroundUri, selectBackground, resetBackground } = props;

  return (
    <ScrollView style={styles.content}>
      <View style={[styles.card, { marginBottom: 16 }]}>
        <Text style={styles.settingsTitle}>Arka Planı Değiştir</Text>
        <Text style={styles.settingsDescription}>Uygulama arka planını galeriden seçebilirsiniz.</Text>

        <View style={{ marginTop: 12, alignItems: 'center' }}>
          {backgroundUri ? (
            <Image source={{ uri: backgroundUri }} style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 12 }} resizeMode="cover" />
          ) : (
            <View style={{ width: '100%', height: 150, borderRadius: 8, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#6B7280' }}>Varsayılan arka plan kullanılıyor</Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
            <TouchableOpacity onPress={selectBackground} style={[styles.button, styles.saveButton, { flex: 1 }]}>
              <Text style={styles.buttonText}>Arka Planı Değiştir</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetBackground} style={[styles.button, styles.cancelButton, { flex: 1 }]}>
              <Text style={styles.buttonText}>Sıfırla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.settingsTitle}>Namaz Vakitleri</Text>
        <Text style={styles.settingsDescription}>Tüm şehirler için güncel namaz vakitlerini günceller.</Text>
        <TouchableOpacity onPress={() => syncAllCities()} style={[styles.syncButton, syncingPrayers && styles.syncButtonDisabled]} disabled={syncingPrayers}>
          <Text style={styles.syncButtonText}>{syncingPrayers ? 'Eşitleniyor...' : 'Vakitleri Eşitle'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
