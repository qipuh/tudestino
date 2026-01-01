#!/bin/bash

# Script de despliegue rápido para TuDestino
# Ejecutar en el servidor después de la configuración inicial

set -e

echo "===================================="
echo "Despliegue Rápido - TuDestino"
echo "===================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/var/www/tudestino"

# Verificar que estamos en el directorio correcto
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: Directorio $PROJECT_DIR no existe${NC}"
    echo "Primero clona el repositorio con:"
    echo "cd /var/www && git clone https://qipuh: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@github.com/qipuh/tudestino.git"
    exit 1
fi

cd $PROJECT_DIR

# 1. Pull últimos cambios
echo -e "${GREEN}[1/7] Obteniendo últimos cambios...${NC}"
git pull origin main

# 2. Instalar dependencias
echo -e "${GREEN}[2/7] Instalando dependencias...${NC}"
npm install

# 3. Build Web
echo -e "${GREEN}[3/7] Construyendo Web Frontend...${NC}"
npm run build:web

# 4. Build Admin
echo -e "${GREEN}[4/7] Construyendo Admin Frontend...${NC}"
npm run build:admin

# 5. Verificar archivos .env
echo -e "${GREEN}[5/7] Verificando archivos .env...${NC}"
if [ ! -f "apps/api/.env" ]; then
    echo -e "${YELLOW}Advertencia: apps/api/.env no existe. Copiando desde .env.production${NC}"
    cp apps/api/.env.production apps/api/.env
    echo -e "${RED}IMPORTANTE: Edita apps/api/.env con tus valores reales${NC}"
fi

if [ ! -f "apps/web/.env" ]; then
    echo -e "${YELLOW}Advertencia: apps/web/.env no existe. Copiando desde .env.production${NC}"
    cp apps/web/.env.production apps/web/.env
fi

if [ ! -f "apps/admin/.env" ]; then
    echo -e "${YELLOW}Advertencia: apps/admin/.env no existe. Copiando desde .env.production${NC}"
    cp apps/admin/.env.production apps/admin/.env
fi

# 6. Reiniciar PM2
echo -e "${GREEN}[6/7] Reiniciando aplicación con PM2...${NC}"
if pm2 list | grep -q "tudestino-api"; then
    echo "Reiniciando aplicación existente..."
    pm2 restart tudestino-api
else
    echo "Iniciando aplicación por primera vez..."
    pm2 start ecosystem.config.cjs
    pm2 save
fi

# 7. Verificar estado
echo -e "${GREEN}[7/7] Verificando estado...${NC}"
pm2 status

echo ""
echo -e "${GREEN}===================================="
echo "¡Despliegue completado!"
echo "====================================${NC}"
echo ""
echo "Ver logs: pm2 logs tudestino-api"
echo "Estado: pm2 status"
echo ""
