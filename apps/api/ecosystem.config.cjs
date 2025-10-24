module.exports = {
  apps: [{
    name: 'tudestino-api',
    script: 'src/index.js',
    cwd: '/var/www/vhosts/tudestino.qipuh.com/httpdocs/api',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DB_HOST: '127.0.0.1',
      DB_PORT: 3306,
      DB_NAME: 'admin_tudestino',
      DB_USER: 'admin_tudestino',
      DB_PASSWORD: '3@monitoSS',
      JWT_SECRET: 'tudestino-production-super-secret-jwt-key-2025-qipuh-secure',
      JWT_EXPIRES_IN: '7d',
      WEB_URL: 'https://tudestino.qipuh.com',
      API_URL: 'https://api.tudestino.qipuh.com',
      CORS_ORIGIN: 'https://tudestino.qipuh.com,https://admin.tudestino.qipuh.com,https://api.tudestino.qipuh.com',
      CLIENT_URL: 'https://tudestino.qipuh.com'
    }
  }]
};
