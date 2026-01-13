import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../../.env') });

// Esquema de Usuario (simplificado)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const adminEmail = 'admin@tudestino.pe';
    const adminPassword = 'Admin123!';

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('ℹ️  Usuario admin ya existe');
      console.log('📧 Email:', adminEmail);

      // Actualizar rol a admin si no lo es
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Rol actualizado a admin');
      }
    } else {
      // Crear nuevo usuario admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const admin = new User({
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        emailVerified: true
      });

      await admin.save();
      console.log('✅ Usuario admin creado exitosamente');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
    }

    console.log('\n📝 Credenciales de acceso:');
    console.log('Email: admin@tudestino.pe');
    console.log('Password: Admin123!');
    console.log('\n⚠️  Por favor, cambia la contraseña después del primer login');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdmin();
