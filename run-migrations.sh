#!/bin/bash

# Script para ejecutar migraciones en producción
# Ejecutar: bash run-migrations.sh

set -e

echo "===================================="
echo "Ejecutando Migraciones - TuDestino"
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
    exit 1
fi

cd $PROJECT_DIR

# Cargar variables de entorno
if [ -f "apps/api/.env" ]; then
    source apps/api/.env
else
    echo -e "${RED}Error: apps/api/.env no existe${NC}"
    exit 1
fi

# Verificar que tenemos las credenciales de DB
if [ -z "$DB_HOST" ] || [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
    echo -e "${RED}Error: Variables de DB no configuradas en .env${NC}"
    exit 1
fi

MYSQL_PWD=$DB_PASSWORD

echo -e "${GREEN}Base de datos: $DB_NAME${NC}"
echo -e "${GREEN}Host: $DB_HOST${NC}"
echo ""

# Ejecutar migración principal
echo -e "${GREEN}Ejecutando migración 2025-01-20-session-fixes.sql...${NC}"
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME < apps/api/migrations/2025-01-20-session-fixes.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migración ejecutada exitosamente${NC}"
else
    echo -e "${RED}✗ Error al ejecutar migración${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}===================================="
echo "¡Migraciones completadas!"
echo "====================================${NC}"
