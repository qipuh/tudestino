import sequelize from '../config/database-mysql.js';
import bcrypt from 'bcryptjs';
import { DataTypes } from 'sequelize';

// Definir modelo de Usuario para MySQL
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'Users',
  timestamps: true,
});

async function createAdminUser() {
  try {
    console.log('🔄 Conectando a MySQL...');
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');

    // Sincronizar modelo (crear tabla si no existe)
    await User.sync();
    console.log('✅ Tabla Users sincronizada');

    const adminEmail = 'admin@tudestino.pe';
    const adminPassword = 'Admin123!';

    // Verificar si ya existe
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log('ℹ️  Usuario admin ya existe');
      console.log('📧 Email:', adminEmail);

      // Actualizar rol a admin si no lo es
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        existingAdmin.emailVerified = true;
        await existingAdmin.save();
        console.log('✅ Rol actualizado a admin');
      }
    } else {
      // Crear nuevo usuario admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await User.create({
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        emailVerified: true,
      });

      console.log('✅ Usuario admin creado exitosamente');
    }

    console.log('\n📝 Credenciales de acceso:');
    console.log('Email: admin@tudestino.pe');
    console.log('Password: Admin123!');
    console.log('\n⚠️  Por favor, cambia la contraseña después del primer login');
    console.log('\n🔗 URL de acceso:');
    console.log('Local: http://localhost:5174/login');
    console.log('Producción: https://tudestino.pe/admin/login');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminUser();
