#!/bin/bash

echo "=========================================="
echo "   ACTUALIZAR SERVIDOR - TuDestino"
echo "=========================================="
echo ""

SERVER="root@74.208.69.243"
API_PATH="/var/www/vhosts/tudestino.qipuh.com/httpdocs/api"

echo "[1/4] Transfiriendo archivos actualizados..."
scp apps/api/.env.production $SERVER:$API_PATH/.env
scp apps/api/ecosystem.config.cjs $SERVER:$API_PATH/

echo ""
echo "[2/4] Verificando conexión a base de datos..."
ssh $SERVER "mysql -h 127.0.0.1 -u admin_tudestino -p'3@monitoSS' admin_tudestino -e 'SELECT 1;'"

if [ $? -eq 0 ]; then
    echo "✅ Conexión a base de datos correcta"
else
    echo "❌ Error de conexión a base de datos"
    exit 1
fi

echo ""
echo "[3/4] Reiniciando API con PM2..."
ssh $SERVER "cd $API_PATH && pm2 delete tudestino-api && pm2 start ecosystem.config.cjs --env production && pm2 save"

echo ""
echo "[4/4] Verificando estado de la API..."
sleep 3
ssh $SERVER "pm2 logs tudestino-api --lines 10 --nostream"

echo ""
echo "=========================================="
echo "   PRÓXIMO PASO: CONFIGURAR NGINX"
echo "=========================================="
echo ""
echo "1. Copiar archivo de configuración al servidor:"
echo "   scp nginx-api.conf $SERVER:/etc/nginx/sites-available/api.tudestino.conf"
echo "   scp nginx-web.conf $SERVER:/etc/nginx/sites-available/tudestino.conf"
echo ""
echo "2. Crear symlinks:"
echo "   ssh $SERVER 'ln -sf /etc/nginx/sites-available/api.tudestino.conf /etc/nginx/sites-enabled/'"
echo "   ssh $SERVER 'ln -sf /etc/nginx/sites-available/tudestino.conf /etc/nginx/sites-enabled/'"
echo ""
echo "3. Probar y recargar Nginx:"
echo "   ssh $SERVER 'nginx -t && systemctl reload nginx'"
echo ""
echo "4. Verificar que funcione:"
echo "   curl http://api.tudestino.qipuh.com/health"
echo "   curl http://tudestino.qipuh.com"
echo ""
