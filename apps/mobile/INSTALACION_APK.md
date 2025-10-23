# 📱 Instalación del APK de TuDestino

## ✅ APK Generado Exitosamente

El archivo APK de producción ha sido construido correctamente:

**Ubicación**: `apps/mobile/build/app/outputs/flutter-apk/app-release.apk`
**Tamaño**: 49.9 MB
**Versión**: 1.0.0+1
**Arquitecturas**: ARM, ARM64, x64

---

## 📥 Cómo Instalar en tu Dispositivo Android

### Método 1: Transferencia por Cable USB

1. **Conecta tu dispositivo Android** al PC con un cable USB

2. **Habilita la transferencia de archivos** en tu teléfono

3. **Copia el APK** a tu dispositivo:
   - Navega a `apps/mobile/build/app/outputs/flutter-apk/`
   - Copia `app-release.apk` a tu teléfono (carpeta Downloads)

4. **Habilita instalación de fuentes desconocidas**:
   - Ve a **Configuración** > **Seguridad**
   - Activa **Fuentes desconocidas** o **Instalar apps desconocidas**
   - En Android 8+: Habilita para el navegador de archivos que uses

5. **Instala el APK**:
   - Abre el explorador de archivos en tu teléfono
   - Navega a la carpeta **Downloads**
   - Toca `app-release.apk`
   - Confirma la instalación

6. **Abre la app TuDestino** 🎉

---

### Método 2: Compartir por Email/Drive

1. **Sube el APK** a Google Drive, Dropbox o envíalo por email

2. **Desde tu teléfono**:
   - Abre el link/email
   - Descarga el archivo `app-release.apk`

3. **Instala** siguiendo los pasos 4-6 del Método 1

---

### Método 3: ADB (Para Desarrolladores)

Si tienes ADB instalado:

```bash
# Desde la raíz del proyecto
cd apps/mobile

# Instalar en dispositivo conectado
adb install build/app/outputs/flutter-apk/app-release.apk

# O reinstalar (si ya está instalado)
adb install -r build/app/outputs/flutter-apk/app-release.apk
```

---

## ⚙️ Configuración Inicial de la App

### 1. Configurar la URL del Backend

**IMPORTANTE**: El APK viene configurado con la URL por defecto:
```
http://localhost:3000/api
```

Para usar con un dispositivo físico, necesitas:

1. **Obtener tu IP local**:
   ```bash
   # En Windows
   ipconfig

   # Busca "Dirección IPv4" en tu adaptador de red
   # Ejemplo: 192.168.1.100
   ```

2. **Asegúrate que el backend esté corriendo**:
   ```bash
   cd apps/api
   npm run dev
   ```

3. **Verifica que sea accesible desde tu red**:
   - El backend debe estar corriendo en `http://TU_IP:3000`
   - Ambos dispositivos (PC y móvil) deben estar en la misma red WiFi

### 2. Primera Ejecución

Al abrir la app por primera vez:

1. Verás la **pantalla de inicio** con propiedades destacadas
2. Si no hay conexión al backend, verás un mensaje de error
3. Puedes navegar sin login a:
   - 🏠 Inicio
   - 🔍 Búsqueda
   - 📷 Feed Social

4. Para usar funciones completas, **inicia sesión** o **regístrate**

---

## 🔧 Solución de Problemas

### El APK no se instala

**Error**: "App no instalada"

**Soluciones**:
- Asegúrate de haber habilitado "Fuentes desconocidas"
- Verifica que tengas suficiente espacio (mínimo 100 MB)
- Desinstala versión anterior si existe
- Intenta reiniciar el dispositivo

### La app no se conecta al backend

**Síntoma**: Mensajes de "Error de conexión"

**Soluciones**:

1. **Verifica que el backend esté corriendo**:
   ```bash
   # En tu PC
   cd c:\laragon\www\tudestino\apps\api
   npm run dev
   ```

2. **Verifica la red**:
   - PC y móvil en la misma red WiFi
   - Firewall no bloqueando el puerto 3000
   - Prueba desde el navegador móvil: `http://TU_IP:3000/health`

3. **Para testing rápido** (solo desarrollo):
   - Usa emulador Android en lugar de dispositivo físico
   - O configura ngrok para exponer el backend

### Imágenes no cargan

**Soluciones**:
- Verifica conexión a internet
- Las imágenes necesitan ser accesibles públicamente
- En desarrollo local, las URLs deben ser accesibles desde el móvil

---

## 📱 Funcionalidades de la App

### Sin Autenticación
✅ Ver propiedades destacadas
✅ Buscar propiedades
✅ Ver detalles de propiedades
✅ Ver feed social
✅ Explorar destinos

### Con Autenticación
✅ Crear reservas
✅ Ver mis reservas
✅ Cancelar reservas
✅ Dar likes a posts
✅ Comentar en posts
✅ Ver mi perfil
✅ Favoritos
✅ Notificaciones

---

## 🏗️ Build Personalizado

Si quieres modificar la app y generar un nuevo APK:

### 1. Editar Código

```bash
# Navega al proyecto móvil
cd apps/mobile

# Edita los archivos en lib/
```

### 2. Cambiar URL del Backend

Edita `lib/core/services/api_service.dart`:

```dart
static const String baseUrl = 'http://TU_IP_AQUI:3000/api';
```

### 3. Reconstruir APK

```bash
# Limpiar build anterior
flutter clean

# Obtener dependencias
flutter pub get

# Construir nuevo APK
flutter build apk --release
```

El nuevo APK estará en: `build/app/outputs/flutter-apk/app-release.apk`

---

## 📊 Información Técnica del APK

### Características
- **Versión de Flutter**: 3.35.4
- **Versión de Dart**: 3.9.2
- **Arquitecturas soportadas**:
  - armeabi-v7a (ARM 32-bit)
  - arm64-v8a (ARM 64-bit)
  - x86_64 (Intel 64-bit)
- **Android mínimo**: API 21 (Android 5.0 Lollipop)
- **Android target**: API 34 (Android 14)

### Optimizaciones Aplicadas
✅ Tree-shaking de íconos (99.6% reducción)
✅ Minificación de código
✅ Compresión de recursos
✅ Caché de imágenes
✅ Release mode (sin debug info)

### Permisos Solicitados
- Internet (para API calls)
- Estado de red (verificar conectividad)
- Almacenamiento (caché de imágenes)

---

## 🚀 Próximos Pasos

### Para Testing
1. Instala el APK en varios dispositivos Android
2. Prueba con diferentes versiones de Android
3. Verifica todas las funcionalidades
4. Reporta bugs encontrados

### Para Producción
1. Firma el APK con keystore de producción
2. Sube a Google Play Console
3. Configura backend en servidor real (no localhost)
4. Habilita HTTPS
5. Configura dominio real

### Para App Bundle (Play Store)
```bash
flutter build appbundle --release
```

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa la sección de **Solución de Problemas** arriba
2. Verifica los logs: `adb logcat` (si tienes ADB)
3. Consulta `README_COMPLETO.md` para más información
4. Revisa el backend en `apps/api/`

---

**¡Disfruta de TuDestino Mobile! 🎉📱✨**
