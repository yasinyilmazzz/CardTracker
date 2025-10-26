import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

export default function SettingsPage(props) {
  const { styles, syncAllCities, syncingPrayers } = props;

  return (
    <ScrollView style={styles.content}>
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
