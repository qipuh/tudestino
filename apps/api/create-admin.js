import bcrypt from 'bcryptjs';
import User from './src/modules/users/user.model-mysql.js';
import sequelize from './src/config/database-mysql.js';

async function createAdminUser() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync();
    console.log('✅ Modelos sincronizados');

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      where: { email: 'admin@tudestino.pe' }
    });

    if (existingUser) {
      console.log('⚠️  El usuario admin@tudestino.pe ya existe');
      console.log('Usuario existente:', {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      });
      process.exit(0);
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash('password', 10);

    // Crear el usuario administrador
    const adminUser = await User.create({
      name: 'Administrador',
      email: 'admin@tudestino.pe',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isActive: true,
      bio: 'Administrador del sistema TuDestino',
      identityStatus: 'verified'
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: password');
    console.log('👤 Role:', adminUser.role);
    console.log('🆔 ID:', adminUser.id);
    console.log('');
    console.log('🎯 Ahora puedes iniciar sesión en el panel de administración:');
    console.log('   http://localhost:5174/login');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error);
    process.exit(1);
  }
}

// Ejecutar el script
createAdminUser();
