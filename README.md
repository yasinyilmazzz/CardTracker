# Namaz Vakitleri

Bu proje, Expo ve EAS (Expo Application Services) kullanılarak geliştirilmiş bir mobil uygulamadır. Bu döküman; geliştirme ortamının hazırlanması, proje çalıştırma adımları ve EAS kullanarak Android/iOS build alma süreçlerini kapsamaktadır.

---

## 1. Gereksinimler

Projenin çalışması için aşağıdaki araçların makinede kurulu olması gerekir:

- Node.js (LTS önerilir)
- npm veya yarn
- Expo CLI
- EAS CLI
- Android için: Android Studio + JDK (isteğe bağlı)
- iOS için: Xcode (sadece macOS)

---

## 2. Kurulum

### 2.1. Depoyu Klonlayın

```bash
git clone <repository-url>
cd <project-folder>
```

### 2.2. Bağımlılıkları Yükleyin

```bash
npm install
```
## 3. Expo Geliştirme Ortamı
### 3.1. Expo CLI Kurulumu
```bash
npm install -g expo-cli
```
### 3.2. Projeyi Çalıştırma
```bash
expo start
```
Bu komut ile:

QR kodu telefonunuza okutarak uygulamayı gerçek cihazda çalıştırabilirsiniz.

Android Emulator veya iOS Simulator üzerinden uygulamayı açabilirsiniz.

## 4. EAS Yapılandırması

EAS, cloud üzerinden Android ve iOS build almayı sağlar.
### 4.1. EAS CLI Kurulumu
```bash
npm install -g eas-cli
```
### 4.2. Expo Hesabına Giriş
```bash
eas login
``` 
### 4.3. EAS Yapılandırmasını Başlatma
```bash
eas build:configure
``` 
Bu komut, projenin kök dizininde eas.json dosyasını oluşturur.

## 5. Build Alma Süreçleri
### 5.1. Android Build Alma
APK dosyasını oluşturmak için:
```bash
eas build -p android --profile preview
```
AAB dosyasını oluşturmak için:
```bash
eas build -p android --profile production
``` 
IOS için:   
```bash
eas build -p ios --profile preview
```
EAS, sertifika ve provisioning profili yönetimi için yönlendirecektir. Expo’nun otomatik olarak yönetmesine izin verebilir veya manuel yükleme yapabilirsiniz.





