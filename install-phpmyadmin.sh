#!/bin/bash

# Script de instalación de phpMyAdmin para TuDestino
# Usuario: adapptika
# Contraseña: 3@monitoSS
# URL: https://db.tudestino.pe

set -e

echo "============================================"
echo "Instalación de phpMyAdmin - TuDestino"
echo "============================================"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Este script debe ejecutarse como root${NC}"
    echo "Usa: sudo ./install-phpmyadmin.sh"
    exit 1
fi

# Variables de configuración
PHPMYADMIN_USER="adapptika"
PHPMYADMIN_PASS="3@monitoSS"
MYSQL_ROOT_PASS="TuDestino2026!Secure"

# ==============================================
# 1. Actualizar el sistema
# ==============================================

echo -e "${GREEN}[1/8] Actualizando el sistema...${NC}"
apt update

# ==============================================
# 2. Instalar PHP y extensiones necesarias
# ==============================================

echo -e "${GREEN}[2/8] Instalando PHP y extensiones...${NC}"

# Detectar versión de Ubuntu/Debian para instalar la versión correcta de PHP
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
fi

# Instalar PHP (versión 8.1 o superior recomendada)
apt install -y php php-fpm php-mysql php-mbstring php-zip php-gd php-json php-curl php-xml php-intl

# Detectar la versión de PHP instalada
PHP_VERSION=$(php -r "echo PHP_MAJOR_VERSION.'.'.PHP_MINOR_VERSION;")
echo -e "${GREEN}PHP $PHP_VERSION instalado${NC}"

# ==============================================
# 3. Descargar phpMyAdmin
# ==============================================

echo -e "${GREEN}[3/8] Descargando phpMyAdmin...${NC}"

# Crear directorio temporal
cd /tmp

# Descargar la última versión estable de phpMyAdmin
# Puedes actualizar esta versión según necesites
PHPMYADMIN_VERSION="5.2.1"
wget https://files.phpmyadmin.net/phpMyAdmin/${PHPMYADMIN_VERSION}/phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages.tar.gz

# Extraer
tar xzf phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages.tar.gz

# Mover a ubicación final
rm -rf /usr/share/phpmyadmin 2>/dev/null || true
mv phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages /usr/share/phpmyadmin

# Limpiar
rm phpMyAdmin-${PHPMYADMIN_VERSION}-all-languages.tar.gz

# ==============================================
# 4. Configurar phpMyAdmin
# ==============================================

echo -e "${GREEN}[4/8] Configurando phpMyAdmin...${NC}"

# Crear directorio temporal para phpMyAdmin
mkdir -p /usr/share/phpmyadmin/tmp
chmod 777 /usr/share/phpmyadmin/tmp

# Crear configuración
cp /usr/share/phpmyadmin/config.sample.inc.php /usr/share/phpmyadmin/config.inc.php

# Generar blowfish secret
BLOWFISH_SECRET=$(openssl rand -base64 32)

# Configurar config.inc.php
cat > /usr/share/phpmyadmin/config.inc.php << EOF
<?php
/**
 * phpMyAdmin configuration for TuDestino
 */

declare(strict_types=1);

/* Blowfish secret for cookie authentication */
\$cfg['blowfish_secret'] = '$BLOWFISH_SECRET';

/* Server configuration */
\$i = 0;
\$i++;
\$cfg['Servers'][\$i]['auth_type'] = 'cookie';
\$cfg['Servers'][\$i]['host'] = 'localhost';
\$cfg['Servers'][\$i]['compress'] = false;
\$cfg['Servers'][\$i]['AllowNoPassword'] = false;

/* Directories for saving/uploading files */
\$cfg['UploadDir'] = '';
\$cfg['SaveDir'] = '';
\$cfg['TempDir'] = '/usr/share/phpmyadmin/tmp';

/* Security */
\$cfg['LoginCookieValidity'] = 3600; // 1 hora
\$cfg['LoginCookieStore'] = 3600;

/* Interface */
\$cfg['DefaultLang'] = 'es';
\$cfg['DefaultConnectionCollation'] = 'utf8mb4_unicode_ci';

/* Performance */
\$cfg['MaxRows'] = 100;
\$cfg['RowActionLinks'] = 'left';

/* Disable some features for security */
\$cfg['ShowPhpInfo'] = false;
\$cfg['ShowServerInfo'] = false;
\$cfg['ShowChgPassword'] = true;
\$cfg['ShowCreateDb'] = false;
EOF

# Establecer permisos
chown -R www-data:www-data /usr/share/phpmyadmin
chmod 644 /usr/share/phpmyadmin/config.inc.php

# ==============================================
# 5. Crear usuario MySQL para phpMyAdmin
# ==============================================

echo -e "${GREEN}[5/8] Creando usuario MySQL 'adapptika'...${NC}"

# Crear usuario en MySQL
mysql -u root -p"$MYSQL_ROOT_PASS" << MYSQL_SCRIPT
-- Eliminar usuario si existe
DROP USER IF EXISTS '$PHPMYADMIN_USER'@'localhost';

-- Crear nuevo usuario
CREATE USER '$PHPMYADMIN_USER'@'localhost' IDENTIFIED BY '$PHPMYADMIN_PASS';

-- Otorgar todos los privilegios
GRANT ALL PRIVILEGES ON *.* TO '$PHPMYADMIN_USER'@'localhost' WITH GRANT OPTION;

-- Privilegios específicos para phpMyAdmin
GRANT SELECT, INSERT, UPDATE, DELETE ON mysql.* TO '$PHPMYADMIN_USER'@'localhost';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Mostrar usuario creado
SELECT User, Host FROM mysql.user WHERE User = '$PHPMYADMIN_USER';
MYSQL_SCRIPT

echo -e "${GREEN}Usuario '$PHPMYADMIN_USER' creado correctamente${NC}"

# ==============================================
# 6. Verificar configuración de PHP-FPM
# ==============================================

echo -e "${GREEN}[6/8] Verificando PHP-FPM...${NC}"

# Asegurar que PHP-FPM esté corriendo
systemctl start php${PHP_VERSION}-fpm
systemctl enable php${PHP_VERSION}-fpm

# Verificar estado
if systemctl is-active --quiet php${PHP_VERSION}-fpm; then
    echo -e "${GREEN}PHP-FPM está corriendo${NC}"
else
    echo -e "${RED}Error: PHP-FPM no está corriendo${NC}"
    exit 1
fi

# ==============================================
# 7. Nota sobre configuración de Nginx
# ==============================================

echo -e "${GREEN}[7/8] Verificando configuración de Nginx...${NC}"

# El archivo nginx-tudestino.conf ya incluye la configuración para phpMyAdmin
# Solo necesitamos verificar que esté cargado

if [ -f /etc/nginx/sites-enabled/tudestino ]; then
    echo -e "${GREEN}Configuración de Nginx encontrada${NC}"

    # Verificar que la versión de PHP en Nginx sea correcta
    echo -e "${YELLOW}Verificando versión de PHP en Nginx...${NC}"
    if grep -q "php${PHP_VERSION}-fpm.sock" /etc/nginx/sites-available/tudestino; then
        echo -e "${GREEN}Versión de PHP correcta en Nginx${NC}"
    else
        echo -e "${YELLOW}Actualizando versión de PHP en configuración de Nginx...${NC}"
        sed -i "s/php[0-9]\.[0-9]-fpm\.sock/php${PHP_VERSION}-fpm.sock/g" /etc/nginx/sites-available/tudestino
    fi

    # Verificar configuración
    nginx -t

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Recargando Nginx...${NC}"
        systemctl reload nginx
    else
        echo -e "${RED}Error en configuración de Nginx${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}ADVERTENCIA: Configuración de Nginx no encontrada${NC}"
    echo -e "${YELLOW}Asegúrate de copiar nginx-tudestino.conf a /etc/nginx/sites-available/tudestino${NC}"
fi

# ==============================================
# 8. Verificación final
# ==============================================

echo -e "${GREEN}[8/8] Verificación final...${NC}"

# Verificar que los archivos existen
if [ -f /usr/share/phpmyadmin/index.php ]; then
    echo -e "${GREEN}✓ phpMyAdmin instalado correctamente${NC}"
else
    echo -e "${RED}✗ Error: Archivos de phpMyAdmin no encontrados${NC}"
    exit 1
fi

# Verificar permisos
if [ -w /usr/share/phpmyadmin/tmp ]; then
    echo -e "${GREEN}✓ Permisos correctos${NC}"
else
    echo -e "${RED}✗ Error: Permisos incorrectos${NC}"
    exit 1
fi

# ==============================================
# Resumen
# ==============================================

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}phpMyAdmin instalado correctamente${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Credenciales de acceso:${NC}"
echo "  Usuario: $PHPMYADMIN_USER"
echo "  Contraseña: $PHPMYADMIN_PASS"
echo ""
echo -e "${YELLOW}URLs de acceso:${NC}"
echo "  HTTP: http://db.tudestino.pe (redirigirá a HTTPS)"
echo "  HTTPS: https://db.tudestino.pe (después de instalar SSL)"
echo ""
echo -e "${YELLOW}Acceso root de MySQL:${NC}"
echo "  Usuario: root"
echo "  Contraseña: $MYSQL_ROOT_PASS"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "  1. Asegúrate de que el DNS para db.tudestino.pe esté configurado"
echo "  2. Ejecuta ./install-ssl.sh para obtener certificado SSL"
echo "  3. Accede a https://db.tudestino.pe"
echo ""
echo -e "${GREEN}Servicios corriendo:${NC}"
systemctl status php${PHP_VERSION}-fpm --no-pager -l 0
echo ""
systemctl status nginx --no-pager -l 0
echo ""
echo -e "${GREEN}¡Instalación completada!${NC}"
