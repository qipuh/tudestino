import bcrypt from 'bcryptjs';
import User from '../src/modules/users/user.model-mysql.js';
import sequelize from '../src/config/database-mysql.js';

const EMAIL = 'echavez@adapptika.com';
const PASSWORD = '3@monitoSS';
const USERNAME = 'echavez';

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('DB conectada');

    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    const [user, created] = await User.findOrCreate({
      where: { email: EMAIL },
      defaults: {
        name: 'Erick Chavez',
        email: EMAIL,
        username: USERNAME,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        isActive: true,
        emailVerified: true,
        identityStatus: 'verified',
      },
    });

    if (!created) {
      user.password = hashedPassword;
      user.role = 'admin';
      user.isActive = true;
      user.isVerified = true;
      user.emailVerified = true;
      await user.save();
      console.log('Usuario existente actualizado:', user.email, user.id);
    } else {
      console.log('Usuario admin creado:', user.email, user.id);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seed admin:', error);
    process.exit(1);
  }
}

seedAdmin();
