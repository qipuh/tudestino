#!/bin/bash

# Script de Despliegue Completo - TuDestino
# Este script ejecuta TODOS los pasos necesarios para desplegar TuDestino
#
# IMPORTANTE: Ejecutar en este orden después de configurar DNS

set -e

echo "============================================"
echo "Despliegue Completo - TuDestino"
echo "============================================"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Este script debe ejecutarse como root${NC}"
    echo "Usa: sudo ./deploy-completo.sh"
    exit 1
fi

echo ""
echo -e "${BLUE}Este script ejecutará los siguientes pasos:${NC}"
echo "1. Desinstalar Webuzo (si existe)"
echo "2. Instalar software base (Node.js, MySQL, Nginx, PM2)"
echo "3. Clonar/actualizar repositorio"
echo "4. Configurar variables de entorno"
echo "5. Instalar dependencias y construir"
echo "6. Configurar base de datos y seeds"
echo "7. Instalar phpMyAdmin"
echo "8. Configurar Nginx"
echo "9. Instalar certificados SSL"
echo "10. Iniciar aplicación con PM2"
echo ""
read -p "¿Continuar? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo -e "${YELLOW}Operación cancelada${NC}"
    exit 0
fi

# ==============================================
# PASO 1: Desinstalar Webuzo
# ==============================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}PASO 1: Desinstalar Webuzo${NC}"
echo -e "${GREEN}================================================${NC}"

if [ -d "/usr/local/webuzo" ] || command -v httpd &> /dev/null; then
    echo -e "${YELLOW}Webuzo detectado. Desinstalando...${NC}"

    # Detener servicios
    systemctl stop httpd 2>/dev/null || true
    systemctl stop webuzo 2>/dev/null || true
    systemctl stop mysqld 2>/dev/null || true

    # Desinstalar
    wget -O /tmp/uninstall_webuzo.sh https://webuzo.com/uninstall.sh 2>/dev/null || true
    if [ -f /tmp/uninstall_webuzo.sh ]; then
        chmod +x /tmp/uninstall_webuzo.sh
        /tmp/uninstall_webuzo.sh -y || true
    fi

    # Limpiar directorios
    rm -rf /usr/local/webuzo 2>/dev/null || true
    rm -rf /usr/local/apps 2>/dev/null || true
    rm -rf /usr/local/emps 2>/dev/null || true
    rm -rf /etc/httpd 2>/dev/null || true

    # Desinstalar Apache
    apt remove --purge -y apache2 apache2-utils 2>/dev/null || true
    yum remove -y httpd 2>/dev/null || true

    echo -e "${GREEN}✓ Webuzo desinstalado${NC}"
else
    echo -e "${GREEN}✓ Webuzo no detectado${NC}"
fi

# ==============================================
# PASO 2: Instalar Software Base
# ==============================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}PASO 2: Instalar Software Base${NC}"
echo -e "${GREEN}================================================${NC}"

# Actualizar sistema
echo -e "${BLUE}Actualizando sistema...${NC}"
apt update && apt upgrade -y

# Instalar dependencias básicas
echo -e "${BLUE}Instalando dependencias básicas...${NC}"
apt install -y curl wget git ufw fail2ban

# Configurar firewall
echo -e "${BLUE}Configurando firewall...${NC}"
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Instalar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${BLUE}Instalando Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Instalar MySQL
if ! command -v mysql &> /dev/null; then
    echo -e "${BLUE}Instalando MySQL...${NC}"
    apt install -y mysql-server
    systemctl start mysql
    systemctl enable mysql

    # Configurar MySQL
    mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'TuDestino2026!Secure';" || true
    mysql -e "CREATE DATABASE IF NOT EXISTS tudestino CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" || true
    mysql -e "FLUSH PRIVILEGES;" || true
fi
echo -e "${GREEN}✓ MySQL instalado${NC}"

# Instalar Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${BLUE}Instalando Nginx...${NC}"
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
fi
echo -e "${GREEN}✓ Nginx instalado${NC}"

# Instalar PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${BLUE}Instalando PM2...${NC}"
    npm install -g pm2
fi
echo -e "${GREEN}✓ PM2 instalado${NC}"

# Instalar Certbot
if ! command -v certbot &> /dev/null; then
    echo -e "${BLUE}Instalando Certbot...${NC}"
    apt install -y certbot python3-certbot-nginx
fi
echo -e "${GREEN}✓ Certbot instalado${NC}"

# ==============================================
# PASO 3: Clonar/Actualizar Repositorio
# ==============================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}PASO 3: Clonar/Actualizar Repositorio${NC}"
echo -e "${GREEN}================================================${NC}"

mkdir -p /var/www
cd /var/www

if [ -d "tudestino" ]; then
    echo -e "${BLUE}Repositorio existe. Actualizando...${NC}"
    cd tudestino
    git pull origin main
else
    echo -e "${BLUE}Clonando repositorio...${NC}"
    git clone https://qipuh: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@github.com/qipuh/tudestino.git
    cd tudestino
fi

echo -e "${GREEN}✓ Repositorio actualizado${NC}"

# ==============================================
# PASO 4: Configurar Variables de Entorno
# ==============================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}PASO 4: Configurar Variables de Entorno${NC}"
echo -e "${GREEN}================================================${NC}"

# Generar JWT Secret si no existe
if [ ! -f "apps/api/.env" ]; then
    echo -e "${BLUE}Generando JWT Secret...${NC}"
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

    cp apps/api/.env.production apps/api/.env
    sed -i "s/tu-clave-super-secreta-jwt-cambiala-en-produccion-2026/$JWT_SECRET/g" apps/api/.env
    echo -e "${GREEN}✓ JWT Secret generado${NC}"
else
    echo -e "${YELLOW}apps/api/.env ya existe. Omitiendo...${NC}"
fi

# Copiar .env para web y admin si no existen
if [ ! -f "apps/web/.env" ]; then
    cp apps/web/.env.production apps/web/.env
    echo -e "${GREEN}✓ apps/web/.env creado${NC}"
fi

if [ ! -f "apps/admin/.env" ]; then
    cp apps/admin/.env.production apps/admin/.env
    echo -e "${GREEN}✓ apps/admin/.env creado${NC}"
fi

echo -e "${YELLOW}Recuerda configurar:${NC}"
echo "  - apps/api/.env: SMTP_USER, SMTP_PASS, STRIPE_SECRET_KEY"
echo "  - apps/web/.env: VITE_GOOGLE_MAPS_API_KEY, VITE_CULQI_PUBLIC_KEY"

# ==============================================
# PASO 5: Instalar y Construir
# ==============================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}PASO 5: Instalar Dependencias y Construir${NC}"
echo -e "${GREEN}================================================${NC}"

npm install
npm run build:web
npm run build:admin

echo -e "${GREEN}✓ Build completado${NC}"

# ==============================================
# PASO 6: Base de Datos
# ==============================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}PASO 6: Configurar Base de Datos${NC}"
echo -e "${GREEN}================================================${NC}"

# Ejecutar seeds
npm run seed:mysql || echo -e "${YELLOW}Seeds ya ejecutados o error${NC}"

echo -e "${GREEN}✓ Base de datos configurada${NC}"

# ==============================================
# PASO 7: Instalar phpMyAdmin
# ==============================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}PASO 7: Instalar phpMyAdmin${NC}"
echo -e "${GREEN}================================================${NC}"

if [ ! -d "/usr/share/phpmyadmin" ]; then
    chmod +x install-phpmyadmin.sh
    ./install-phpmyadmin.sh
else
    echo -e "${YELLOW}phpMyAdmin ya instalado${NC}"
fi

# ==============================================
# PASO 8: Configurar Nginx
# ==============================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}PASO 8: Configurar Nginx${NC}"
echo -e "${GREEN}================================================${NC}"

# Crear directorio de logs
mkdir -p /var/log/tudestino

# Copiar configuración
cp nginx-ambos-dominios.conf /etc/nginx/sites-available/tudestino

# Crear symlink
ln -sf /etc/nginx/sites-available/tudestino /etc/nginx/sites-enabled/

# Eliminar default
rm -f /etc/nginx/sites-enabled/default

# Verificar
nginx -t

# Recargar
systemctl reload nginx

echo -e "${GREEN}✓ Nginx configurado${NC}"

# ==============================================
# PASO 9: SSL
# ==============================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}PASO 9: Certificados SSL${NC}"
echo -e "${GREEN}================================================${NC}"

echo -e "${YELLOW}IMPORTANTE: Solo continúa si los DNS están propagados${NC}"
echo "Verifica con: dig tudestino.pe y dig tudestino.lat"
echo ""
read -p "¿Los DNS están propagados? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[SsYy]$ ]]; then
    chmod +x install-ssl.sh
    ./install-ssl.sh
else
    echo -e "${YELLOW}Omitiendo SSL. Ejecuta ./install-ssl.sh cuando los DNS estén listos${NC}"
fi

# ==============================================
# PASO 10: Iniciar con PM2
# ==============================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}PASO 10: Iniciar Aplicación${NC}"
echo -e "${GREEN}================================================${NC}"

# Detener PM2 si está corriendo
pm2 delete all 2>/dev/null || true

# Iniciar
pm2 start ecosystem.config.cjs

# Guardar
pm2 save

# Startup
pm2 startup systemd -u root --hp /root | tail -n 1 | bash

echo -e "${GREEN}✓ Aplicación iniciada${NC}"

# ==============================================
# RESUMEN FINAL
# ==============================================

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}¡DESPLIEGUE COMPLETADO!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}Estado de servicios:${NC}"
pm2 status
echo ""
echo -e "${BLUE}URLs disponibles:${NC}"
echo "  Web:        https://tudestino.pe"
echo "  Web:        https://tudestino.lat"
echo "  API:        https://api.tudestino.pe"
echo "  API:        https://api.tudestino.lat"
echo "  Admin:      https://admin.tudestino.pe"
echo "  Admin:      https://admin.tudestino.lat"
echo "  phpMyAdmin: https://db.tudestino.pe"
echo ""
echo -e "${BLUE}Credenciales phpMyAdmin:${NC}"
echo "  Usuario: adapptika"
echo "  Contraseña: 3@monitoSS"
echo ""
echo -e "${YELLOW}Comandos útiles:${NC}"
echo "  pm2 logs                 - Ver logs"
echo "  pm2 restart tudestino-api - Reiniciar API"
echo "  nginx -t                 - Verificar Nginx"
echo "  certbot certificates     - Ver SSL"
echo ""
