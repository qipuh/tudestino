import bcrypt from 'bcryptjs';

async function generateSQL() {
  const hashedPassword = await bcrypt.hash('password', 10);
  
  console.log('-- CONSULTA SQL PARA CREAR USUARIO ADMINISTRADOR\n');
  console.log(`INSERT INTO users (
  id, 
  name, 
  email, 
  username, 
  password, 
  role, 
  isVerified, 
  isActive, 
  bio, 
  identityStatus,
  createdAt,
  updatedAt
) VALUES (
  UUID(),
  'Administrador',
  'admin@tudestino.pe',
  'admin',
  '${hashedPassword}',
  'admin',
  1,
  1,
  'Administrador del sistema TuDestino',
  'verified',
  NOW(),
  NOW()
);`);

  console.log('\n\n-- VERIFICAR SI EL USUARIO EXISTE\n');
  console.log(`SELECT id, name, email, username, role, isVerified, isActive 
FROM users 
WHERE email = 'admin@tudestino.pe';`);

  console.log('\n\n-- ACTUALIZAR USUARIO EXISTENTE (si ya existe)\n');
  console.log(`UPDATE users 
SET 
  password = '${hashedPassword}',
  role = 'admin',
  isVerified = 1,
  isActive = 1,
  updatedAt = NOW()
WHERE email = 'admin@tudestino.pe';`);

  process.exit(0);
}

generateSQL();
