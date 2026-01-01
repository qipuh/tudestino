#!/bin/bash

# Script de configuración del servidor VPS para TuDestino
# Servidor: 161.132.38.151
# Usuario: root

set -e  # Detener en caso de error

echo "==================================="
echo "Configuración del Servidor TuDestino"
echo "==================================="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Actualizar el sistema
echo -e "${GREEN}[1/10] Actualizando el sistema...${NC}"
apt update && apt upgrade -y

# 2. Instalar dependencias básicas
echo -e "${GREEN}[2/10] Instalando dependencias básicas...${NC}"
apt install -y curl wget git ufw fail2ban

# 3. Configurar firewall
echo -e "${GREEN}[3/10] Configurando firewall...${NC}"
ufw --force enable
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 3000/tcp    # API (temporal, luego se cierra)
ufw status

# 4. Instalar Node.js 20.x LTS
echo -e "${GREEN}[4/10] Instalando Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node --version
npm --version

# 5. Instalar MySQL
echo -e "${GREEN}[5/10] Instalando MySQL...${NC}"
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# Configurar MySQL
echo -e "${YELLOW}Configurando MySQL...${NC}"
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'TuDestino2026!Secure';"
mysql -e "CREATE DATABASE IF NOT EXISTS tudestino CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "FLUSH PRIVILEGES;"

# 6. Instalar Nginx
echo -e "${GREEN}[6/10] Instalando Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

# 7. Instalar PM2
echo -e "${GREEN}[7/10] Instalando PM2...${NC}"
npm install -g pm2
pm2 startup systemd -u root --hp /root

# 8. Configurar Git
echo -e "${GREEN}[8/10] Configurando Git...${NC}"
git config --global user.name "qipuh"
git config --global user.email "admin@tudestino.com"

# Guardar credenciales de GitHub
git config --global credential.helper store

# 9. Crear directorios del proyecto
echo -e "${GREEN}[9/10] Creando estructura de directorios...${NC}"
mkdir -p /var/www/tudestino
mkdir -p /var/log/tudestino
mkdir -p /var/www/tudestino/uploads

# 10. Instalar Certbot para SSL
echo -e "${GREEN}[10/10] Instalando Certbot para SSL...${NC}"
apt install -y certbot python3-certbot-nginx

echo ""
echo -e "${GREEN}==================================="
echo "Configuración básica completada!"
echo "===================================${NC}"
echo ""
echo "Próximos pasos manuales:"
echo "1. Clonar el repositorio del proyecto"
echo "2. Configurar los archivos .env"
echo "3. Instalar dependencias del proyecto"
echo "4. Configurar Nginx con el dominio"
echo "5. Obtener certificado SSL"
echo "6. Iniciar aplicaciones con PM2"
echo ""
echo "Ver archivo DEPLOYMENT.md para instrucciones detalladas"
