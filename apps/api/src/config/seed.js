import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../modules/users/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const seedUsers = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar usuarios existentes
    await User.deleteMany({});
    console.log('🗑️  Base de datos limpiada');

    // Crear usuarios de prueba
    const users = [
      {
        name: 'Admin User',
        email: 'admin@tudestino.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        isVerified: true,
        isActive: true,
      },
      {
        name: 'Host Demo',
        email: 'host@tudestino.com',
        password: await bcrypt.hash('host123', 12),
        role: 'host',
        isVerified: true,
        isActive: true,
        hostProfile: {
          rating: 4.8,
          reviewCount: 25,
        },
      },
      {
        name: 'Guest Demo',
        email: 'guest@tudestino.com',
        password: await bcrypt.hash('guest123', 12),
        role: 'guest',
        isVerified: true,
        isActive: true,
      },
    ];

    await User.insertMany(users);
    console.log('✅ Usuarios de prueba creados:');
    console.log('   - admin@tudestino.com / admin123 (Admin)');
    console.log('   - host@tudestino.com / host123 (Host)');
    console.log('   - guest@tudestino.com / guest123 (Guest)');

    await mongoose.disconnect();
    console.log('✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedUsers();
