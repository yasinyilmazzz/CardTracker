import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Plus, Download, Check, X, Minus, Trash2 } from 'lucide-react-native';

export default function CardsPage(props) {
  const {
    styles,
    cards,
    showTitleInput,
    setShowTitleInput,
    newTitle,
    setNewTitle,
    newValue,
    setNewValue,
    handleCreateCard,
    exportToCSV,
    editingCardId,
    editInputType,
    setEditingCardId,
    setEditInputType,
    editValue,
    setEditValue,
    handleEditValue,
    handleDeleteCard,
    getCardTotal
  } = props;

  return (
    <ScrollView style={styles.content}>
      <View style={styles.cardPageHeader}>
        <TouchableOpacity onPress={() => setShowTitleInput(true)} style={styles.newButton}>
          <Plus color="white" size={20} />
          <Text style={[styles.buttonText, { width: '50%' }]}>Yeni</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={exportToCSV} style={[styles.exportButton, { width: '50%' }]}>
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
              <TouchableOpacity onPress={handleCreateCard} style={[styles.button, styles.saveButton]}>
                <Check color="white" size={20} />
                <Text style={styles.buttonText}>Kaydet</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setShowTitleInput(false); setNewTitle(''); setNewValue(''); }} style={[styles.button, styles.cancelButton]}>
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
              <Text style={styles.cardItemTotal}>{getCardTotal(card).toFixed(2)}</Text>
              <Text style={styles.cardItemEntries}>{card.entries.length} kayıt</Text>
            </View>

            <View style={styles.cardItemRight}>
              <View style={styles.cardActionButtons}>
                <TouchableOpacity onPress={() => { setEditingCardId(card.id); setEditInputType('add'); }} style={[styles.cardActionButton, styles.addActionButton]}>
                  <Plus color="white" size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setEditingCardId(card.id); setEditInputType('subtract'); }} style={[styles.cardActionButton, styles.subtractActionButton]}>
                  <Minus color="white" size={20} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => handleDeleteCard(card.id)} style={styles.deleteButtonBottom}>
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
                  onChangeText={(text) => { if (text === '' || parseFloat(text) > 0) setEditValue(text); }}
                  keyboardType="numeric"
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity onPress={() => handleEditValue(card.id)} style={[styles.button, styles.saveButton]}>
                    <Check color="white" size={20} />
                    <Text style={styles.buttonText}>Kaydet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setEditInputType(null); setEditValue(''); setEditingCardId(null); }} style={[styles.button, styles.cancelButton]}>
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
  );
}
