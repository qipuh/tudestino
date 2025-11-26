#!/bin/bash

# Script de troubleshooting para TuDestino
# Soluciona problemas comunes después del deployment

SERVER_IP="217.154.179.113"
DOMAIN="tudestino.lat"
PROJECT_PATH="/var/www/tudestino"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Script de troubleshooting para TuDestino${NC}"
echo ""

# Función para ejecutar comandos remotos
run_remote() {
    ssh root@$SERVER_IP "$1"
}

# Menú principal
while true; do
    echo -e "${YELLOW}Selecciona una opción:${NC}"
    echo "1. 🔄 Reiniciar todos los servicios"
    echo "2. 📊 Ver estado de todos los servicios"
    echo "3. 📝 Ver logs detallados"
    echo "4. 🗄️ Verificar y reparar base de datos"
    echo "5. 🔒 Renovar certificados SSL"
    echo "6. 🧹 Limpiar caché y rebuilds"
    echo "7. 🔧 Reparar permisos de archivos"
    echo "8. 🌐 Verificar configuración de Nginx"
    echo "9. 📦 Actualizar desde GitHub"
    echo "10. 🚀 Deployment completo (desde cero)"
    echo "0. ❌ Salir"
    echo ""
    read -p "Opción: " option

    case $option in
        1)
            echo -e "${YELLOW}🔄 Reiniciando todos los servicios...${NC}"
            run_remote "
                systemctl restart mysql
                systemctl restart nginx
                pm2 restart tudestino-api
                systemctl restart ufw
            "
            echo -e "${GREEN}✅ Servicios reiniciados${NC}"
            ;;
        2)
            echo -e "${YELLOW}📊 Estado de los servicios:${NC}"
            echo ""
            echo "MySQL:"
            run_remote "systemctl status mysql --no-pager -l"
            echo ""
            echo "Nginx:"
            run_remote "systemctl status nginx --no-pager -l"
            echo ""
            echo "PM2:"
            run_remote "pm2 status"
            echo ""
            echo "Firewall:"
            run_remote "ufw status"
            ;;
        3)
            echo -e "${YELLOW}📝 Logs detallados:${NC}"
            echo ""
            echo "=== PM2 Logs (API) ==="
            run_remote "pm2 logs tudestino-api --lines 20"
            echo ""
            echo "=== Nginx Error Log ==="
            run_remote "tail -20 /var/log/nginx/error.log"
            echo ""
            echo "=== Nginx Access Log ==="
            run_remote "tail -10 /var/log/nginx/access.log"
            echo ""
            echo "=== MySQL Error Log ==="
            run_remote "tail -10 /var/log/mysql/error.log"
            ;;
        4)
            echo -e "${YELLOW}🗄️ Verificando y reparando base de datos...${NC}"
            run_remote "
                # Verificar conexión
                mysql -u tudestino -ptudestino123 -e 'SELECT 1' tudestino
                
                # Verificar tablas
                echo 'Tablas existentes:'
                mysql -u tudestino -ptudestino123 -e 'SHOW TABLES' tudestino
                
                # Re-ejecutar migraciones si es necesario
                cd $PROJECT_PATH/apps/api
                npm run seed:mysql
            "
            echo -e "${GREEN}✅ Base de datos verificada${NC}"
            ;;
        5)
            echo -e "${YELLOW}🔒 Renovando certificados SSL...${NC}"
            run_remote "
                certbot renew --nginx
                systemctl reload nginx
            "
            echo -e "${GREEN}✅ Certificados SSL renovados${NC}"
            ;;
        6)
            echo -e "${YELLOW}🧹 Limpiando caché y rebuilds...${NC}"
            run_remote "
                cd $PROJECT_PATH
                
                # Limpiar node_modules y reinstalar
                rm -rf node_modules
                rm -rf apps/*/node_modules
                npm install
                
                # Rebuild aplicaciones
                npm run build:web
                
                # Limpiar PM2
                pm2 delete tudestino-api
                pm2 start apps/api/ecosystem.config.cjs
                pm2 save
                
                # Limpiar caché de Nginx
                nginx -s reload
            "
            echo -e "${GREEN}✅ Caché limpiado y aplicaciones rebuildeadas${NC}"
            ;;
        7)
            echo -e "${YELLOW}🔧 Reparando permisos de archivos...${NC}"
            run_remote "
                # Permisos para el proyecto
                chown -R www-data:www-data $PROJECT_PATH/apps/web/dist
                chown -R root:root $PROJECT_PATH/apps/api
                chmod -R 755 $PROJECT_PATH/apps/web/dist
                chmod -R 755 $PROJECT_PATH/apps/api/uploads
                
                # Permisos para Nginx
                chown -R www-data:www-data /var/log/nginx
                chmod -R 644 /etc/nginx/sites-available/*
                
                # Permisos para PM2
                chown -R root:root /var/log/pm2
            "
            echo -e "${GREEN}✅ Permisos reparados${NC}"
            ;;
        8)
            echo -e "${YELLOW}🌐 Verificando configuración de Nginx...${NC}"
            run_remote "
                # Probar configuración
                nginx -t
                
                # Mostrar sitios habilitados
                echo 'Sitios habilitados:'
                ls -la /etc/nginx/sites-enabled/
                
                # Verificar que los archivos de configuración existan
                echo 'Configuración de $DOMAIN:'
                ls -la /etc/nginx/sites-available/$DOMAIN
                
                echo 'Configuración de api.$DOMAIN:'
                ls -la /etc/nginx/sites-available/api.$DOMAIN
                
                # Recargar configuración
                systemctl reload nginx
            "
            echo -e "${GREEN}✅ Configuración de Nginx verificada${NC}"
            ;;
        9)
            echo -e "${YELLOW}📦 Actualizando desde GitHub...${NC}"
            run_remote "
                cd $PROJECT_PATH
                
                # Backup antes de actualizar
                /root/backup.sh
                
                # Pull latest changes
                git fetch origin
                git pull origin main
                
                # Reinstalar dependencias
                npm install
                
                # Rebuild aplicaciones
                npm run build:web
                
                # Restart services
                pm2 restart tudestino-api
                systemctl reload nginx
            "
            echo -e "${GREEN}✅ Proyecto actualizado desde GitHub${NC}"
            ;;
        10)
            echo -e "${RED}⚠️ ADVERTENCIA: Esto reinstalará todo desde cero${NC}"
            read -p "¿Estás seguro? (y/N): " confirm
            if [[ $confirm == [yY] ]]; then
                echo -e "${YELLOW}🚀 Ejecutando deployment completo...${NC}"
                # Aquí ejecutaríamos el script de deployment completo
                ./deploy-server.sh
            else
                echo "Cancelado"
            fi
            ;;
        0)
            echo -e "${BLUE}👋 ¡Hasta luego!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opción inválida${NC}"
            ;;
    esac
    
    echo ""
    read -p "Presiona Enter para continuar..."
    clear
done