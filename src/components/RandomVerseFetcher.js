import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Button } from 'react-native';

const RandomVerseFetcher = () => {
  const [surahName, setSurahName] = useState('');
  const [surahId, setSurahId] = useState('');
  const [verseNumber, setVerseNumber] = useState('');
  const [verseSimplified, setVerseSimplified] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRandomVerse = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 1-114 arası random surah ID'si
      const randomSurahId = Math.floor(Math.random() * 114) + 1;
      console.log('Seçilen Rastgele Sure ID:', randomSurahId);
      const response = await fetch(`https://api.acikkuran.com/surah/${randomSurahId}?author=11`);
      
      if (!response.ok) {
        throw new Error('API isteği başarısız');
      }
      
      const data = await response.json();

      // Defensive extraction of verses (API may return different shapes on errors)
      const extractVerses = (obj) => {
        if (!obj) return null;
        if (Array.isArray(obj.verses)) return obj.verses;
        // sometimes API returns { data: { verses: [...] } }
        if (obj.data && Array.isArray(obj.data.verses)) return obj.data.verses;
        // fallback: find first array-like property that looks like verses
        for (const k of Object.keys(obj)) {
          if (Array.isArray(obj[k]) && obj[k].length > 0 && typeof obj[k][0] === 'object') {
            // basic heuristic: check for verse_number or surah_id keys
            if ('verse_number' in obj[k][0] || 'surah_id' in obj[k][0]) return obj[k];
          }
        }
        return null;
      };

      const verses = extractVerses(data);
      if (!verses || !Array.isArray(verses) || verses.length === 0) {
        console.error('Unexpected API response for surah:', JSON.stringify(data));
        throw new Error('API yanıtında ayet dizisi bulunamadı');
      }

      // data.name değerini surah_name değişkenine bağlama (try multiple locations)
      const surah_name = data.name || (data.data && data.data.name) || '';
      setSurahName(surah_name);

      const versesCount = verses.length;
      const randomVerseIndex = Math.floor(Math.random() * versesCount);
      const randomVerse = verses[randomVerseIndex];

      // Değişkenlere bağlama (guard for nested translation)
      setSurahId(randomVerse.surah_id ?? randomVerse.surah ?? '');
      setVerseNumber(randomVerse.verse_number ?? randomVerse.verse ?? '');
      setVerseSimplified(randomVerse.verse_simplified ?? randomVerse.text ?? '');
      setTranslation((randomVerse.translation && (randomVerse.translation.text || randomVerse.translation)) || randomVerse.translation || '');
      
    } catch (err) {
      setError(err.message);
      console.error('Hata:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fonksiyon versiyonu (başka component'larda kullanmak için)
  const getRandomVerse = async () => {
    try {
      // 1-114 arası random surah ID'si
      const randomSurahId = Math.floor(Math.random() * 114) + 1;
      
      const response = await fetch(`https://api.acikkuran.com/surah/${randomSurahId}?author=11`);
      
      if (!response.ok) {
        throw new Error('API isteği başarısız');
      }
      
      const data = await response.json();

      // reuse defensive extractor
      const extractVerses = (obj) => {
        if (!obj) return null;
        if (Array.isArray(obj.verses)) return obj.verses;
        if (obj.data && Array.isArray(obj.data.verses)) return obj.data.verses;
        for (const k of Object.keys(obj)) {
          if (Array.isArray(obj[k]) && obj[k].length > 0 && typeof obj[k][0] === 'object') {
            if ('verse_number' in obj[k][0] || 'surah_id' in obj[k][0]) return obj[k];
          }
        }
        return null;
      };

      const verses = extractVerses(data);
      if (!verses || !Array.isArray(verses) || verses.length === 0) {
        console.error('Unexpected API response for surah (getRandomVerse):', JSON.stringify(data));
        throw new Error('API yanıtında ayet dizisi bulunamadı');
      }

      const surahName = data.name || (data.data && data.data.name) || '';
      const randomVerse = verses[Math.floor(Math.random() * verses.length)];

      return {
        surah_name: surahName,
        surah_id: randomVerse.surah_id ?? randomVerse.surah ?? '',
        verse_number: randomVerse.verse_number ?? randomVerse.verse ?? '',
        verse_simplified: randomVerse.verse_simplified ?? randomVerse.text ?? '',
        translation: (randomVerse.translation && (randomVerse.translation.text || randomVerse.translation)) || randomVerse.translation || ''
      };
      
    } catch (err) {
      console.error('Hata:', err);
      throw err;
    }
  };

  // Component ilk yüklendiğinde bir ayet getir
  useEffect(() => {
    fetchRandomVerse();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Ayet yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Button title="Rastgele Ayet Getir" onPress={fetchRandomVerse} />
      
      {error ? (
        <Text style={{ color: 'red', marginTop: 10 }}>Hata: {error}</Text>
      ) : (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{surahName}</Text>
          <Text style={{ marginTop: 10 }}>Sure ID: {surahId}</Text>
          <Text>Ayet Numarası: {verseNumber}</Text>
          <Text style={{ marginTop: 10, fontSize: 16, textAlign: 'right' }}>
            {verseSimplified}
          </Text>
          <Text style={{ marginTop: 10, fontStyle: 'italic' }}>
            {translation}
          </Text>
        </View>
      )}
    </View>
  );
};

export default RandomVerseFetcher;

// Sadece fonksiyon olarak kullanmak isterseniz:
export const fetchRandomVerseFunction = async () => {
  try {
    // 1-114 arası random surah ID'si
    const randomSurahId = Math.floor(Math.random() * 114) + 1;
    
    const response = await fetch(`https://api.acikkuran.com/surah/${randomSurahId}?author=11`);
    
    if (!response.ok) {
      throw new Error('API isteği başarısız');
    }
    
    const data = await response.json();

    const extractVerses = (obj) => {
      if (!obj) return null;
      if (Array.isArray(obj.verses)) return obj.verses;
      if (obj.data && Array.isArray(obj.data.verses)) return obj.data.verses;
      for (const k of Object.keys(obj)) {
        if (Array.isArray(obj[k]) && obj[k].length > 0 && typeof obj[k][0] === 'object') {
          if ('verse_number' in obj[k][0] || 'surah_id' in obj[k][0]) return obj[k];
        }
      }
      return null;
    };

    const verses = extractVerses(data);
    if (!verses || !Array.isArray(verses) || verses.length === 0) {
      console.error('Unexpected API response for surah (fetchRandomVerseFunction):', JSON.stringify(data));
      throw new Error('API yanıtında ayet dizisi bulunamadı');
    }

    const surahName = data.name || (data.data && data.data.name) || '';
    const randomVerse = verses[Math.floor(Math.random() * verses.length)];

    return {
      surah_name: surahName,
      surah_id: randomVerse.surah_id ?? randomVerse.surah ?? '',
      verse_number: randomVerse.verse_number ?? randomVerse.verse ?? '',
      verse_simplified: randomVerse.verse_simplified ?? randomVerse.text ?? '',
      translation: (randomVerse.translation && (randomVerse.translation.text || randomVerse.translation)) || randomVerse.translation || ''
    };
    
  } catch (err) {
    console.error('Hata:', err);
    throw err;
  }
};