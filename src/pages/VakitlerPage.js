import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';

export default function VakitlerPage(props) {
  const { styles, selectedCity, showCityDropdown, setShowCityDropdown, cities, nextPrayer, prayerTimes, loadingPrayer, isPrayerPassed, syncAllCities, syncingPrayers, handleCityChange } = props;

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Şehirler</Text>

      <TouchableOpacity style={styles.dropdown} onPress={() => setShowCityDropdown(!showCityDropdown)}>
        <Text style={styles.dropdownText}>{selectedCity}</Text>
      </TouchableOpacity>

      {showCityDropdown && (
        <ScrollView style={styles.cityDropdownMenu} nestedScrollEnabled>
          {cities.map(city => (
            <TouchableOpacity key={city} style={styles.dropdownItem} onPress={() => handleCityChange(city)}>
              <Text style={styles.dropdownItemText}>{city}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {nextPrayer && (
        <View style={styles.nextPrayerBox}>
          <Text style={styles.nextPrayerTitle}>Yaklaşan Vakit</Text>
          <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
          <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>
          <Text style={styles.nextPrayerCountdown}>{nextPrayer.hours > 0 && `${nextPrayer.hours} saat `}{nextPrayer.minutes} dakika {nextPrayer.seconds} saniye</Text>
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
                <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven, passed && styles.tableRowPassed]}>
                  <Text style={[styles.tableCellText, styles.tableCell, passed && styles.tableCellTextPassed]}>{time.vakit}</Text>
                  <Text style={[styles.tableCellText, styles.tableCell, passed && styles.tableCellTextPassed]}>{time.saat}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      <TouchableOpacity onPress={syncAllCities} style={[styles.syncButtonBottom, syncingPrayers && styles.syncButtonDisabled]} disabled={syncingPrayers}>
        <Text style={styles.syncButtonText}>{syncingPrayers ? 'Eşitleniyor...' : 'Vakitleri Eşitle'}</Text>
      </TouchableOpacity>

         <View>
            <Text>  </Text>
            <Text>  </Text>
            <Text>  </Text>
            <Text style={{ fontSize: 12 }}>Namaz Vakti v1.0 @2025</Text>
          </View>
    </ScrollView>
  );
}
