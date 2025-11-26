# Configuración de Correo y APIs - TuDestino

## ✅ Estado: COMPLETADO

Fecha: 2025-11-25
Servidor: 161.132.38.151 (mail.tudestino.lat)

---

## 📧 SERVIDOR DE CORREO CONFIGURADO

### Cuentas de Correo Creadas

| Email | Contraseña | Propósito |
|-------|------------|-----------|
| **echavez@tudestino.lat** | `3@monitoSS` | Administrador Eduardo Chávez |
| **arojas@tudestino.lat** | `3@gatituSS` | Administrador Alejandro Rojas |
| **soporte@tudestino.lat** | `3@monitoSS` | Soporte al cliente |
| **send@tudestino.lat** | `3@monitoSS` | Envío automático desde la app |

### Configuración del Servidor

**Software Instalado:**
- ✅ Postfix (SMTP) - Puerto 25, 587
- ✅ Dovecot (IMAP) - Puerto 143, 993 (SSL)
- ✅ MySQL - Base de datos `mailserver`
- ✅ SSL/TLS configurado con Let's Encrypt

**Hostname:** mail.tudestino.lat

---

## 🔧 CONFIGURACIÓN SMTP PARA CLIENTES DE CORREO

### Para Outlook, Gmail, Thunderbird, etc:

#### IMAP (Recibir correos)
```
Servidor: mail.tudestino.lat
Puerto: 993
Seguridad: SSL/TLS
Usuario: [correo-completo]@tudestino.lat
Contraseña: [tu-contraseña]
```

#### SMTP (Enviar correos)
```
Servidor: mail.tudestino.lat
Puerto: 587
Seguridad: STARTTLS
Autenticación: Sí
Usuario: [correo-completo]@tudestino.lat
Contraseña: [tu-contraseña]
```

### Ejemplo para echavez@tudestino.lat:

**IMAP:**
- Servidor: mail.tudestino.lat
- Puerto: 993
- SSL: Sí
- Usuario: echavez@tudestino.lat
- Contraseña: 3@monitoSS

**SMTP:**
- Servidor: mail.tudestino.lat
- Puerto: 587
- STARTTLS: Sí
- Usuario: echavez@tudestino.lat
- Contraseña: 3@monitoSS

---

## 📱 CONFIGURACIÓN EN LA APLICACIÓN

La aplicación TuDestino ya está configurada para enviar correos usando:

```env
SMTP_HOST=mail.tudestino.lat
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=send@tudestino.lat
SMTP_PASS=3@monitoSS
SMTP_FROM=send@tudestino.lat
SMTP_FROM_NAME=TuDestino
```

**Ubicación:** `/var/www/tudestino/apps/api/.env`

Los correos que envíe la aplicación (confirmaciones, notificaciones, etc.) saldrán desde `send@tudestino.lat`

---

## 🌐 APIs CONFIGURADAS

### API Principal
```
URL: https://tudestino.lat/api/
Ejemplo: https://tudestino.lat/api/health
```

### API Subdomain (Directo)
```
URL: https://api.tudestino.lat/
Ejemplo: https://api.tudestino.lat/health
```

**Ambas URLs apuntan a la misma API** pero el subdomain api.tudestino.lat es útil para:
- Integraciones externas
- Aplicaciones móviles
- Separación conceptual
- CORS más específico

---

## ⚠️ CONFIGURACIÓN DNS REQUERIDA EN CLOUDFLARE

Para que el correo funcione correctamente, necesitas agregar estos registros DNS:

### 1. Registro A para mail
```
Tipo: A
Nombre: mail
Contenido: 161.132.38.151
Proxy: DNS only (nube gris)
TTL: Auto
```

### 2. Registro MX (Mail Exchange)
```
Tipo: MX
Nombre: @
Servidor de correo: mail.tudestino.lat
Prioridad: 10
Proxy: No aplicable
TTL: Auto
```

### 3. Registro TXT para SPF
```
Tipo: TXT
Nombre: @
Contenido: v=spf1 mx a:mail.tudestino.lat ~all
TTL: Auto
```

### 4. Registro A para API (Ya debería estar)
```
Tipo: A
Nombre: api
Contenido: 161.132.38.151
Proxy: DNS only (nube gris)
TTL: Auto
```

### 5. (Opcional) Registro TXT para DKIM
Para mejorar la deliverability (evitar spam):
```
# Este lo configuraremos después si es necesario
Tipo: TXT
Nombre: default._domainkey
Contenido: [Se generará más adelante]
```

### 6. (Opcional) Registro TXT para DMARC
```
Tipo: TXT
Nombre: _dmarc
Contenido: v=DMARC1; p=none; rua=mailto:soporte@tudestino.lat
```

---

## 📋 VERIFICACIÓN DE DNS

Después de configurar los registros, verifica:

### Verificar registro A de mail
```bash
nslookup mail.tudestino.lat
# Debe responder: 161.132.38.151
```

### Verificar registro MX
```bash
nslookup -type=MX tudestino.lat
# Debe mostrar: mail.tudestino.lat con prioridad 10
```

### Verificar SPF
```bash
nslookup -type=TXT tudestino.lat
# Debe incluir: v=spf1 mx a:mail.tudestino.lat ~all
```

---

## 🔍 PRUEBAS DE CORREO

### Probar SMTP desde el servidor
```bash
ssh root@161.132.38.151

# Probar autenticación
doveadm auth test send@tudestino.lat '3@monitoSS'
# Debe mostrar: passdb: send@tudestino.lat auth succeeded

# Enviar correo de prueba
echo "Test email body" | mail -s "Test from TuDestino" -r send@tudestino.lat tu-correo@gmail.com
```

### Probar desde la aplicación
La API ya tiene configurado el SMTP. Para probar:
1. Registra un usuario en la app
2. Verifica que llegue el correo de confirmación
3. Revisa los logs: `pm2 logs tudestino-api | grep -i mail`

---

## 📂 UBICACIONES IMPORTANTES

### Archivos de Configuración
```
Postfix main:     /etc/postfix/main.cf
Postfix master:   /etc/postfix/master.cf
Postfix MySQL:    /etc/postfix/mysql-*.cf
Dovecot mail:     /etc/dovecot/conf.d/10-mail.conf
Dovecot auth:     /etc/dovecot/conf.d/10-auth.conf
Dovecot SQL:      /etc/dovecot/dovecot-sql.conf.ext
Dovecot master:   /etc/dovecot/conf.d/10-master.conf
App .env:         /var/www/tudestino/apps/api/.env
```

### Base de Datos
```
Base de datos: mailserver
Usuario MySQL: mailuser
Contraseña: mailpassword123
Tablas:
  - virtual_domains (dominios de correo)
  - virtual_users (usuarios de correo)
  - virtual_aliases (alias de correo)
```

### Directorios de Correo
```
Buzones: /var/mail/vhosts/tudestino.lat/[usuario]/
Ejemplo: /var/mail/vhosts/tudestino.lat/send/
Usuario/Grupo: vmail:vmail (UID/GID 5000)
```

---

## 🛠️ COMANDOS ÚTILES

### Gestión de Servicios
```bash
# Reiniciar servicios de correo
systemctl restart postfix
systemctl restart dovecot

# Ver estado
systemctl status postfix
systemctl status dovecot

# Ver logs
tail -f /var/log/mail.log
journalctl -u postfix -f
journalctl -u dovecot -f
```

### Gestión de Usuarios de Correo
```bash
# Conectar a MySQL
mysql -u root -p'bWxxAYOS3I3+rQIPswCCy4413L4z0FnjoN8UFBZm03M=' mailserver

# Listar usuarios
SELECT email FROM virtual_users;

# Agregar nuevo usuario
INSERT INTO virtual_users (domain_id, password, email) VALUES
  (1, '{SHA512-CRYPT}$6$...hash...', 'nuevo@tudestino.lat');

# Para generar hash de contraseña:
doveadm pw -s SHA512-CRYPT -p 'contraseña'
```

### Probar Conectividad
```bash
# Probar SMTP
telnet mail.tudestino.lat 587

# Probar IMAP
openssl s_client -connect mail.tudestino.lat:993

# Verificar puertos abiertos
netstat -tlnp | grep -E ':(25|587|143|993)'
```

---

## 🔒 SEGURIDAD

### Puertos Abiertos
```
25   - SMTP (recepción)
587  - SMTP Submission (envío con autenticación)
143  - IMAP (no encriptado, para localhost)
993  - IMAPS (IMAP con SSL)
```

### Firewall
Si configuras UFW, asegúrate de permitir:
```bash
ufw allow 25/tcp
ufw allow 587/tcp
ufw allow 143/tcp
ufw allow 993/tcp
```

### Certificados SSL
```
Ubicación: /etc/letsencrypt/live/tudestino.lat/
Expira: 2026-02-23
Renovación: Automática vía certbot
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: No puedo enviar correos
```bash
# Verificar autenticación
doveadm auth test send@tudestino.lat '3@monitoSS'

# Ver logs de Postfix
tail -f /var/log/mail.log | grep postfix

# Verificar que Postfix esté corriendo
systemctl status postfix
```

### Problema: No puedo recibir correos
```bash
# Verificar que Dovecot esté corriendo
systemctl status dovecot

# Ver logs de Dovecot
journalctl -u dovecot -f

# Verificar permisos de buzones
ls -la /var/mail/vhosts/tudestino.lat/
```

### Problema: Los correos llegan a SPAM
```bash
# Verificar SPF
dig +short TXT tudestino.lat

# Usar herramientas online:
# - https://mxtoolbox.com/spf.aspx
# - https://www.mail-tester.com/
```

### Problema: Error de autenticación
```bash
# Verificar contraseña en la base de datos
mysql -u mailuser -pmailpassword123 mailserver -e "SELECT email, password FROM virtual_users;"

# Regenerar hash de contraseña
doveadm pw -s SHA512-CRYPT -p 'nueva-contraseña'

# Actualizar en base de datos
UPDATE virtual_users SET password='{SHA512-CRYPT}$6$...' WHERE email='user@tudestino.lat';
```

---

## 📊 MONITOREO

### Ver Cola de Correos
```bash
# Ver cola de Postfix
mailq

# Limpiar cola
postsuper -d ALL
```

### Estadísticas
```bash
# Logs de correos enviados
grep "status=sent" /var/log/mail.log | wc -l

# Logs de correos rechazados
grep "status=bounced" /var/log/mail.log
```

---

## 📝 RESUMEN FINAL

✅ **Servidor de Correo:** Funcionando
✅ **4 Cuentas creadas:** echavez, arojas, soporte, send
✅ **SMTP configurado:** Puerto 587 con STARTTLS
✅ **IMAP configurado:** Puerto 993 con SSL
✅ **API Principal:** https://tudestino.lat/api/
✅ **API Subdomain:** https://api.tudestino.lat/
✅ **SSL:** Certificados válidos
✅ **App configurada:** send@tudestino.lat como remitente

⚠️ **PENDIENTE:** Configurar registros DNS (MX, SPF) en Cloudflare

---

## 📞 Siguiente Paso

**IMPORTANTE:** Debes configurar los registros DNS en Cloudflare (ver sección "CONFIGURACIÓN DNS REQUERIDA") para que el correo funcione completamente.

Sin los registros MX, los correos externos NO llegarán al servidor.

**Tiempo estimado de propagación DNS:** 1-2 horas

---

**Documentación creada:** 2025-11-25
**Sistema:** TuDestino v1.0
**Servidor:** mail.tudestino.lat (161.132.38.151)
