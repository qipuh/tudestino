import sequelize from '../config/database-mysql.js';
import User from '../modules/users/user.model-mysql.js';
import UserFollow from '../modules/social/userFollow.model.js';
import { setupAssociations } from '../config/associations.js';

async function migrateSocialProfiles() {
  try {
    console.log('🚀 Starting social profiles migration...\n');

    // Setup associations
    setupAssociations();

    // Sync User model with alter to add new columns
    console.log('📝 Adding new social fields to Users table...');
    await User.sync({ alter: true });
    console.log('✅ Users table updated with social profile fields\n');

    // Create UserFollows table
    console.log('📝 Creating UserFollows table...');
    await UserFollow.sync({ force: true });
    console.log('✅ UserFollows table created\n');

    // Initialize default values for existing users
    console.log('📝 Initializing default values for existing users...');
    await sequelize.query(`
      UPDATE users
      SET
        followersCount = 0,
        followingCount = 0,
        reelsCount = 0,
        totalLikes = 0,
        isPublicProfile = 1,
        allowMessages = 1,
        travelInterests = '[]',
        visitedDestinations = '[]'
      WHERE
        followersCount IS NULL
        OR followingCount IS NULL
        OR reelsCount IS NULL
        OR totalLikes IS NULL
    `);
    console.log('✅ Default values initialized\n');

    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Social profile fields added to Users');
    console.log('   - UserFollows table created');
    console.log('   - Default values initialized');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

migrateSocialProfiles();
