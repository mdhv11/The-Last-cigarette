/**
 * Database index initialization and optimization
 * Ensures all indexes are properly created for optimal query performance
 */

const User = require('../models/User');
const CigLog = require('../models/CigLog');
const JournalEntry = require('../models/JournalEntry');
const Achievement = require('../models/Achievement');

/**
 * Initialize all database indexes
 * Should be called once during application startup
 */
async function initializeIndexes() {
  try {
    console.log('Initializing database indexes...');

    // Create indexes for all models
    await Promise.all([
      User.createIndexes(),
      CigLog.createIndexes(),
      JournalEntry.createIndexes(),
      Achievement.createIndexes(),
    ]);

    console.log('✓ All database indexes created successfully');
  } catch (error) {
    console.error('Error creating database indexes:', error);
    throw error;
  }
}

/**
 * Get index information for all collections
 * Useful for debugging and monitoring
 */
async function getIndexInfo() {
  try {
    const models = { User, CigLog, JournalEntry, Achievement };
    const indexInfo = {};

    for (const [modelName, model] of Object.entries(models)) {
      const indexes = await model.collection.getIndexes();
      indexInfo[modelName] = indexes;
    }

    return indexInfo;
  } catch (error) {
    console.error('Error getting index information:', error);
    throw error;
  }
}

module.exports = {
  initializeIndexes,
  getIndexInfo,
};
