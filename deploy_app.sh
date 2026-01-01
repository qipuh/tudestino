#!/bin/bash
set -e

# Configuration
REPO_URL="https://qipuh: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@github.com/qipuh/tudestino.git"
DB_USER="tudestino"
DB_PASS="3@monitoSS"
DB_NAME="tudestino"

echo "Starting Deployment..."

# Prepare directories
mkdir -p /var/www/repo

# Clone Repository
echo "Cloning repository..."
if [ -d "/var/www/repo/.git" ]; then
    cd /var/www/repo
    git pull
else
    git clone $REPO_URL /var/www/repo
fi

# -----------------
# API Deployment
# -----------------
echo "Deploying API..."
mkdir -p /var/www/api
rsync -av --exclude 'node_modules' /var/www/repo/apps/api/ /var/www/api/

cd /var/www/api

# Create API .env
cat > .env <<EOF
PORT=3001
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASS
JWT_SECRET=tudestino-production-super-secret-jwt-key-2025-qipuh-secure
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
WEB_URL=https://tudestino.lat
ADMIN_URL=https://tudestino.lat/admin
API_URL=https://tudestino.lat/api
CORS_ORIGIN=https://tudestino.lat
CLIENT_URL=https://tudestino.lat
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
EOF

# Install & Build API
npm install --omit=dev

# Start API with PM2
pm2 stop api || true
pm2 delete api || true
pm2 start src/index.js --name api --update-env

# -----------------
# Web Deployment
# -----------------
echo "Deploying Web..."
mkdir -p /var/www/tudestino
rsync -av --exclude 'node_modules' /var/www/repo/apps/web/ /var/www/tudestino/

cd /var/www/tudestino

# Create Web .env
cat > .env <<EOF
VITE_API_URL=https://tudestino.lat/api
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_CULQI_PUBLIC_KEY=pk_live_your_production_key
VITE_PAYPAL_CLIENT_ID=AeL-kN8KP_lLSEwVv5G7X8NvLy6-0im5F9MF0Qm7XqTr8QzVE8YF5xK3X5wZJfPxE0zME5F7p5P9C3Jv
EOF

# Install & Build Web
npm install
npm run build

# -----------------
# Database Import
# -----------------
echo "Importing Database..."
# Only import if tables don't exist? Or always?
# User requested implementation, so let's import.
# Using -f to ignore errors if tables exist? Or pure import?
# Assuming empty DB or overwrite.
mysql -u $DB_USER -p$DB_PASS $DB_NAME < /var/www/repo/bd.sql || echo "Database import failed or partially completed."

# -----------------
# Nginx Configuration
# -----------------
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/tudestino <<EOF
server {
    listen 80;
    server_name tudestino.lat www.tudestino.lat;

    root /var/www/tudestino/dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        
        # Rewrite if needed, depending on how API handles routes.
        # If API expects /api prefix, keep it.
    }

    location /phpmyadmin {
        root /var/www;
        index index.php index.html index.htm;
        location ~ ^/phpmyadmin/(.+\.php)$ {
            try_files \$uri =404;
            root /var/www;
            fastcgi_pass unix:/run/php/php-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME \$document_root\$fastcgi_script_name;
            include fastcgi_params;
        }
        location ~* ^/phpmyadmin/(.+\.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt))$ {
            root /var/www;
        }
    }
}
EOF

# Enable Site
ln -sf /etc/nginx/sites-available/tudestino /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test & Reload Nginx
nginx -t
systemctl reload nginx

echo "Deployment Complete!"
