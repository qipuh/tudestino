#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

echo "Starting Provisioning..."

# Update System
echo "Updating system..."
apt-get update -q
apt-get upgrade -y -q

# Install Basic Tools
echo "Installing basics..."
apt-get install -y curl wget git unzip gnupg

# Install Node.js 20 (LTS)
echo "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install PM2
echo "Installing PM2..."
npm install -g pm2

# Install Nginx
echo "Installing Nginx..."
apt-get install -y nginx

# Install MariaDB
echo "Installing MariaDB..."
apt-get install -y mariadb-server

# Install PHP & Extensions (for PHPMyAdmin)
echo "Installing PHP..."
apt-get install -y php php-cli php-fpm php-mysql php-mbstring php-zip php-gd php-json php-curl php-xml

# Setup PHPMyAdmin
echo "Setting up PHPMyAdmin..."
if [ ! -d "/var/www/phpmyadmin" ]; then
    cd /var/www
    wget -q https://files.phpmyadmin.net/phpMyAdmin/5.2.1/phpMyAdmin-5.2.1-all-languages.zip
    unzip -q phpMyAdmin-5.2.1-all-languages.zip
    mv phpMyAdmin-5.2.1-all-languages phpmyadmin
    rm phpMyAdmin-5.2.1-all-languages.zip
    
    # Config secret
    cp /var/www/phpmyadmin/config.sample.inc.php /var/www/phpmyadmin/config.inc.php
    RANDOM_SECRET=$(openssl rand -base64 32 | tr -d /=+ | head -c 32)
    sed -i "s/\$cfg\['blowfish_secret'\] = '';/\$cfg\['blowfish_secret'\] = '$RANDOM_SECRET';/" /var/www/phpmyadmin/config.inc.php
    chmod 755 /var/www/phpmyadmin
fi

# Database Setup
echo "Configuring Database..."
# Securely set password and create user
# Note: Root login for MariaDB often uses unix_socket, so we iterate to SQL
mysql -e "CREATE USER IF NOT EXISTS 'tudestino'@'localhost' IDENTIFIED BY '3@monitoSS';" || true
mysql -e "GRANT ALL PRIVILEGES ON *.* TO 'tudestino'@'localhost' WITH GRANT OPTION;"
mysql -e "FLUSH PRIVILEGES;"
mysql -e "CREATE DATABASE IF NOT EXISTS tudestino;"

echo "Provisioning Complete."
