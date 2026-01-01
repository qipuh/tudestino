# Configuración DNS para TuDestino

## 📋 Información del Servidor
- **IP del VPS**: 161.132.38.151

## 🌐 Dominios a Configurar
- tudestino.pe (dominio principal)
- tudestino.lat (dominio alternativo)

---

## 📝 Registros DNS Requeridos

### Para tudestino.pe

Accede al panel de control de tu registrador de dominios (donde compraste tudestino.pe) y crea los siguientes registros DNS:

| Tipo | Nombre/Host | Valor/Destino | TTL |
|------|-------------|---------------|-----|
| A | @ | 161.132.38.151 | 3600 |
| A | www | 161.132.38.151 | 3600 |
| A | api | 161.132.38.151 | 3600 |
| A | admin | 161.132.38.151 | 3600 |
| A | db | 161.132.38.151 | 3600 |

**Descripción de registros:**
- `@` → tudestino.pe (dominio raíz)
- `www` → www.tudestino.pe (con www)
- `api` → api.tudestino.pe (API backend)
- `admin` → admin.tudestino.pe (panel administrador)
- `db` → db.tudestino.pe (phpMyAdmin)

### Para tudestino.lat

Accede al panel de control de tu registrador de dominios (donde compraste tudestino.lat) y crea los siguientes registros DNS:

| Tipo | Nombre/Host | Valor/Destino | TTL |
|------|-------------|---------------|-----|
| A | @ | 161.132.38.151 | 3600 |
| A | www | 161.132.38.151 | 3600 |
| A | api | 161.132.38.151 | 3600 |
| A | admin | 161.132.38.151 | 3600 |

**Descripción de registros:**
- `@` → tudestino.lat (dominio raíz)
- `www` → www.tudestino.lat (con www)
- `api` → api.tudestino.lat (API backend - redirige a .pe)
- `admin` → admin.tudestino.lat (panel - redirige a .pe)

---

## ⏱️ Tiempo de Propagación

Los cambios DNS pueden tardar entre **10 minutos a 48 horas** en propagarse completamente, aunque normalmente toma entre 1-4 horas.

### Verificar Propagación DNS

Desde tu terminal local o el servidor:

```bash
# Verificar tudestino.pe
dig tudestino.pe
dig www.tudestino.pe
dig api.tudestino.pe
dig admin.tudestino.pe
dig db.tudestino.pe

# Verificar tudestino.lat
dig tudestino.lat
dig www.tudestino.lat
dig api.tudestino.lat
dig admin.tudestino.lat
```

O usa herramientas online:
- https://dnschecker.org
- https://www.whatsmydns.net

Todos los registros deben apuntar a: **161.132.38.151**

---

## 🔧 Verificación desde el Servidor

Una vez que los DNS estén propagados, verifica desde el servidor:

```bash
# Verificar que el servidor responde en los dominios
ping -c 3 tudestino.pe
ping -c 3 api.tudestino.pe
ping -c 3 admin.tudestino.pe
ping -c 3 db.tudestino.pe

ping -c 3 tudestino.lat
ping -c 3 api.tudestino.lat
ping -c 3 admin.tudestino.lat
```

---

## 📌 Registradores Comunes y Sus Paneles

### NIC.PE (dominios .pe)
1. Accede a https://www.nic.pe
2. Inicia sesión con tu cuenta
3. Ve a "Mis Dominios" → tudestino.pe
4. Busca "Administrar DNS" o "Zone File"
5. Agrega los registros A mencionados arriba

### Registradores Internacionales (.lat)
- **Namecheap**: Dashboard → Domain List → Manage → Advanced DNS
- **GoDaddy**: My Products → Domains → DNS → Manage Zones
- **Google Domains**: My Domains → DNS
- **Cloudflare**: Dashboard → DNS

---

## 🚀 Siguiente Paso

Una vez que los DNS estén propagados (puedes verificar con `dig` o las herramientas online), procede con:

1. **Configurar Nginx** en el servidor con el archivo `nginx-tudestino.conf`
2. **Instalar certificados SSL** con el script `install-ssl.sh`

---

## 💡 Notas Importantes

1. **No elimines registros existentes** importantes (como MX si tienes email)
2. **TTL (Time To Live)**: 3600 segundos = 1 hora. Puedes usar valores más bajos (300-600) durante pruebas
3. **Certificados SSL**: Solo se pueden obtener DESPUÉS de que los DNS estén propagados
4. **Dominios .pe**: Si tienes problemas, contacta a tu registrador de .pe
5. **Estrategia de dominios**:
   - `.pe` es el dominio principal
   - `.lat` redirige a `.pe` para evitar contenido duplicado (mejor para SEO)

---

## ✅ Checklist de Configuración DNS

- [ ] Registros A configurados para tudestino.pe
- [ ] Registros A configurados para tudestino.lat
- [ ] Esperados 1-4 horas para propagación
- [ ] Verificado con `dig` o herramientas online
- [ ] Todos los subdominios apuntan a 161.132.38.151
- [ ] Listo para configurar Nginx y SSL
