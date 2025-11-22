const fs = require('fs');

let content = fs.readFileSync('App.js', 'utf8');

// 1. Add ImageBackground to imports
content = content.replace(
    /Platform\r?\n\} from 'react-native';/,
    `Platform,\n  ImageBackground\n} from 'react-native';`
);

// 2. Add expo-image-picker import after expo-location
content = content.replace(
    /import \* as Location from 'expo-location';/,
    `import * as Location from 'expo-location';\nimport * as ImagePicker from 'expo-image-picker';`
);

// 3. Add backgroundUri state after locationError
const statePattern = /const \[locationError, setLocationError\] = useState\(null\);/;
content = content.replace(
    statePattern,
    `const [locationError, setLocationError] = useState(null);\n  const [backgroundUri, setBackgroundUri] = useState(null);`
);

// 4. Add background functions before navigateTo
const navigateToPattern = /const navigateTo = \(page\) => \{/;
const backgroundFunctions = `
  const loadSavedBackground = async () => {
    try {
      const uri = await AsyncStorage.getItem('background_uri');
      if (uri) {
        setBackgroundUri(uri);
      }
    } catch (err) {
      console.warn('Arka plan yüklenemedi:', err);
    }
  };

  const selectAndSetBackground = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin gerekli', 'Galeriden resim seçebilmek için izin gereklidir.');
        return;
      }

      const mediaTypesOption = (ImagePicker.MediaType && ImagePicker.MediaType.Images)
        || (ImagePicker.MediaTypeOptions && ImagePicker.MediaTypeOptions.Images);

      const pickerOptions = {
        allowsEditing: true,
        quality: 0.8,
      };

      if (mediaTypesOption) pickerOptions.mediaTypes = mediaTypesOption;

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);

      let uri;
      if (typeof result.cancelled !== 'undefined') {
        if (!result.cancelled && result.uri) uri = result.uri;
      } else if (typeof result.canceled !== 'undefined') {
        if (!result.canceled && Array.isArray(result.assets) && result.assets[0] && result.assets[0].uri) {
          uri = result.assets[0].uri;
        }
      }

      if (uri) {
        setBackgroundUri(uri);
        await AsyncStorage.setItem('background_uri', uri);
      }
    } catch (err) {
      console.error('Arka plan seçilemedi:', err);
      Alert.alert('Hata', 'Arka plan seçilirken bir hata oluştu.');
    }
  };

  const resetBackgroundToDefault = async () => {
    try {
      await AsyncStorage.removeItem('background_uri');
      setBackgroundUri(null);
    } catch (err) {
      console.warn('Arka plan sıfırlanamadı:', err);
    }
  };

  `;

content = content.replace(navigateToPattern, backgroundFunctions + 'const navigateTo = (page) => {');

// 5. Add loadSavedBackground to initialize function
content = content.replace(
    /await loadSavedCity\(\);\r?\n\s*\/\/ Mark initial load/,
    `await loadSavedCity();\n      await loadSavedBackground();\n      // Mark initial load`
);

// 6. Wrap return statement with ImageBackground
const returnPattern = /return \(\r?\n\s*<View style=\{styles\.container\}>/;
content = content.replace(
    returnPattern,
    `return (\n    <ImageBackground source={backgroundUri ? { uri: backgroundUri } : require('./assets/bg_night.jpg')} style={styles.backgroundImage} resizeMode="cover">\n      <View style={styles.container}>`
);

// 7. Close ImageBackground before final closing
const finalPattern = /\s*<\/View>\r?\n\s*\);\r?\n\}/;
content = content.replace(
    finalPattern,
    `    </View>\n    </ImageBackground>\n  );\n}`
);

fs.writeFileSync('App.js', content, 'utf8');
console.log('Background features added successfully!');
