import sequelize from './src/config/database-mysql.js';
import { Post, Reel, Like, Comment } from './src/modules/social/social.model.sequelize.js';

async function syncTables() {
  try {
    console.log('🔄 Sincronizando tablas de red social...\n');

    // Sincronizar tablas
    await Post.sync({ alter: true });
    console.log('✅ Tabla social_posts creada/actualizada');

    await Reel.sync({ alter: true });
    console.log('✅ Tabla social_reels creada/actualizada');

    await Like.sync({ alter: true });
    console.log('✅ Tabla social_likes verificada');

    await Comment.sync({ alter: true });
    console.log('✅ Tabla social_comments verificada');

    console.log('\n✅ Todas las tablas han sido sincronizadas correctamente!');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error sincronizando tablas:', error);
    process.exit(1);
  }
}

syncTables();
