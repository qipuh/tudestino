#!/usr/bin/env node

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('\n🔍 Verificando Proyecto TuDestino...\n');

const checks = [
  {
    name: 'Dependencias Instaladas',
    check: () => fs.existsSync(join(__dirname, 'node_modules')),
  },
  {
    name: 'API - Variables de Entorno',
    check: () => fs.existsSync(join(__dirname, 'apps/api/.env')),
  },
  {
    name: 'Web - Variables de Entorno',
    check: () => fs.existsSync(join(__dirname, 'apps/web/.env')),
  },
  {
    name: 'Admin - Variables de Entorno',
    check: () => fs.existsSync(join(__dirname, 'apps/admin/.env')),
  },
  {
    name: 'API - Directorio de Uploads',
    check: () => fs.existsSync(join(__dirname, 'apps/api/uploads')),
  },
  {
    name: 'API - Script de Seed',
    check: () => fs.existsSync(join(__dirname, 'apps/api/src/config/seed.js')),
  },
  {
    name: 'Backend API - Estructura',
    check: () => fs.existsSync(join(__dirname, 'apps/api/src/index.js')),
  },
  {
    name: 'Frontend Web - Estructura',
    check: () => fs.existsSync(join(__dirname, 'apps/web/src/App.jsx')),
  },
  {
    name: 'Admin Panel - Estructura',
    check: () => fs.existsSync(join(__dirname, 'apps/admin/src/App.jsx')),
  },
  {
    name: 'Mobile App - Estructura',
    check: () => fs.existsSync(join(__dirname, 'apps/mobile/lib/main.dart')),
  },
  {
    name: 'Paquete Compartido',
    check: () => fs.existsSync(join(__dirname, 'packages/shared/index.js')),
  },
  {
    name: 'Documentación',
    check: () => fs.existsSync(join(__dirname, 'docs/GETTING_STARTED.md')),
  },
];

let passed = 0;
let failed = 0;

checks.forEach((item) => {
  const status = item.check();
  const icon = status ? '✅' : '❌';
  console.log(`${icon} ${item.name}`);
  if (status) passed++;
  else failed++;
});

console.log('\n' + '─'.repeat(50));
console.log(`\n📊 Resultado: ${passed}/${checks.length} verificaciones pasadas\n`);

if (failed === 0) {
  console.log('🎉 ¡Proyecto completamente configurado!\n');
  console.log('📝 Próximos pasos:');
  console.log('   1. Inicia MongoDB');
  console.log('   2. Ejecuta: npm run seed --workspace=apps/api');
  console.log('   3. Ejecuta: npm run dev:api');
  console.log('   4. Ejecuta: npm run dev:web');
  console.log('   5. Ejecuta: npm run dev:admin\n');
  console.log('📚 Lee: SETUP_COMPLETO.md para más información\n');
} else {
  console.log('⚠️  Faltan algunas configuraciones\n');
  console.log('📚 Consulta: SETUP_COMPLETO.md\n');
}
