#!/bin/bash
# Script para descargar base de datos fresca del servidor

echo "📦 Descargando base de datos del servidor..."

# Reemplaza con tus credenciales
SERVER_USER="tu_usuario"
SERVER_HOST="tu_servidor.com"
DB_NAME="tudestino"
DB_USER="root"

# Descargar el backup
ssh ${SERVER_USER}@${SERVER_HOST} "mysqldump -u ${DB_USER} -p ${DB_NAME}" > apps/web/tudestino_fresh.sql

echo "✅ Descarga completa: apps/web/tudestino_fresh.sql"
echo ""
echo "Ahora importa con:"
echo "mysql -u root -p -e 'DROP DATABASE IF EXISTS tudestino; CREATE DATABASE tudestino;'"
echo "mysql -u root -p tudestino < apps/web/tudestino_fresh.sql"
