import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import sequelize from '../config/database-mysql.js';

async function checkAttractions() {
  try {
    console.log('🔍 Verificando atracciones en la base de datos...\n');

    const [results] = await sequelize.query(`
      SELECT id, title, category, city, region, isPublished, views, createdAt
      FROM attractions
      ORDER BY createdAt DESC
      LIMIT 20
    `);

    console.log(`📊 Total de atracciones encontradas: ${results.length}\n`);

    if (results.length === 0) {
      console.log('❌ No hay atracciones en la base de datos');
    } else {
      console.log('📋 Atracciones:');
      console.table(results.map(r => ({
        id: r.id.substring(0, 8),
        title: r.title,
        category: r.category,
        location: `${r.city}, ${r.region}`,
        published: r.isPublished ? '✓' : '✗',
        views: r.views,
        created: r.createdAt.toISOString().split('T')[0]
      })));
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAttractions();
