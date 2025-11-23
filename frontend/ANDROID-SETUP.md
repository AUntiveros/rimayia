# 📱 RimiApp - Configuración Android

## ✅ Instalación Completada

La aplicación ha sido convertida exitosamente a una App Android nativa usando Capacitor.

---

## 📋 Información de la App

- **Nombre**: RimiApp
- **ID de Paquete**: `com.rimac.rimiapp`
- **Plataforma**: Android
- **Framework**: Capacitor 6.x
- **Web Dir**: `dist/`

---

## 🏗️ Estructura del Proyecto

```
RimiApp/
├── android/                    # ✨ Proyecto Android nativo
│   ├── app/
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── assets/
│   │   │       │   └── public/  # Web assets (HTML, CSS, JS)
│   │   │       ├── java/
│   │   │       │   └── com/rimac/rimiapp/
│   │   │       │       └── MainActivity.java
│   │   │       ├── res/         # Recursos Android (iconos, splash)
│   │   │       └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── gradle/
│   ├── build.gradle
│   └── settings.gradle
├── dist/                       # Build de producción web
├── src/                        # Código fuente React
└── capacitor.config.ts         # Configuración Capacitor
```

---

## 🔧 Configuración Aplicada

### capacitor.config.ts

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rimac.rimiapp',
  appName: 'RimiApp',
  webDir: 'dist',
  server: {
    androidScheme: 'https'  // ✅ Evita problemas de CORS
  }
};

export default config;
```

**Características**:
- ✅ `androidScheme: 'https'`: Usa HTTPS en lugar de HTTP para evitar problemas de CORS
- ✅ `webDir: 'dist'`: Apunta al build de producción de Vite

---

## 🚀 Comandos Disponibles

### Desarrollo

```bash
# 1. Hacer cambios en el código React
# Editar archivos en src/

# 2. Construir la versión web
npm run build

# 3. Sincronizar con Android
npx cap sync

# 4. Abrir en Android Studio
npx cap open android
```

### Workflow Completo

```bash
# Desarrollo iterativo
npm run build && npx cap sync && npx cap open android
```

---

## 📱 Abrir en Android Studio

### Opción 1: Comando Capacitor
```bash
npx cap open android
```

### Opción 2: Manual
1. Abrir Android Studio
2. File → Open
3. Navegar a `RimiApp/android/`
4. Click en "Open"

---

## 🔨 Compilar y Ejecutar

### Requisitos Previos

1. **Android Studio** instalado
   - Download: https://developer.android.com/studio

2. **Java JDK 17** (recomendado)
   - Verificar: `java -version`

3. **Android SDK** configurado
   - SDK Platform: Android 13 (API 33) o superior
   - Build Tools: 33.0.0 o superior

4. **Dispositivo o Emulador**
   - Emulador Android configurado en Android Studio
   - O dispositivo físico con USB Debugging habilitado

### Pasos para Ejecutar

1. **Abrir Android Studio**
   ```bash
   npx cap open android
   ```

2. **Esperar Gradle Sync**
   - Android Studio sincronizará automáticamente
   - Puede tomar 2-5 minutos la primera vez

3. **Seleccionar Dispositivo**
   - En la barra superior, seleccionar emulador o dispositivo físico

4. **Run**
   - Click en el botón verde "Run" (▶️)
   - O presionar `Shift + F10`

5. **Instalar y Abrir**
   - La app se instalará automáticamente
   - Se abrirá en el dispositivo/emulador

---

## 📦 Generar APK/AAB

### APK de Debug (Testing)

```bash
cd android
./gradlew assembleDebug
```

**Ubicación**: `android/app/build/outputs/apk/debug/app-debug.apk`

### APK de Release (Producción)

```bash
cd android
./gradlew assembleRelease
```

**Ubicación**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### AAB para Google Play

```bash
cd android
./gradlew bundleRelease
```

**Ubicación**: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🔐 Firma de la App (Release)

### 1. Generar Keystore

```bash
keytool -genkey -v -keystore rimiapp-release.keystore -alias rimiapp -keyalg RSA -keysize 2048 -validity 10000
```

### 2. Configurar en Android

Crear `android/key.properties`:

```properties
storePassword=TU_PASSWORD
keyPassword=TU_PASSWORD
keyAlias=rimiapp
storeFile=../rimiapp-release.keystore
```

### 3. Actualizar build.gradle

En `android/app/build.gradle`, agregar:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

---

## 🎨 Personalización

### Icono de la App

1. Generar iconos en diferentes tamaños:
   - 48x48, 72x72, 96x96, 144x144, 192x192, 512x512

2. Reemplazar en:
   ```
   android/app/src/main/res/
   ├── mipmap-hdpi/ic_launcher.png
   ├── mipmap-mdpi/ic_launcher.png
   ├── mipmap-xhdpi/ic_launcher.png
   ├── mipmap-xxhdpi/ic_launcher.png
   └── mipmap-xxxhdpi/ic_launcher.png
   ```

3. Sincronizar:
   ```bash
   npx cap sync
   ```

### Splash Screen

1. Crear imagen de splash (2732x2732 px)

2. Agregar plugin:
   ```bash
   npm install @capacitor/splash-screen
   ```

3. Configurar en `capacitor.config.ts`:
   ```typescript
   plugins: {
     SplashScreen: {
       launchShowDuration: 2000,
       backgroundColor: "#E60000",
       showSpinner: false
     }
   }
   ```

### Nombre de la App

Editar `android/app/src/main/res/values/strings.xml`:

```xml
<resources>
    <string name="app_name">RimiApp</string>
    <string name="title_activity_main">RimiApp</string>
    <string name="package_name">com.rimac.rimiapp</string>
    <string name="custom_url_scheme">com.rimac.rimiapp</string>
</resources>
```

---

## 🔌 Plugins Nativos Disponibles

### Instalados por Defecto
- ✅ Capacitor Core
- ✅ Android Platform

### Plugins Útiles para RimiApp

```bash
# Cámara (para subir recetas)
npm install @capacitor/camera
npx cap sync

# Geolocalización (para triage)
npm install @capacitor/geolocation
npx cap sync

# Notificaciones Push
npm install @capacitor/push-notifications
npx cap sync

# Almacenamiento local
npm install @capacitor/preferences
npx cap sync

# Compartir contenido
npm install @capacitor/share
npx cap sync

# Haptics (vibración)
npm install @capacitor/haptics
npx cap sync
```

---

## 🐛 Troubleshooting

### Error: "SDK location not found"

**Solución**: Crear `android/local.properties`:

```properties
sdk.dir=C:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk
```

### Error: "Gradle sync failed"

**Solución**:
```bash
cd android
./gradlew clean
./gradlew build
```

### Error: "Unable to locate adb"

**Solución**: Agregar Android SDK al PATH:

```bash
# Windows
set PATH=%PATH%;C:\Users\TU_USUARIO\AppData\Local\Android\Sdk\platform-tools
```

### App no se actualiza

**Solución**:
```bash
# Limpiar y reconstruir
npm run build
npx cap sync
cd android
./gradlew clean
```

---

## 📊 Permisos de Android

### AndroidManifest.xml

Ubicación: `android/app/src/main/AndroidManifest.xml`

**Permisos actuales**:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

**Permisos adicionales para RimiApp**:

```xml
<!-- Cámara (para subir recetas) -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />

<!-- Micrófono (para modo voz) -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />

<!-- Ubicación (para geofencing) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Almacenamiento (para guardar imágenes) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

---

## 🚀 Publicar en Google Play

### 1. Crear Cuenta de Desarrollador
- Costo: $25 USD (único pago)
- URL: https://play.google.com/console

### 2. Preparar la App

```bash
# Generar AAB firmado
cd android
./gradlew bundleRelease
```

### 3. Información Requerida

- **Título**: RimiApp
- **Descripción corta**: Asistente de salud inteligente de Rimac
- **Descripción completa**: [Descripción detallada de features]
- **Categoría**: Medicina
- **Clasificación de contenido**: Para todas las edades
- **Screenshots**: Mínimo 2 (1080x1920 px)
- **Icono**: 512x512 px
- **Feature Graphic**: 1024x500 px

### 4. Subir AAB

1. Google Play Console → Crear aplicación
2. Producción → Crear versión
3. Subir `app-release.aab`
4. Completar información
5. Enviar a revisión

---

## 📱 Testing en Dispositivo Real

### Habilitar USB Debugging

1. **En el dispositivo Android**:
   - Ajustes → Acerca del teléfono
   - Tocar "Número de compilación" 7 veces
   - Volver → Opciones de desarrollador
   - Activar "Depuración USB"

2. **Conectar por USB**:
   ```bash
   # Verificar dispositivo conectado
   adb devices
   ```

3. **Ejecutar desde Android Studio**:
   - Seleccionar dispositivo en la lista
   - Click en Run (▶️)

---

## 🔄 Workflow de Desarrollo

```bash
# 1. Hacer cambios en React
# Editar src/...

# 2. Build
npm run build

# 3. Sync
npx cap sync

# 4. Run en Android Studio
npx cap open android
# Luego presionar Run (▶️)
```

**Tip**: Crear script en `package.json`:

```json
{
  "scripts": {
    "android": "npm run build && npx cap sync && npx cap open android"
  }
}
```

Uso:
```bash
npm run android
```

---

## 📚 Recursos Adicionales

- **Documentación Capacitor**: https://capacitorjs.com/docs
- **Android Developers**: https://developer.android.com
- **Capacitor Plugins**: https://capacitorjs.com/docs/plugins
- **Ionic Forum**: https://forum.ionicframework.com

---

## ✅ Checklist de Producción

Antes de publicar:

- [ ] Probar en múltiples dispositivos Android
- [ ] Probar en diferentes versiones de Android (API 24+)
- [ ] Verificar permisos funcionan correctamente
- [ ] Optimizar imágenes y assets
- [ ] Configurar ProGuard para ofuscar código
- [ ] Generar keystore de producción
- [ ] Firmar APK/AAB
- [ ] Probar versión release en dispositivo
- [ ] Preparar screenshots y assets para Play Store
- [ ] Escribir descripción y política de privacidad
- [ ] Configurar versioning (versionCode, versionName)

---

**Estado**: ✅ Proyecto Android creado y configurado exitosamente
**Próximo paso**: Abrir en Android Studio con `npx cap open android`
