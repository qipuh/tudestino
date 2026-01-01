# Resumen Rápido de Despliegue - TuDestino

## 📦 Archivos de Configuración Creados

Todos los archivos necesarios para el despliegue han sido creados en el repositorio:

### 🔧 Scripts de Instalación

1. **[server-setup.sh](server-setup.sh)** - Configuración inicial del servidor
   - Instala Node.js, MySQL, Nginx, PM2, Certbot
   - Configura firewall y seguridad

2. **[install-phpmyadmin.sh](install-phpmyadmin.sh)** - Instalación de phpMyAdmin
   - Usuario: `adapptika`
   - Contraseña: `3@monitoSS`
   - URL: https://db.tudestino.pe

3. **[install-ssl.sh](install-ssl.sh)** - Instalación de certificados SSL gratuitos
   - Configura SSL para todos los dominios (.pe y .lat)
   - Renovación automática

4. **[deploy-quick.sh](deploy-quick.sh)** - Script de actualización rápida
   - Pull, build y restart automático

### ⚙️ Archivos de Configuración

5. **[nginx-tudestino.conf](nginx-tudestino.conf)** - Configuración completa de Nginx
   - Dominios tudestino.pe y tudestino.lat
   - Redirecciones HTTP → HTTPS
   - Configuración para API, Web, Admin y phpMyAdmin

6. **[ecosystem.config.cjs](ecosystem.config.cjs)** - Configuración de PM2
   - Gestión de procesos de la API
   - Auto-restart y clustering

7. **[apps/api/.env.production](apps/api/.env.production)** - Variables de entorno API
8. **[apps/web/.env.production](apps/web/.env.production)** - Variables de entorno Web
9. **[apps/admin/.env.production](apps/admin/.env.production)** - Variables de entorno Admin

### 📚 Documentación

10. **[DEPLOYMENT-COMPLETO.md](DEPLOYMENT-COMPLETO.md)** - Guía completa paso a paso
11. **[DNS-CONFIG.md](DNS-CONFIG.md)** - Guía de configuración DNS

---

## 🚀 Inicio Rápido (Orden de Ejecución)

### En el Servidor VPS

Conectarse al servidor:
```bash
ssh root@161.132.38.151
# Contraseña: 3@monitoSS
```

### Paso 1: Configurar el servidor (15-20 min)
```bash
cd ~
wget https://raw.githubusercontent.com/qipuh/tudestino/main/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

### Paso 2: Clonar el proyecto
```bash
cd /var/www
git clone https://qipuh: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@github.com/qipuh/tudestino.git
cd tudestino
```

### Paso 3: Configurar DNS ⏰ ESPERAR 1-4 HORAS

**IMPORTANTE**: Antes de continuar, configura los DNS según [DNS-CONFIG.md](DNS-CONFIG.md)

Registros DNS necesarios (en tu panel de dominios):

**tudestino.pe:**
- A @ → 161.132.38.151
- A www → 161.132.38.151
- A api → 161.132.38.151
- A admin → 161.132.38.151
- A db → 161.132.38.151

**tudestino.lat:**
- A @ → 161.132.38.151
- A www → 161.132.38.151
- A api → 161.132.38.151
- A admin → 161.132.38.151

Verificar propagación:
```bash
dig tudestino.pe
dig api.tudestino.pe
```

### Paso 4: Configurar variables de entorno
```bash
# Generar JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Configurar API
cp apps/api/.env.production apps/api/.env
nano apps/api/.env
# Editar: JWT_SECRET, SMTP_USER, SMTP_PASS

# Configurar Web
cp apps/web/.env.production apps/web/.env
nano apps/web/.env
# Editar: VITE_GOOGLE_MAPS_API_KEY, VITE_CULQI_PUBLIC_KEY

# Configurar Admin
cp apps/admin/.env.production apps/admin/.env
```

### Paso 5: Instalar y construir
```bash
npm install
npm run build:web
npm run build:admin
npm run seed:mysql
```

### Paso 6: Instalar phpMyAdmin
```bash
chmod +x install-phpmyadmin.sh
./install-phpmyadmin.sh
```

### Paso 7: Configurar Nginx
```bash
cp nginx-tudestino.conf /etc/nginx/sites-available/tudestino
ln -s /etc/nginx/sites-available/tudestino /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Paso 8: Instalar SSL (solo después de DNS propagados)
```bash
chmod +x install-ssl.sh
./install-ssl.sh
# Ingresa tu email cuando te lo pida
```

### Paso 9: Iniciar la aplicación
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # Ejecutar el comando que muestre
```

### Paso 10: Verificar
```bash
pm2 status
pm2 logs
```

Abrir en navegador:
- https://tudestino.pe
- https://admin.tudestino.pe
- https://api.tudestino.pe/api
- https://db.tudestino.pe (adapptika / 3@monitoSS)

---

## 🌐 URLs Finales

### Dominio Principal (.pe)
- **Web**: https://tudestino.pe
- **Admin**: https://admin.tudestino.pe
- **API**: https://api.tudestino.pe
- **phpMyAdmin**: https://db.tudestino.pe

### Dominio Alternativo (.lat → redirige a .pe)
- **Web**: https://tudestino.lat
- **Admin**: https://admin.tudestino.lat
- **API**: https://api.tudestino.lat

---

## 🔑 Credenciales

### VPS
- IP: 161.132.38.151
- Usuario: root
- Contraseña: 3@monitoSS

### MySQL
- Usuario: root
- Contraseña: TuDestino2026!Secure

### phpMyAdmin
- Usuario: adapptika
- Contraseña: 3@monitoSS
- URL: https://db.tudestino.pe

### GitHub
- Usuario: qipuh
- Token: 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

---

## 🔄 Para Actualizar la Aplicación

```bash
cd /var/www/tudestino
./deploy-quick.sh
```

O manualmente:
```bash
git pull origin main
npm install
npm run build:web
npm run build:admin
pm2 restart tudestino-api
```

---

## 📖 Documentación Completa

Para más detalles, consulta:
- **[DEPLOYMENT-COMPLETO.md](DEPLOYMENT-COMPLETO.md)** - Guía detallada completa
- **[DNS-CONFIG.md](DNS-CONFIG.md)** - Configuración DNS paso a paso

---

## ✅ Checklist Rápido

- [ ] Ejecutar server-setup.sh
- [ ] Clonar repositorio
- [ ] Configurar DNS (.pe y .lat)
- [ ] Esperar propagación DNS (1-4 horas)
- [ ] Configurar archivos .env
- [ ] npm install y build
- [ ] Ejecutar seeds de MySQL
- [ ] Instalar phpMyAdmin
- [ ] Configurar Nginx
- [ ] Instalar SSL
- [ ] Iniciar con PM2
- [ ] Verificar todas las URLs

---

**¿Necesitas ayuda?** Consulta la sección de Troubleshooting en [DEPLOYMENT-COMPLETO.md](DEPLOYMENT-COMPLETO.md)
