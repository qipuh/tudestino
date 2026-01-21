import sequelize from '../config/database-mysql.js';
import { DataTypes } from 'sequelize';

/**
 * Migration: Create business_social_posts table
 * This table stores posts and reels created by businesses
 */
export async function up() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('business_social_posts')) {
      console.log('Creating business_social_posts table...');

      await queryInterface.createTable('business_social_posts', {
        id: {
          type: DataTypes.CHAR(36),
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        businessId: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          field: 'businessId',
          references: {
            model: 'businesses',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        caption: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        media: {
          type: DataTypes.JSON,
          allowNull: false,
          comment: 'Array of media objects: [{url, type: image|video, thumbnail, alt}]',
        },
        type: {
          type: DataTypes.ENUM('post', 'reel', 'story'),
          defaultValue: 'post',
          allowNull: false,
        },
        location: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        tags: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: 'Array de hashtags y menciones',
        },
        likesCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          field: 'likesCount',
        },
        commentsCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          field: 'commentsCount',
        },
        sharesCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          field: 'sharesCount',
        },
        viewsCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          field: 'viewsCount',
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          field: 'isActive',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'createdAt',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'updatedAt',
        },
      });

      // Add indexes
      await queryInterface.addIndex('business_social_posts', ['businessId']);
      await queryInterface.addIndex('business_social_posts', ['type']);
      await queryInterface.addIndex('business_social_posts', ['createdAt']);
      await queryInterface.addIndex('business_social_posts', ['likesCount']);
      await queryInterface.addIndex('business_social_posts', ['isActive']);

      console.log('✅ Successfully created business_social_posts table');
    } else {
      console.log('⚠️ Table business_social_posts already exists');
    }
  } catch (error) {
    console.error('❌ Error creating business_social_posts table:', error);
    throw error;
  }
}

/**
 * Rollback migration
 */
export async function down() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('Dropping business_social_posts table...');
    await queryInterface.dropTable('business_social_posts');
    console.log('✅ Successfully dropped business_social_posts table');
  } catch (error) {
    console.error('❌ Error dropping business_social_posts table:', error);
    throw error;
  }
}

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await up();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
