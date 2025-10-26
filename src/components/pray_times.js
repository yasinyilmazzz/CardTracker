const https = require('https');
const { MMKV } = require('react-native-mmkv');

// MMKV instance oluştur
const prayerStorage = new MMKV({
    id: 'prayer-times-storage'
});

// Şehirler listesi
const cities = ["Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya","Ardahan","Artvin","Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik","Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale","Çankırı","Çorum","Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir","Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul","İzmir","Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis","Kırıkkale","Kırklareli","Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa","Mardin","Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye","Rize","Sakarya","Samsun","Şanlıurfa","Siirt","Sinop","Sivas","Şırnak","Tekirdağ","Tokat","Trabzon","Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak"];

// Bugünün tarihini YYYY-MM-DD formatında al
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// HTTP GET request fonksiyonu
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve(parsedData);
                } catch (error) {
                    reject(new Error(`JSON parse error: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Namaz vakitlerini istenen formata dönüştür
function formatPrayerTimes(timesData) {
    const formattedData = {};

    if (!timesData || !timesData.times) {
        console.log('No times data found');
        return formattedData;
    }

    const times = timesData.times;
    
    if (typeof times === 'object' && times !== null) {
        Object.keys(times).forEach(date => {
            const dayTimes = times[date];
            
            if (Array.isArray(dayTimes) && dayTimes.length > 0) {
                // Direkt array'i al - zaten doğru sırada: [imsak, gunes, ogle, ikindi, aksam, yatsi]
                formattedData[date] = dayTimes;
                console.log(`  ✅ Added ${date}: ${dayTimes.join(', ')}`);
            } else {
                console.log(`  ❌ No valid times array found for ${date}`);
            }
        });
    } else {
        console.log('❌ Unexpected times format:', typeof times);
    }

    return formattedData;
}

// MMKV'ye veri kaydet
function saveToMMKV(data) {
    try {
        prayerStorage.set('prayer_times', JSON.stringify(data));
        prayerStorage.set('last_sync_date', new Date().toISOString());
        console.log('✅ Data successfully saved to MMKV');
        return true;
    } catch (error) {
        console.error('❌ MMKV save error:', error);
        throw error;
    }
}

// MMKV'den veri oku
function readFromMMKV() {
    try {
        const data = prayerStorage.getString('prayer_times');
        const lastSync = prayerStorage.getString('last_sync_date');
        
        if (data) {
            console.log('✅ Data loaded from MMKV');
            console.log(`📅 Last sync: ${lastSync}`);
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error('❌ MMKV read error:', error);
        return null;
    }
}

// Şehir bazlı MMKV kaydetme (opsiyonel - daha güvenli)
function saveToMMKVByCity(data) {
    try {
        Object.keys(data).forEach(city => {
            prayerStorage.set(`prayer_${city}`, JSON.stringify(data[city]));
        });
        
        // Şehir listesini de kaydet
        prayerStorage.set('prayer_cities', JSON.stringify(Object.keys(data)));
        prayerStorage.set('last_sync_date', new Date().toISOString());
        
        console.log('✅ All cities saved to MMKV separately');
        return true;
    } catch (error) {
        console.error('❌ MMKV city save error:', error);
        throw error;
    }
}

// Şehir bazlı MMKV'den okuma
function readFromMMKVByCity() {
    try {
        const citiesJson = prayerStorage.getString('prayer_cities');
        if (!citiesJson) return null;

        const cities = JSON.parse(citiesJson);
        const results = {};

        cities.forEach(city => {
            const cityData = prayerStorage.getString(`prayer_${city}`);
            if (cityData) {
                results[city] = JSON.parse(cityData);
            }
        });

        console.log('✅ Data loaded from MMKV by city');
        return results;
    } catch (error) {
        console.error('❌ MMKV city read error:', error);
        return null;
    }
}

// Ana işlem fonksiyonu
async function getPrayerTimes() {
    const dateToday = getTodayDate();
    const results = {};

    try {
        for (const city of cities) {
            console.log(`\n=== Processing ${city} ===`);

            // İlk request: Şehir ID'sini al
            const searchUrl = `https://vakit.vercel.app/api/searchPlaces?q=${encodeURIComponent(city)}`;
            console.log(`Search URL: ${searchUrl}`);
            
            const searchResults = await makeRequest(searchUrl);

            if (!searchResults || searchResults.length === 0) {
                console.log(`No results found for ${city}`);
                continue;
            }

            // İlk sonucun ID'sini al
            const cityId = searchResults[0].id;
            console.log(`Found ID for ${city}: ${cityId}`);

            // İkinci request: Namaz vakitlerini al
            const timesUrl = `https://vakit.vercel.app/api/timesForPlace?id=${cityId}&date=${dateToday}&days=30&timezoneOffset=180`;
            console.log(`Times URL: ${timesUrl}`);
            
            const timesData = await makeRequest(timesUrl);

            if (!timesData) {
                console.log(`No times data found for ${city}`);
                continue;
            }

            // Veriyi istenen formata dönüştür
            console.log(`Formatting prayer times for ${city}...`);
            const formattedTimes = formatPrayerTimes(timesData);
            
            // Şehir adını küçük harf yap ve sonuçlara ekle
            const cityKey = city.toLowerCase();
            results[cityKey] = formattedTimes;
            
            console.log(`✅ Successfully processed ${city}`);
            console.log(`   Days: ${Object.keys(formattedTimes).length}`);
            
            if (Object.keys(formattedTimes).length > 0) {
                const firstDates = Object.keys(formattedTimes).slice(0, 3);
                firstDates.forEach(date => {
                    console.log(`   ${date}: [${formattedTimes[date].join(', ')}]`);
                });
            } else {
                console.log(`   ⚠️  No days with valid data found for ${city}`);
            }
        }

        // MMKV'ye kaydet (tüm veriyi tek seferde)
        saveToMMKV(results);
        
        // VEYA şehir bazlı kaydet (daha güvenli)
        // saveToMMKVByCity(results);
        
        console.log(`\n🎉 Data successfully saved to MMKV`);
        console.log(`📊 Total cities processed: ${Object.keys(results).length}`);
        
        // Toplam gün sayısını göster
        let totalDays = 0;
        Object.keys(results).forEach(city => {
            const days = Object.keys(results[city]).length;
            totalDays += days;
            console.log(`   ${city}: ${days} days`);
        });
        console.log(`📅 Total days: ${totalDays}`);

        return results;

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        throw error;
    }
}

// Cache'den okuma fonksiyonu
function getCachedPrayerTimes() {
    return readFromMMKV();
    // VEYA şehir bazlı okuma için:
    // return readFromMMKVByCity();
}

// Sync durumunu kontrol et
function getSyncStatus() {
    const lastSync = prayerStorage.getString('last_sync_date');
    const hasData = prayerStorage.contains('prayer_times');
    
    return {
        hasData,
        lastSync: lastSync || 'Never',
        citiesCount: hasData ? Object.keys(JSON.parse(prayerStorage.getString('prayer_times'))).length : 0
    };
}

// Cache'i temizle
function clearCache() {
    try {
        prayerStorage.clearAll();
        console.log('✅ MMKV cache cleared');
        return true;
    } catch (error) {
        console.error('❌ Clear cache error:', error);
        throw error;
    }
}

// Programı çalıştır
getPrayerTimes()
    .then((data) => {
        console.log('\n✅ Process completed successfully!');
        
        // Sync durumunu göster
        const status = getSyncStatus();
        console.log(`\n📊 Sync Status:`);
        console.log(`   Has Data: ${status.hasData}`);
        console.log(`   Last Sync: ${status.lastSync}`);
        console.log(`   Cities Count: ${status.citiesCount}`);
        
        // Örnek çıktıyı göster
        const sampleCity = Object.keys(data)[0];
        if (sampleCity && Object.keys(data[sampleCity]).length > 0) {
            const sampleDates = Object.keys(data[sampleCity]);
            console.log(`\n📋 Sample output for ${sampleCity}:`);
            const firstDate = sampleDates[0];
            const lastDate = sampleDates[sampleDates.length - 1];
            console.log(`   First date: ${firstDate} → [${data[sampleCity][firstDate].join(', ')}]`);
            console.log(`   Last date: ${lastDate} → [${data[sampleCity][lastDate].join(', ')}]`);
            console.log(`   Total days: ${sampleDates.length}`);
        } else {
            console.log('\n⚠️  No valid data found in any city');
        }
    })
    .catch((error) => {
        console.error('💥 Process failed:', error);
    });

// Diğer modüllerden kullanım için export
module.exports = {
    getPrayerTimes,
    getCachedPrayerTimes,
    getSyncStatus,
    clearCache,
    saveToMMKV,
    readFromMMKV
};