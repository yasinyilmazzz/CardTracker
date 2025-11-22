const fs = require('fs');

let content = fs.readFileSync('App.js', 'utf8');

// Find and replace Ayarlar page section
const ayarlarPattern = /{\/\* Ayarlar Page \*\/}\r?\n\s*{currentPage === 'Ayarlar' && \([\s\S]*?{\/\* End of Ayarlar Page or next section \*\/}/;

// Since we don't have an end marker, let's find it differently
const ayarlarStart = content.indexOf("{/* Ayarlar Page */}");
const ayarlarEnd = content.indexOf("</View>\n    </ImageBackground>", ayarlarStart);

if (ayarlarStart !== -1 && ayarlarEnd !== -1) {
    const beforeAyarlar = content.substring(0, ayarlarStart);
    const afterAyarlar = content.substring(ayarlarEnd);

    const newAyarlarSection = `{/* Ayarlar Page */}
      {currentPage === 'Ayarlar' && (
        <ScrollView style={styles.content}>
          <View style={[styles.card, { marginBottom: 16 }]}>
            <Text style={styles.settingsTitle}>Arka Planı Değiştir</Text>
            <Text style={styles.settingsDescription}>Uygulama arka planını galeriden seçebilirsiniz.</Text>

            <View style={{ marginTop: 12, alignItems: 'center' }}>
              {backgroundUri ? (
                <ImageBackground source={{ uri: backgroundUri }} style={{ width: '100%', height: 150, borderRadius: 8, marginBottom: 12 }} resizeMode="cover" />
              ) : (
                <View style={{ width: '100%', height: 150, borderRadius: 8, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Text style={{ color: '#6B7280' }}>Varsayılan arka plan kullanılıyor</Text>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
                <TouchableOpacity onPress={selectAndSetBackground} style={[styles.button, styles.saveButton, { flex: 1 }]}>
                  <Text style={styles.buttonText}>Arka Planı Değiştir</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetBackgroundToDefault} style={[styles.button, styles.cancelButton, { flex: 1 }]}>
                  <Text style={styles.buttonText}>Sıfırla</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.settingsTitle}>Namaz Vakitleri</Text>
            <Text style={styles.settingsDescription}>
              Seçili şehir için güncel namaz vakitlerini günceller.
            </Text>
            <TouchableOpacity
              onPress={() => syncAllCities()}
              style={[styles.syncButton, syncingPrayers && styles.syncButtonDisabled]}
              disabled={syncingPrayers}
            >
              <Text style={styles.syncButtonText}>
                {syncingPrayers ? 'Güncelleniyor...' : 'Şehir Vakitlerini Güncelle'}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text>  </Text>
            <Text>  </Text>
            <Text>  </Text>
            <Text style={{ fontSize: 12 }}>Namaz Vakti v1.0 @2025</Text>
          </View>
        </ScrollView>
      )}
      `;

    content = beforeAyarlar + newAyarlarSection + afterAyarlar;

    fs.writeFileSync('App.js', content, 'utf8');
    console.log('Ayarlar page updated successfully!');
} else {
    console.log('Could not find Ayarlar section');
}
