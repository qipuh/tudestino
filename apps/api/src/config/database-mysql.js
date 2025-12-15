import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'tudestino',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected successfully');

    // Sincronizar modelos en desarrollo (solo crear tablas que no existen)
    // DESACTIVADO: Las tablas se crean manualmente con scripts de migración
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: false });
    //   console.log('✅ Database models synchronized');
    // }
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error.message);
    process.exit(1);
  }
};

export default sequelize;
