import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function ReportsPage(props) {
  const { styles, cards, chartPeriod, setChartPeriod, selectedChartCard, setSelectedChartCard, getChartData } = props;

  return (
    <ScrollView style={styles.content}>
      <View style={styles.card}>
        <View style={styles.periodButtons}>
          {[{ key: 'weekly', label: 'Haftalık' }, { key: 'monthly', label: 'Aylık' }, { key: 'quarterly', label: '3 Aylık' }, { key: 'biannual', label: '6 Aylık' }].map(period => (
            <TouchableOpacity key={period.key} onPress={() => setChartPeriod(period.key)} style={[styles.periodButton, chartPeriod === period.key && styles.periodButtonActive]}>
              <Text style={[styles.periodButtonText, chartPeriod === period.key && styles.periodButtonTextActive]}>{period.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.chartTitle}>{selectedChartCard ? selectedChartCard.title : 'Tüm Kayıtlar'}</Text>

        {cards.length > 0 && (
          <LineChart
            data={{ labels: [], datasets: [{ data: getChartData(selectedChartCard) }] }}
            width={Math.max(300,  Dimensions.get('window').width - 64)}
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
        <TouchableOpacity onPress={() => setSelectedChartCard(null)} style={[styles.chartCardButton, selectedChartCard === null && styles.chartCardButtonActive]}>
          <Text style={[styles.chartCardButtonText, selectedChartCard === null && styles.chartCardButtonTextActive]}>Tümü</Text>
        </TouchableOpacity>
        {cards.map(card => (
          <TouchableOpacity key={card.id} onPress={() => setSelectedChartCard(card)} style={[styles.chartCardButton, selectedChartCard?.id === card.id && styles.chartCardButtonActive]}>
            <Text style={[styles.chartCardButtonText, selectedChartCard?.id === card.id && styles.chartCardButtonTextActive]}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {cards.length === 0 && (
        <Text style={styles.emptyText}>Henüz kart eklenmemiş</Text>
      )}
    </ScrollView>
  );
}
