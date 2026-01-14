#!/bin/bash

# Script para crear directorios de uploads faltantes
# Ejecutar en el servidor: bash create-upload-dirs.sh

set -e

echo "=================================="
echo "Creando directorios de uploads"
echo "=================================="

PROJECT_DIR="/var/www/tudestino"

if [ ! -d "$PROJECT_DIR" ]; then
    echo "Error: Directorio $PROJECT_DIR no existe"
    exit 1
fi

cd $PROJECT_DIR

# Crear directorios de uploads necesarios
echo "Creando directorios..."

mkdir -p apps/api/uploads/sliders
mkdir -p apps/api/uploads/attractions
mkdir -p apps/api/uploads/social
mkdir -p apps/api/uploads/users
mkdir -p apps/api/uploads/events
mkdir -p apps/api/uploads/tours

# Establecer permisos correctos
echo "Estableciendo permisos..."

chmod -R 755 apps/api/uploads

echo "Listado de directorios creados:"
ls -la apps/api/uploads/

echo ""
echo "=================================="
echo "¡Directorios creados exitosamente!"
echo "=================================="
