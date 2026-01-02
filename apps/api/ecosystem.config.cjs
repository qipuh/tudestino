const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

module.exports = {
  apps: [{
    name: 'tudestino-api',
    script: 'src/index.js',
    cwd: '/var/www/tudestino/apps/api',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3001,
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || 3306,
      DB_NAME: process.env.DB_NAME || 'tudestino_prod',
      DB_USER: process.env.DB_USER || 'tudestino',
      DB_PASSWORD: process.env.DB_PASSWORD || 'tudestino123_prod',
      JWT_SECRET: process.env.JWT_SECRET || 'tudestino-production-super-secret-jwt-key-2025-qipuh-secure',
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
      WEB_URL: process.env.WEB_URL || 'https://tudestino.lat',
      API_URL: process.env.API_URL || 'https://api.tudestino.lat',
      CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://tudestino.lat,https://admin.tudestino.lat,https://api.tudestino.lat',
      CLIENT_URL: process.env.CLIENT_URL || 'https://tudestino.lat',
      FACTILIZA_TOKEN: process.env.FACTILIZA_TOKEN,
      FACTILIZA_INSTANCE: process.env.FACTILIZA_INSTANCE,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      EMAIL_FROM: process.env.EMAIL_FROM,
      EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME
    }
  }]
};
