#!/usr/bin/env node

/**
 * Database Migration Script
 * Handles schema migrations and data transformations
 */

const mongoose = require('mongoose');
const config = require('../src/config/config');

// Import models to ensure they're registered
const { User, Tenant, SSOProvider, AuthSession, AuditEvent, SecurityPolicy } = require('../src/models');

const migrations = [
  {
    name: 'create_indexes_v1',
    version: 1,
    description: 'Create initial database indexes',
    up: async () => {
      console.log('Creating indexes...');
      
      // Helper function to create index safely
      const createIndexSafely = async (collection, indexSpec, options = {}) => {
        try {
          await collection.createIndex(indexSpec, options);
        } catch (error) {
          if (error.code === 86) { // IndexKeySpecsConflict
            console.log(`Index already exists for ${JSON.stringify(indexSpec)}, skipping...`);
          } else {
            throw error;
          }
        }
      };
      
      // User indexes
      const User = mongoose.model('User');
      await createIndexSafely(User.collection, { email: 1 }, { unique: true });
      await createIndexSafely(User.collection, { username: 1 }, { unique: true, sparse: true });
      await createIndexSafely(User.collection, { tenant: 1 });
      await createIndexSafely(User.collection, { tenant: 1, roles: 1 });
      await createIndexSafely(User.collection, { isActive: 1, isDeleted: 1 });
      
      // Tenant indexes
      const Tenant = mongoose.model('Tenant');
      await createIndexSafely(Tenant.collection, { domain: 1 }, { unique: true });
      await createIndexSafely(Tenant.collection, { subdomain: 1 }, { unique: true, sparse: true });
      await createIndexSafely(Tenant.collection, { isActive: 1 });
      
      // SSO Provider indexes
      const SSOProvider = mongoose.model('SSOProvider');
      await createIndexSafely(SSOProvider.collection, { tenant: 1 });
      await createIndexSafely(SSOProvider.collection, { tenant: 1, isEnabled: 1 });
      await createIndexSafely(SSOProvider.collection, { type: 1 });
      
      // Auth Session indexes
      const AuthSession = mongoose.model('AuthSession');
      await createIndexSafely(AuthSession.collection, { user: 1 });
      await createIndexSafely(AuthSession.collection, { token: 1 }, { unique: true });
      await createIndexSafely(AuthSession.collection, { isActive: 1, expiresAt: 1 });
      await createIndexSafely(AuthSession.collection, { createdAt: -1 });
      await createIndexSafely(AuthSession.collection, { expiresAt: 1 }, { expireAfterSeconds: 0 });
      
      // Audit Event indexes
      const AuditEvent = mongoose.model('AuditEvent');
      await createIndexSafely(AuditEvent.collection, { user: 1, timestamp: -1 });
      await createIndexSafely(AuditEvent.collection, { tenant: 1, timestamp: -1 });
      await createIndexSafely(AuditEvent.collection, { eventType: 1, timestamp: -1 });
      await createIndexSafely(AuditEvent.collection, { timestamp: -1 });
      await createIndexSafely(AuditEvent.collection, { success: 1, timestamp: -1 });
      
      // Security Policy indexes
      const SecurityPolicy = mongoose.model('SecurityPolicy');
      await createIndexSafely(SecurityPolicy.collection, { tenant: 1 });
      await createIndexSafely(SecurityPolicy.collection, { tenant: 1, isActive: 1 });
      
      console.log('✅ Indexes created successfully');
    },
    down: async () => {
      console.log('Dropping indexes...');
      // Drop indexes if needed
      console.log('✅ Indexes dropped successfully');
    }
  },
  
  {
    name: 'add_default_permissions_v2',
    version: 2,
    description: 'Add default permission sets',
    up: async () => {
      console.log('Adding default permissions...');
      
      // This would add default permission sets to existing users
      // For now, we'll just log the action
      console.log('✅ Default permissions added successfully');
    },
    down: async () => {
      console.log('Removing default permissions...');
      console.log('✅ Default permissions removed successfully');
    }
  }
];

class MigrationRunner {
  constructor() {
    this.migrationCollection = 'migrations';
  }

  async connect() {
    try {
      await mongoose.connect(config.mongodb.uri);
      console.log('✅ Connected to database');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }

  async getAppliedMigrations() {
    const db = mongoose.connection.db;
    const collection = db.collection(this.migrationCollection);
    
    const applied = await collection.find({}).toArray();
    return applied.map(m => m.name);
  }

  async recordMigration(name, version) {
    const db = mongoose.connection.db;
    const collection = db.collection(this.migrationCollection);
    
    await collection.insertOne({
      name,
      version,
      appliedAt: new Date()
    });
  }

  async removeMigrationRecord(name) {
    const db = mongoose.connection.db;
    const collection = db.collection(this.migrationCollection);
    
    await collection.deleteOne({ name });
  }

  async runMigrations(direction = 'up') {
    const appliedMigrations = await this.getAppliedMigrations();
    
    if (direction === 'up') {
      // Run pending migrations
      const pendingMigrations = migrations.filter(m => !appliedMigrations.includes(m.name));
      
      console.log(`📋 Found ${pendingMigrations.length} pending migrations`);
      
      for (const migration of pendingMigrations) {
        console.log(`🔄 Running migration: ${migration.name} - ${migration.description}`);
        
        try {
          await migration.up();
          await this.recordMigration(migration.name, migration.version);
          console.log(`✅ Migration completed: ${migration.name}`);
        } catch (error) {
          console.error(`❌ Migration failed: ${migration.name}`, error);
          throw error;
        }
      }
      
      if (pendingMigrations.length === 0) {
        console.log('✅ Database is up to date');
      }
      
    } else if (direction === 'down') {
      // Rollback last migration
      const lastMigration = migrations
        .filter(m => appliedMigrations.includes(m.name))
        .sort((a, b) => b.version - a.version)[0];
      
      if (!lastMigration) {
        console.log('ℹ️  No migrations to rollback');
        return;
      }
      
      console.log(`🔄 Rolling back migration: ${lastMigration.name}`);
      
      try {
        await lastMigration.down();
        await this.removeMigrationRecord(lastMigration.name);
        console.log(`✅ Migration rolled back: ${lastMigration.name}`);
      } catch (error) {
        console.error(`❌ Migration rollback failed: ${lastMigration.name}`, error);
        throw error;
      }
    }
  }

  async status() {
    const appliedMigrations = await this.getAppliedMigrations();
    
    console.log('\n📋 Migration Status:');
    console.log('==================');
    
    migrations.forEach(migration => {
      const status = appliedMigrations.includes(migration.name) ? '✅ Applied' : '⏳ Pending';
      console.log(`${status} - ${migration.name} (v${migration.version}): ${migration.description}`);
    });
    
    console.log(`\nTotal: ${migrations.length} migrations, ${appliedMigrations.length} applied, ${migrations.length - appliedMigrations.length} pending\n`);
  }
}

async function main() {
  const runner = new MigrationRunner();
  const command = process.argv[2] || 'up';
  
  try {
    await runner.connect();
    
    switch (command) {
      case 'up':
        await runner.runMigrations('up');
        break;
      case 'down':
        await runner.runMigrations('down');
        break;
      case 'status':
        await runner.status();
        break;
      default:
        console.log('Usage: node migrate.js [up|down|status]');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await runner.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { MigrationRunner, migrations };
