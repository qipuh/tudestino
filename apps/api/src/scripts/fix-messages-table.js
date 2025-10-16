import sequelize from '../config/database-mysql.js';
import Message from '../modules/messaging/message.model.js';
import Conversation from '../modules/messaging/conversation.model.js';

async function fixMessagesTable() {
  try {
    console.log('🔧 Fixing Messages table...');

    // Drop and recreate the Messages table
    await Message.drop();
    console.log('✅ Messages table dropped');

    await Message.sync({ force: true });
    console.log('✅ Messages table recreated with AUTO_INCREMENT');

    // Also ensure Conversations table is correct
    await Conversation.sync({ alter: true });
    console.log('✅ Conversations table verified');

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixMessagesTable();
