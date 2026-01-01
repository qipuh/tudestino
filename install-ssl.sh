#!/bin/bash

# Script de instalación de certificados SSL para TuDestino
# Dominios: tudestino.pe y tudestino.lat
# Ejecutar DESPUÉS de que los DNS estén propagados

set -e

echo "============================================"
echo "Instalación de Certificados SSL - TuDestino"
echo "============================================"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Error: Este script debe ejecutarse como root${NC}"
    echo "Usa: sudo ./install-ssl.sh"
    exit 1
fi

# Verificar que Certbot está instalado
if ! command -v certbot &> /dev/null; then
    echo -e "${RED}Error: Certbot no está instalado${NC}"
    echo "Instalando Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Verificar que Nginx está instalado y corriendo
if ! systemctl is-active --quiet nginx; then
    echo -e "${RED}Error: Nginx no está corriendo${NC}"
    echo "Iniciando Nginx..."
    systemctl start nginx
fi

echo ""
echo -e "${YELLOW}IMPORTANTE: Verifica que los DNS estén propagados antes de continuar${NC}"
echo ""
echo "Verifica con estos comandos:"
echo "  dig tudestino.pe"
echo "  dig api.tudestino.pe"
echo "  dig tudestino.lat"
echo ""
echo -e "${YELLOW}Todos deben apuntar a: 161.132.38.151${NC}"
echo ""
read -p "¿Los DNS están propagados y apuntan correctamente? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo -e "${RED}Abortando. Espera a que los DNS se propaguen e intenta nuevamente.${NC}"
    exit 1
fi

# Email para notificaciones de Let's Encrypt
echo ""
read -p "Ingresa tu email para notificaciones de SSL: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}Error: El email es requerido${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Iniciando proceso de obtención de certificados SSL...${NC}"
echo ""

# ==============================================
# Certificados para tudestino.pe
# ==============================================

echo -e "${GREEN}[1/5] Obteniendo certificado para tudestino.pe y www.tudestino.pe...${NC}"
certbot certonly --nginx \
    -d tudestino.pe \
    -d www.tudestino.pe \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect

echo ""
echo -e "${GREEN}[2/5] Obteniendo certificado para api.tudestino.pe...${NC}"
certbot certonly --nginx \
    -d api.tudestino.pe \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect

echo ""
echo -e "${GREEN}[3/5] Obteniendo certificado para admin.tudestino.pe...${NC}"
certbot certonly --nginx \
    -d admin.tudestino.pe \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect

echo ""
echo -e "${GREEN}[4/5] Obteniendo certificado para db.tudestino.pe (phpMyAdmin)...${NC}"
certbot certonly --nginx \
    -d db.tudestino.pe \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect

# ==============================================
# Certificados para tudestino.lat
# ==============================================

echo ""
echo -e "${GREEN}[5/5] Obteniendo certificados para tudestino.lat...${NC}"

# tudestino.lat (dominio principal)
certbot certonly --nginx \
    -d tudestino.lat \
    -d www.tudestino.lat \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect

# api.tudestino.lat
certbot certonly --nginx \
    -d api.tudestino.lat \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect

# admin.tudestino.lat
certbot certonly --nginx \
    -d admin.tudestino.lat \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --redirect

# ==============================================
# Configurar renovación automática
# ==============================================

echo ""
echo -e "${GREEN}Configurando renovación automática de certificados...${NC}"

# Certbot ya configura un cron/systemd timer automáticamente
# Verificar que funciona
certbot renew --dry-run

# ==============================================
# Actualizar configuración de Nginx con SSL
# ==============================================

echo ""
echo -e "${GREEN}Aplicando configuración SSL en Nginx...${NC}"

# El archivo nginx-tudestino.conf ya tiene las directivas SSL comentadas
# Certbot las descomentará automáticamente

# Verificar configuración de Nginx
echo ""
echo -e "${GREEN}Verificando configuración de Nginx...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Configuración de Nginx válida. Recargando...${NC}"
    systemctl reload nginx
else
    echo -e "${RED}Error en la configuración de Nginx. Revisa manualmente.${NC}"
    exit 1
fi

# ==============================================
# Verificar certificados instalados
# ==============================================

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Certificados SSL instalados correctamente${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Certificados instalados:"
certbot certificates

echo ""
echo -e "${GREEN}URLs con HTTPS habilitado:${NC}"
echo ""
echo "Dominio Principal (.pe):"
echo "  - https://tudestino.pe"
echo "  - https://www.tudestino.pe"
echo "  - https://api.tudestino.pe"
echo "  - https://admin.tudestino.pe"
echo "  - https://db.tudestino.pe (phpMyAdmin)"
echo ""
echo "Dominio Alternativo (.lat):"
echo "  - https://tudestino.lat → redirige a .pe"
echo "  - https://www.tudestino.lat → redirige a .pe"
echo "  - https://api.tudestino.lat → redirige a .pe"
echo "  - https://admin.tudestino.lat → redirige a .pe"
echo ""
echo -e "${YELLOW}Renovación Automática:${NC}"
echo "Los certificados se renovarán automáticamente antes de expirar."
echo "Certbot ejecuta un timer que verifica diariamente."
echo ""
echo "Verificar timer: systemctl list-timers | grep certbot"
echo "Probar renovación: certbot renew --dry-run"
echo ""
echo -e "${GREEN}¡Configuración SSL completada!${NC}"
