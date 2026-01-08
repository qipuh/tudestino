# 🔐 Instrucciones de Login - Panel Admin

## Estado Actual

✅ **Backend API**: Corriendo en http://localhost:3000
✅ **Frontend Admin**: Corriendo en http://localhost:5174
✅ **Base de datos**: Conectada
✅ **Usuario Admin**: Configurado

## 🚀 Pasos para Iniciar Sesión

### 1. Reiniciar Frontend (IMPORTANTE)
Después de cambiar el archivo `.env`, debes reiniciar el servidor:

```bash
# Presiona Ctrl + C en la terminal del frontend
# Luego ejecuta:
cd apps/admin
npm run dev
```

### 2. Abrir el Panel
Abre tu navegador en: http://localhost:5174/login

### 3. Credenciales de Admin
```
Email:    admin@tudestino.pe
Password: password
```

## 🔧 Verificaciones

### Verificar Backend
```bash
curl http://localhost:3000/health
```
Debe responder: `{"status":"OK","timestamp":"..."}`

### Verificar Login API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tudestino.pe","password":"password"}'
```

## ❌ Solución de Problemas

### Error: "No se puede conectar al servidor"
1. Verifica que el backend esté corriendo:
   ```bash
   cd apps/api
   npm run dev
   ```

2. Verifica que responda:
   ```bash
   curl http://localhost:3000/health
   ```

### Error: "Invalid credentials"
- La contraseña es: `password` (sin mayúsculas)
- El email es: `admin@tudestino.pe`

### Error: "Network Error" en el frontend
1. Verifica el archivo `.env`:
   ```bash
   cat apps/admin/.env
   ```
   Debe contener:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

2. **Reinicia el frontend** (los cambios en `.env` requieren reinicio)

### El frontend no carga los cambios
- Limpia la caché del navegador (Ctrl + Shift + R)
- O abre en modo incógnito
- O reinicia el servidor de desarrollo

## 🌐 URLs Configuradas

La configuración es dinámica y se define en:
- [apps/admin/src/config/api.config.js](src/config/api.config.js)

Para cambiar entre entornos, edita [apps/admin/.env](.env):

```bash
# Local
VITE_API_URL=http://localhost:3000/api

# Laragon
VITE_API_URL=http://api.tudestino.test/api

# Producción
VITE_API_URL=https://api.tudestino.com/api
```

## ✅ Checklist de Inicio

- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5174
- [ ] .env configurado correctamente
- [ ] Frontend reiniciado después de cambiar .env
- [ ] Navegador abierto en http://localhost:5174/login
- [ ] Credenciales correctas: admin@tudestino.pe / password
