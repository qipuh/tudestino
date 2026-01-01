// PM2 Ecosystem Configuration para TuDestino
// Documentación: https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: 'tudestino-api',
      cwd: '/var/www/tudestino/apps/api',
      script: 'src/index.js',
      instances: 2, // Usar 2 instancias para balanceo de carga
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Logs
      error_file: '/var/log/tudestino/api-error.log',
      out_file: '/var/log/tudestino/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Auto-restart
      watch: false,
      max_memory_restart: '500M',

      // Reintentos
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // Tiempo de espera antes de forzar shutdown
      kill_timeout: 5000,

      // Variables de entorno desde archivo
      env_file: '/var/www/tudestino/apps/api/.env.production'
    }
  ],

  // Configuración de despliegue (opcional)
  deploy: {
    production: {
      user: 'root',
      host: '161.132.38.151',
      ref: 'origin/main',
      repo: 'https://github.com/qipuh/tudestino.git',
      path: '/var/www/tudestino',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': ''
    }
  }
};
