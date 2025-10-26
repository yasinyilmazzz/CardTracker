import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
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
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%'
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

export default styles;
