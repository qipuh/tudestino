import mysql from 'mysql2/promise';

async function checkVerification() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tudestino'
  });

  console.log('📊 Verificando último usuario registrado...\n');

  const [users] = await connection.query(`
    SELECT
      id, name, email, phone, country_code,
      email_verified, email_verification_code, email_verification_expires,
      verification_status, createdAt
    FROM users
    WHERE email = 'quipuh@gmail.com'
    ORDER BY createdAt DESC
    LIMIT 1
  `);

  if (users.length > 0) {
    const user = users[0];
    console.log('✅ Usuario encontrado:');
    console.log('   ID:', user.id);
    console.log('   Nombre:', user.name);
    console.log('   Email:', user.email);
    console.log('   Teléfono:', user.country_code, user.phone);
    console.log('   Email verificado:', user.email_verified ? 'Sí' : 'No');
    console.log('   Estado:', user.verification_status);
    console.log('   Código de verificación:', user.email_verification_code);
    console.log('   Expira:', user.email_verification_expires);
    console.log('   Creado:', user.created_at);
  } else {
    console.log('❌ No se encontró el usuario');
  }

  await connection.end();
}

checkVerification().catch(console.error);
