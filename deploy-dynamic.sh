#!/bin/bash

# Script de despliegue dinámico para TuDestino
# Uso: ./deploy-dynamic.sh [servidor] [dominio]

set -e

# Parámetros
SERVER=${1:-"161.132.48.238"}
DOMAIN=${2:-"tudestino.lat"}
USER="root"

echo "=========================================="
echo "   DESPLIEGUE DINÁMICO - TUDESTINO"
echo "=========================================="
echo "Servidor: $SERVER"
echo "Dominio: $DOMAIN"
echo "Usuario: $USER"
echo ""

# 1. Actualizar archivos .env con el dominio correcto
echo "[1/8] Actualizando archivos de configuración..."

# Actualizar .env.production de la API
cat > apps/api/.env.production << EOF
# Server
PORT=3001
NODE_ENV=production

# Database - MySQL (Producción)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino_prod
DB_USER=tudestino
DB_PASSWORD=tudestino123_prod

# JWT
JWT_SECRET=tudestino-production-super-secret-jwt-key-2025-secure
JWT_EXPIRES_IN=7d

# Frontend URLs - Producción
WEB_URL=https://$DOMAIN
ADMIN_URL=https://admin.$DOMAIN
API_URL=https://api.$DOMAIN

# CORS - Producción
CORS_ORIGIN=https://$DOMAIN,https://admin.$DOMAIN,https://api.$DOMAIN

# Socket.IO
CLIENT_URL=https://$DOMAIN

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF

# Actualizar .env.production de la Web
cat > apps/web/.env.production << EOF
# API URL - Producción
VITE_API_URL=https://api.$DOMAIN

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Culqi - Payment Gateway
VITE_CULQI_PUBLIC_KEY=pk_live_your_production_key

# PayPal - Payment Gateway
VITE_PAYPAL_CLIENT_ID=AeL-kN8KP_lLSEwVv5G7X8NvLy6-0im5F9MF0Qm7XqTr8QzVE8YF5xK3X5wZJfPxE0zME5F7p5P9C3Jv
EOF

echo "✅ Archivos de configuración actualizados"

# 2. Construir aplicación web
echo ""
echo "[2/8] Construyendo aplicación web..."
cd apps/web && npm run build && cd ../..
echo "✅ Aplicación web construida"

# 3. Copiar archivos al servidor
echo ""
echo "[3/8] Copiando archivos al servidor..."
scp apps/api/.env.production $USER@$SERVER:/var/www/tudestino/apps/api/.env
scp apps/web/.env.production $USER@$SERVER:/var/www/tudestino/apps/web/.env
scp apps/api/ecosystem.config.cjs $USER@$SERVER:/var/www/tudestino/apps/api/
rsync -av apps/web/dist/ $USER@$SERVER:/var/www/tudestino/apps/web/dist/
echo "✅ Archivos copiados"

# 4. Reiniciar servicios en el servidor
echo ""
echo "[4/8] Reiniciando servicios..."
ssh $USER@$SERVER "pm2 restart tudestino-api"
echo "✅ API reiniciada"

# 5. Verificar que todo funcione
echo ""
echo "[5/8] Verificando despliegue..."
ssh $USER@$SERVER "curl -s https://api.$DOMAIN/health || echo 'Error: API no responde'"
echo ""

echo "=========================================="
echo "   ✅ DESPLIEGUE COMPLETADO"
echo "=========================================="
echo ""
echo "URLs disponibles:"
echo "  🌐 Web: https://$DOMAIN"
echo "  🔌 API: https://api.$DOMAIN"
echo "  ❤️ Health: https://api.$DOMAIN/health"
echo ""