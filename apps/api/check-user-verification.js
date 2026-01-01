import User from './src/modules/users/user.model-mysql.js';
import sequelize from './src/config/database-mysql.js';

async function checkUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const user = await User.findOne({
      where: { email: 'echavez@qipuh.com' },
      order: [['createdAt', 'DESC']],
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(0);
    }

    console.log('\n📧 Usuario encontrado:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Email Verified:', user.emailVerified);
    console.log('Verification Status:', user.verificationStatus);
    console.log('Email Verification Code:', user.emailVerificationCode);
    console.log('Email Verification Expires:', user.emailVerificationExpires);
    console.log('Phone:', user.phone);
    console.log('Country Code:', user.countryCode);
    console.log('Created At:', user.createdAt);

    if (user.emailVerificationCode) {
      const now = new Date();
      const expiresAt = new Date(user.emailVerificationExpires);
      const isExpired = now > expiresAt;
      console.log('\n⏰ Estado del código:');
      console.log('Código:', user.emailVerificationCode);
      console.log('Expira:', expiresAt.toLocaleString());
      console.log('Expirado:', isExpired ? '❌ SÍ' : '✅ NO');
      console.log('Tiempo restante:', Math.floor((expiresAt - now) / 1000 / 60), 'minutos');
    } else {
      console.log('\n❌ No hay código de verificación guardado');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUser();
