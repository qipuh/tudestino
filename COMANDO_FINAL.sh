#!/bin/bash

# EJECUTA ESTE SCRIPT EN EL SERVIDOR
# ssh root@74.208.69.243 'bash -s' < COMANDO_FINAL.sh

echo "=========================================="
echo "   CONFIGURACIÓN FINAL - API PROXY"
echo "=========================================="

# Crear configuración del proxy para la API
echo "Creando vhost.conf para api.tudestino.qipuh.com..."
cat > /var/www/vhosts/system/api.tudestino.qipuh.com/conf/vhost.conf << 'EOF'
ProxyPreserveHost On
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/
ProxyPass /socket.io/ ws://localhost:3000/socket.io/
ProxyPassReverse /socket.io/ ws://localhost:3000/socket.io/
EOF

echo "✅ Archivo vhost.conf creado"

# Reconstruir configuración de Plesk
echo ""
echo "Reconstruyendo configuración de Plesk..."
/usr/sbin/plesk repair web api.tudestino.qipuh.com

echo "✅ Configuración reconstruida"

# Recargar Apache
echo ""
echo "Recargando Apache..."
systemctl reload apache2

echo "✅ Apache recargado"

# Probar la API
echo ""
echo "=========================================="
echo "   PROBANDO LA API"
echo "=========================================="
echo ""
echo "Prueba 1: Localhost"
curl -s http://localhost:3000/health && echo ""

echo ""
echo "Prueba 2: Dominio api.tudestino.qipuh.com"
curl -s http://api.tudestino.qipuh.com/health && echo ""

echo ""
echo "=========================================="
echo "   ✅ CONFIGURACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo "La API ahora está disponible en:"
echo "  http://api.tudestino.qipuh.com"
echo ""
echo "Próximo paso: Configurar SSL (HTTPS)"
echo "  certbot --apache -d api.tudestino.qipuh.com"
echo ""
