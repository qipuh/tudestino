#!/bin/bash

# Script para desinstalar Webuzo y limpiar el servidor
# ADVERTENCIA: Este script eliminará Webuzo y todos sus datos

set -e

echo "============================================"
echo "Desinstalación de Webuzo - TuDestino"
echo "============================================"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Este script debe ejecutarse como root${NC}"
    echo "Usa: sudo ./remove-webuzo.sh"
    exit 1
fi

echo ""
echo -e "${RED}ADVERTENCIA: Este script eliminará Webuzo completamente${NC}"
echo -e "${RED}Esto incluye Apache, MySQL de Webuzo, y todos los datos del panel${NC}"
echo ""
read -p "¿Estás seguro de que quieres continuar? (escribe 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
    echo -e "${YELLOW}Operación cancelada${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}[1/8] Deteniendo servicios de Webuzo...${NC}"

# Detener servicios de Webuzo
systemctl stop httpd 2>/dev/null || true
systemctl stop webuzo 2>/dev/null || true
systemctl stop lxd 2>/dev/null || true
systemctl stop mysqld 2>/dev/null || true

# Deshabilitar servicios
systemctl disable httpd 2>/dev/null || true
systemctl disable webuzo 2>/dev/null || true
systemctl disable lxd 2>/dev/null || true

echo ""
echo -e "${GREEN}[2/8] Ejecutando desinstalador oficial de Webuzo...${NC}"

# Desinstalar Webuzo usando el script oficial
if [ -f /usr/local/webuzo/enduser/webuzo/install.php ]; then
    wget -O /root/uninstall_webuzo.sh https://webuzo.com/uninstall.sh
    chmod +x /root/uninstall_webuzo.sh
    echo -e "${YELLOW}Ejecutando desinstalador oficial...${NC}"
    /root/uninstall_webuzo.sh -y || true
else
    echo -e "${YELLOW}Webuzo no encontrado en la ubicación estándar${NC}"
fi

echo ""
echo -e "${GREEN}[3/8] Eliminando archivos y directorios de Webuzo...${NC}"

# Eliminar directorios de Webuzo
rm -rf /usr/local/webuzo 2>/dev/null || true
rm -rf /usr/local/apps 2>/dev/null || true
rm -rf /usr/local/emps 2>/dev/null || true
rm -rf /webuzo_backups 2>/dev/null || true
rm -rf /var/webuzo 2>/dev/null || true

# Eliminar archivos de configuración
rm -rf /etc/webuzo 2>/dev/null || true
rm -f /etc/cron.d/webuzo 2>/dev/null || true

echo ""
echo -e "${GREEN}[4/8] Eliminando Apache (viene con Webuzo)...${NC}"

# Desinstalar Apache si fue instalado por Webuzo
if command -v httpd &> /dev/null; then
    systemctl stop httpd 2>/dev/null || true
    systemctl disable httpd 2>/dev/null || true
    apt remove --purge -y apache2 apache2-utils 2>/dev/null || true
    yum remove -y httpd 2>/dev/null || true
fi

# Limpiar configuraciones de Apache
rm -rf /etc/httpd 2>/dev/null || true
rm -rf /etc/apache2 2>/dev/null || true
rm -rf /var/www/html/index.html 2>/dev/null || true

echo ""
echo -e "${GREEN}[5/8] Limpiando MySQL de Webuzo...${NC}"

# Si Webuzo instaló su propio MySQL, lo eliminamos
# NOTA: Esto NO afectará el MySQL que instalamos nosotros
systemctl stop mysqld 2>/dev/null || true
systemctl stop webuzo-mysql 2>/dev/null || true

# Eliminar bases de datos de Webuzo
mysql -u root -pTuDestino2026!Secure -e "DROP DATABASE IF EXISTS webuzo;" 2>/dev/null || true
mysql -u root -pTuDestino2026!Secure -e "DROP DATABASE IF EXISTS softaculous;" 2>/dev/null || true

echo ""
echo -e "${GREEN}[6/8] Limpiando usuarios y grupos de Webuzo...${NC}"

# Eliminar usuarios creados por Webuzo
userdel -r webuzo 2>/dev/null || true
groupdel webuzo 2>/dev/null || true

echo ""
echo -e "${GREEN}[7/8] Limpiando archivos residuales...${NC}"

# Limpiar logs
rm -rf /var/log/webuzo 2>/dev/null || true
rm -rf /var/log/httpd 2>/dev/null || true

# Limpiar archivos temporales
rm -rf /tmp/webuzo* 2>/dev/null || true
rm -rf /tmp/softaculous* 2>/dev/null || true

# Limpiar scripts de instalación
rm -f /root/install_webuzo.sh 2>/dev/null || true
rm -f /root/uninstall_webuzo.sh 2>/dev/null || true

echo ""
echo -e "${GREEN}[8/8] Verificando que Nginx esté funcionando...${NC}"

# Asegurar que Nginx esté activo
if command -v nginx &> /dev/null; then
    systemctl start nginx
    systemctl enable nginx

    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✓ Nginx está corriendo correctamente${NC}"
    else
        echo -e "${RED}✗ Nginx no está corriendo. Iniciando...${NC}"
        systemctl restart nginx
    fi
else
    echo -e "${YELLOW}Nginx no está instalado. Ejecuta server-setup.sh${NC}"
fi

# Verificar que el puerto 80 y 443 estén disponibles
echo ""
echo -e "${GREEN}Verificando puertos...${NC}"
netstat -tlnp | grep -E ':80|:443' || echo "Puertos 80 y 443 disponibles"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Webuzo desinstalado correctamente${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Verificar que Nginx esté funcionando: systemctl status nginx"
echo "2. Verificar que MySQL esté funcionando: systemctl status mysql"
echo "3. Continuar con la instalación de TuDestino"
echo ""
echo -e "${GREEN}Sistema limpio y listo para TuDestino${NC}"
