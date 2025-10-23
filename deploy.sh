#!/bin/bash

echo "=========================================="
echo "   DESPLIEGUE TUDESTINO - PRODUCCION"
echo "=========================================="
echo ""
echo "Servidor: 74.208.69.243"
echo "Usuario: root"
echo "Password: wOI6YzQ9"
echo "Destino: /var/www/vhosts/tudestino.qipuh.com/httpdocs"
echo ""

# Crear directorio temporal
echo "[1/6] Creando directorio temporal..."
rm -rf deploy-temp
mkdir -p deploy-temp/api
mkdir -p deploy-temp/web
mkdir -p deploy-temp/shared

# Copiar API (excluyendo node_modules y archivos innecesarios)
echo "[2/6] Copiando archivos de API..."
rsync -av --exclude='node_modules' --exclude='.git' --exclude='*.log' \
    apps/api/ deploy-temp/api/
cp apps/api/.env.production deploy-temp/api/.env

# Copiar Web (solo dist)
echo "[3/6] Copiando archivos de Web (dist)..."
cp -r apps/web/dist/* deploy-temp/web/

# Copiar shared package
echo "[4/6] Copiando paquete compartido..."
rsync -av --exclude='node_modules' --exclude='.git' \
    packages/shared/ deploy-temp/shared/

# Crear package.json para shared en producción
echo "[5/6] Preparando archivos de configuración..."
cat > deploy-temp/api/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'tudestino-api',
    script: 'src/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

echo ""
echo "[6/6] Archivos preparados en: deploy-temp/"
echo ""
echo "=========================================="
echo "   TRANSFERENCIA AL SERVIDOR"
echo "=========================================="
echo ""
echo "Opción 1 - Transferir con SCP:"
echo "  scp -r deploy-temp/api/* root@74.208.69.243:/var/www/vhosts/tudestino.qipuh.com/httpdocs/api/"
echo "  scp -r deploy-temp/web/* root@74.208.69.243:/var/www/vhosts/tudestino.qipuh.com/httpdocs/"
echo ""
echo "Opción 2 - Transferir con RSYNC (recomendado):"
echo "  rsync -avz -e ssh deploy-temp/api/ root@74.208.69.243:/var/www/vhosts/tudestino.qipuh.com/httpdocs/api/"
echo "  rsync -avz -e ssh deploy-temp/web/ root@74.208.69.243:/var/www/vhosts/tudestino.qipuh.com/httpdocs/"
echo ""
echo "Comandos en el servidor después de transferir:"
echo "  cd /var/www/vhosts/tudestino.qipuh.com/httpdocs/api"
echo "  npm install --production"
echo "  npm install -g pm2"
echo "  pm2 start ecosystem.config.js"
echo "  pm2 save"
echo "  pm2 startup"
echo ""
