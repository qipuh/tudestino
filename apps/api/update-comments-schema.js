import mysql from 'mysql2/promise';

async function updateSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tudestino',
  });

  try {
    console.log('🔄 Actualizando esquema de base de datos...\n');

    // 1. Verificar y agregar parent_comment_id a social_comments
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'tudestino'
        AND TABLE_NAME = 'social_comments'
        AND COLUMN_NAME = 'parent_comment_id'
    `);

    if (columns.length === 0) {
      console.log('📝 Agregando columna parent_comment_id...');
      await connection.query(`
        ALTER TABLE social_comments
        ADD COLUMN parent_comment_id CHAR(36) NULL COMMENT 'ID del comentario padre si es una respuesta' AFTER content_id
      `);
      console.log('✅ Columna parent_comment_id agregada');
    } else {
      console.log('✅ Columna parent_comment_id ya existe');
    }

    // 2. Verificar y agregar replies_count a social_comments
    const [repliesCol] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'tudestino'
        AND TABLE_NAME = 'social_comments'
        AND COLUMN_NAME = 'replies_count'
    `);

    if (repliesCol.length === 0) {
      console.log('📝 Agregando columna replies_count...');
      await connection.query(`
        ALTER TABLE social_comments
        ADD COLUMN replies_count INT DEFAULT 0 NOT NULL COMMENT 'Número de respuestas a este comentario' AFTER likes_count
      `);
      console.log('✅ Columna replies_count agregada');
    } else {
      console.log('✅ Columna replies_count ya existe');
    }

    // 3. Agregar índice para parent_comment_id
    const [indexes] = await connection.query(`
      SHOW INDEX FROM social_comments WHERE Key_name = 'idx_parent_comment'
    `);

    if (indexes.length === 0) {
      console.log('📝 Agregando índice idx_parent_comment...');
      await connection.query(`
        ALTER TABLE social_comments
        ADD INDEX idx_parent_comment (parent_comment_id)
      `);
      console.log('✅ Índice idx_parent_comment agregado');
    } else {
      console.log('✅ Índice idx_parent_comment ya existe');
    }

    // 4. Actualizar ENUM de content_type en social_likes
    const [likeColumns] = await connection.query(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'tudestino'
        AND TABLE_NAME = 'social_likes'
        AND COLUMN_NAME = 'content_type'
    `);

    if (likeColumns.length > 0) {
      const currentEnum = likeColumns[0].COLUMN_TYPE;
      if (!currentEnum.includes('comment')) {
        console.log('📝 Actualizando ENUM content_type para incluir comment...');
        await connection.query(`
          ALTER TABLE social_likes
          MODIFY COLUMN content_type ENUM('post', 'reel', 'comment') NOT NULL COMMENT 'Tipo de contenido: post, reel o comment'
        `);
        console.log('✅ ENUM content_type actualizado');
      } else {
        console.log('✅ ENUM content_type ya incluye comment');
      }
    }

    // 5. Verificar si existe la tabla social_reels
    const [reelsTable] = await connection.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'tudestino'
        AND TABLE_NAME = 'social_reels'
    `);

    if (reelsTable.length === 0) {
      console.log('📝 Creando tabla social_reels...');
      await connection.query(`
        CREATE TABLE social_reels (
          id CHAR(36) PRIMARY KEY,
          user_id CHAR(36) NOT NULL,
          caption TEXT NOT NULL,
          video_url VARCHAR(500) NOT NULL,
          thumbnail_url VARCHAR(500),
          duration INT COMMENT 'Duration in seconds',
          location VARCHAR(255),
          views_count INT DEFAULT 0,
          likes_count INT DEFAULT 0,
          comments_count INT DEFAULT 0,
          shares_count INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_created_at (created_at),
          INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabla social_reels creada');
    } else {
      console.log('✅ Tabla social_reels ya existe');
    }

    // 6. Verificar si existe la tabla social_posts
    const [postsTable] = await connection.query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'tudestino'
        AND TABLE_NAME = 'social_posts'
    `);

    if (postsTable.length === 0) {
      console.log('📝 Creando tabla social_posts...');
      await connection.query(`
        CREATE TABLE social_posts (
          id CHAR(36) PRIMARY KEY,
          user_id CHAR(36) NOT NULL,
          caption TEXT NOT NULL,
          location VARCHAR(255),
          media JSON NOT NULL COMMENT 'Array of media objects: [{url, type: image|video, thumbnail}]',
          likes_count INT DEFAULT 0,
          comments_count INT DEFAULT 0,
          shares_count INT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_created_at (created_at),
          INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Tabla social_posts creada');
    } else {
      console.log('✅ Tabla social_posts ya existe');
    }

    console.log('\n🎉 ¡Schema actualizado correctamente!');

  } catch (error) {
    console.error('\n❌ Error actualizando schema:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

updateSchema().catch(console.error);
