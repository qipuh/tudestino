#!/bin/bash

# Script para desplegar cambios y ejecutar migración
# Ejecutar como: bash deploy-migration.sh

set -e

echo "======================================"
echo "Despliegue de cambios y migración"
echo "======================================"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar SSH
echo -e "${BLUE}Conectando al servidor...${NC}"

ssh root@161.132.38.151 << 'ENDSSH'
  cd /var/www/tudestino

  echo "Actualizando código..."
  git pull origin main

  echo "Instalando dependencias..."
  npm install

  echo "Construyendo web..."
  npm run build:web

  echo "Ejecutando migración..."
  node apps/api/src/migrations/add-hotel-subtype-category.js

  echo "Reiniciando API..."
  pm2 restart tudestino-api

  echo "¡Listo!"
ENDSSH

echo -e "${GREEN}Despliegue completado${NC}"
