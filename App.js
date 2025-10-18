import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Modal,
  Dimensions,
  Alert
} from 'react-native';
import { Menu, Plus, Minus, Trash2, Download, X, Check } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { documentDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

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

  const cities = ["Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan","Artvin","Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale","Çankırı","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul","İzmir","Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis","Kırıkkale","Kırklareli","Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye","Rize","Sakarya","Samsun","Şanlıurfa","Siirt","Sinop","Sivas","Şırnak","Tekirdağ","Tokat","Trabzon","Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak"];

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);
    if (page === 'Vakitler') {
      fetchPrayerTimes(selectedCity);
    }
  };

  const fetchPrayerTimes = async (city) => {
    setLoadingPrayer(true);
    try {
      const cityLower = city.toLowerCase()
        .replace('ç', 'c')
        .replace('ğ', 'g')
        .replace('ı', 'i')
        .replace('ö', 'o')
        .replace('ş', 's')
        .replace('ü', 'u');
      
      const response = await fetch(`https://api.collectapi.com/pray/all?city=${cityLower}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'authorization': 'apikey 6bhifejnOZi5grqhwDdjmN:7p0k9uaapOopk9cWT3GPj9'
        }
      });
      
      if (!response.ok) {
        Alert.alert('API Hatası', `HTTP ${response.status}: API key geçersiz veya süresi dolmuş olabilir.`);
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.result && data.result.length > 0) {
        setPrayerTimes(data.result);
      } else {
        Alert.alert('Hata', 'Namaz vakitleri alınamadı');
      }
    } catch (error) {
      console.error('Prayer Times Error:', error);
      Alert.alert('Hata', 'Namaz vakitleri alınırken bir hata oluştu: ' + error.message);
    } finally {
      setLoadingPrayer(false);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
    fetchPrayerTimes(city);
  };

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
      setShowValueInput(false);
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
            {['Home', 'Cards', 'Reports', 'Vakitler'].map(page => (
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
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.dropdownText}>
              {selectedCard === 'New' ? 'New' : selectedCardData?.title}
            </Text>
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedCard('New');
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>New</Text>
              </TouchableOpacity>
              {cards.map(card => (
                <TouchableOpacity
                  key={card.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCard(card.id);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{card.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.card}>
            {selectedCard === 'New' ? (
              <View>
                {!showTitleInput ? (
                  <TouchableOpacity
                    onPress={() => setShowTitleInput(true)}
                    style={styles.addButton}
                  >
                    <Plus color="#9CA3AF" size={48} />
                  </TouchableOpacity>
                ) : (
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
                )}
              </View>
            ) : selectedCardData ? (
              <View>
                <Text style={styles.cardTitle}>{selectedCardData.title}</Text>
                <Text style={styles.cardTotal}>
                  {getCardTotal(selectedCardData).toFixed(2)}
                </Text>
                
                {!showValueInput ? (
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setInputType('add');
                        setShowValueInput(true);
                      }}
                      style={[styles.actionButton, styles.addActionButton]}
                    >
                      <Plus color="white" size={32} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setInputType('subtract');
                        setShowValueInput(true);
                      }}
                      style={[styles.actionButton, styles.subtractActionButton]}
                    >
                      <Minus color="white" size={32} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.inputContainer}>
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
                        onPress={handleAddValue}
                        style={[styles.button, styles.saveButton]}
                      >
                        <Check color="white" size={20} />
                        <Text style={styles.buttonText}>Kaydet</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setShowValueInput(false);
                          setNewValue('');
                        }}
                        style={[styles.button, styles.cancelButton]}
                      >
                        <X color="white" size={20} />
                        <Text style={styles.buttonText}>İptal</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ) : null}
          </View>
        </ScrollView>
      )}

      {/* Cards Page */}
      {currentPage === 'Cards' && (
        <ScrollView style={styles.content}>
          <TouchableOpacity
            onPress={exportToCSV}
            style={styles.exportButton}
          >
            <Download color="white" size={20} />
            <Text style={styles.buttonText}>CSV Export</Text>
          </TouchableOpacity>
          
          {cards.map(card => (
            <View key={card.id} style={styles.cardItem}>
              <TouchableOpacity
                onPress={() => handleDeleteCard(card.id)}
                style={styles.deleteButton}
              >
                <Trash2 color="#DC2626" size={20} />
              </TouchableOpacity>
              <Text style={styles.cardItemTitle}>{card.title}</Text>
              <Text style={styles.cardItemTotal}>
                {getCardTotal(card).toFixed(2)}
              </Text>
              <Text style={styles.cardItemEntries}>
                {card.entries.length} kayıt
              </Text>
            </View>
          ))}
          
          {cards.length === 0 && (
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

          <View style={styles.card}>
            {loadingPrayer ? (
              <Text style={styles.loadingText}>Yükleniyor...</Text>
            ) : (
              <View style={styles.prayerTable}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, styles.tableCell]}>Vakit</Text>
                  <Text style={[styles.tableHeaderText, styles.tableCell]}>Saat</Text>
                </View>
                {prayerTimes.map((time, index) => (
                  <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
                    <Text style={[styles.tableCellText, styles.tableCell]}>{time.vakit}</Text>
                    <Text style={[styles.tableCellText, styles.tableCell]}>{time.saat}</Text>
                  </View>
                ))}
              </View>
            )}
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
  exportButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8
  },
  cardItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative'
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8
  },
  cardItemTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    paddingRight: 40
  },
  cardItemTotal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563EB'
  },
  cardItemEntries: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8
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
    borderColor: '#D1D5DB',
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
  }
});