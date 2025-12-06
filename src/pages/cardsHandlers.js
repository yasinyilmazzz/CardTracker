export function createCardHandlers({ cards, setCards, newTitle, setNewTitle, newValue, setNewValue, setShowTitleInput, setEditingCardId, editInputType, setEditInputType, editValue, setEditValue }) {
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
    }
  };

  const handleAddValue = (selectedCard) => {
    if (newValue && parseFloat(newValue) > 0) {
      const updatedCards = cards.map(card => {
        if (card.id === selectedCard) {
          return {
            ...card,
            entries: [...card.entries, {
              value: parseFloat(newValue) * (editInputType === 'add' ? 1 : -1),
              date: new Date().toISOString()
            }]
          };
        }
        return card;
      });
      setCards(updatedCards);
      setNewValue('');
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
    const filtered = cards.filter(card => card.id !== cardId);
    setCards(filtered);
  };

  const getCardTotal = (card) => {
    return card.entries.reduce((sum, entry) => sum + entry.value, 0);
  };

  const exportToCSV = async () => {
    try {
      if (cards.length === 0) {
        alert('Henüz export edilecek veri yok!');
        return;
      }

      let csv = '\uFEFFKart Adı,Değer,Tarih\n';
      cards.forEach(card => {
        card.entries.forEach(entry => {
          const date = new Date(entry.date).toLocaleDateString('tr-TR');
          csv += `${card.title},${entry.value},${date}\n`;
        });
      });

      // Use Expo FileSystem & Sharing in App.js context; here we just return the CSV string
      return csv;
    } catch (error) {
      console.error('CSV Export Error:', error);
      throw error;
    }
  };

  return {
    handleCreateCard,
    handleAddValue,
    handleEditValue,
    handleDeleteCard,
    getCardTotal,
    exportToCSV
  };
}
