#!/bin/bash

# Script de verificación post-deployment para TuDestino
# Verifica que todos los servicios estén funcionando correctamente

SERVER_IP="217.154.179.113"
DOMAIN="tudestino.lat"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Verificando deployment de TuDestino...${NC}"
echo ""

# Función para verificar servicios remotos
check_remote_service() {
    local service=$1
    local command=$2
    
    echo -n "Verificando $service... "
    if ssh root@$SERVER_IP "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FALLO${NC}"
        return 1
    fi
}

# Función para verificar URLs
check_url() {
    local url=$1
    local expected_status=${2:-200}
    
    echo -n "Verificando $url... "
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_status"; then
        echo -e "${GREEN}✅ OK (HTTP $expected_status)${NC}"
        return 0
    else
        status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
        echo -e "${RED}❌ FALLO (HTTP $status)${NC}"
        return 1
    fi
}

echo -e "${YELLOW}📋 Verificando servicios del servidor...${NC}"

# Verificar servicios del sistema
check_remote_service "MySQL" "systemctl is-active mysql"
check_remote_service "Nginx" "systemctl is-active nginx"
check_remote_service "PM2" "pm2 status tudestino-api | grep -q online"

echo ""
echo -e "${YELLOW}🌐 Verificando conectividad web...${NC}"

# Verificar URLs principales
check_url "http://$DOMAIN" 301  # Debe redirigir a HTTPS
check_url "https://$DOMAIN" 200
check_url "https://www.$DOMAIN" 200
check_url "https://api.$DOMAIN/health" 200

echo ""
echo -e "${YELLOW}🔌 Verificando API endpoints...${NC}"

# Verificar endpoints específicos de la API
check_url "https://api.$DOMAIN/api/auth/check" 
check_url "https://$DOMAIN/api/health" 200

echo ""
echo -e "${YELLOW}📁 Verificando archivos estáticos...${NC}"

# Verificar que los archivos estáticos se sirvan correctamente
check_url "https://$DOMAIN/assets/" 
check_url "https://$DOMAIN/uploads/" 

echo ""
echo -e "${YELLOW}🗄️ Verificando base de datos...${NC}"

# Verificar conexión a la base de datos
check_remote_service "Conexión MySQL" "mysql -u tudestino -ptudestino123 -e 'SELECT 1' tudestino"
check_remote_service "Tablas creadas" "mysql -u tudestino -ptudestino123 -e 'SHOW TABLES' tudestino | grep -q users"

echo ""
echo -e "${YELLOW}📊 Estado de los servicios...${NC}"

# Obtener información detallada
echo "Estado de PM2:"
ssh root@$SERVER_IP "pm2 status" 2>/dev/null || echo "PM2 no responde"

echo ""
echo "Uso de memoria:"
ssh root@$SERVER_IP "free -h" 2>/dev/null || echo "No se puede obtener información de memoria"

echo ""
echo "Uso de disco:"
ssh root@$SERVER_IP "df -h /" 2>/dev/null || echo "No se puede obtener información de disco"

echo ""
echo -e "${YELLOW}🔒 Verificando SSL...${NC}"

# Verificar certificados SSL
echo -n "Certificado SSL para $DOMAIN... "
if openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    echo -e "${GREEN}✅ Válido${NC}"
else
    echo -e "${RED}❌ Inválido o no encontrado${NC}"
fi

echo -n "Certificado SSL para api.$DOMAIN... "
if openssl s_client -connect api.$DOMAIN:443 -servername api.$DOMAIN < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    echo -e "${GREEN}✅ Válido${NC}"
else
    echo -e "${RED}❌ Inválido o no encontrado${NC}"
fi

echo ""
echo -e "${YELLOW}📝 Logs recientes...${NC}"

echo "Últimas líneas del log de la API:"
ssh root@$SERVER_IP "pm2 logs tudestino-api --lines 5 --nostream" 2>/dev/null || echo "No se pueden obtener logs de PM2"

echo ""
echo "Últimas líneas del log de Nginx:"
ssh root@$SERVER_IP "tail -5 /var/log/nginx/error.log" 2>/dev/null || echo "No se pueden obtener logs de Nginx"

echo ""
echo -e "${BLUE}📋 Resumen de verificación completado${NC}"
echo -e "Si hay errores, revisa los logs detallados en el servidor"
echo -e "Comandos útiles:"
echo -e "• ssh root@$SERVER_IP"
echo -e "• pm2 logs tudestino-api"
echo -e "• systemctl status nginx"
echo -e "• tail -f /var/log/nginx/error.log"