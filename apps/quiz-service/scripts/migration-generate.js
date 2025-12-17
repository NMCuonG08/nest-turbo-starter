#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Get migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('❌ Error: Migration name is required');
  console.log('Usage: pnpm migration:generate <migration-name>');
  process.exit(1);
}

// Build full path
const migrationPath = path.join('src/database/migrations', migrationName);

// Run TypeORM migration generate
try {
  console.log(`📦 Generating migration: ${migrationName}`);
  execSync(
    `typeorm-ts-node-commonjs migration:generate -d ormconfig.ts ${migrationPath}`,
    { stdio: 'inherit' }
  );
  console.log(`✅ Migration generated successfully: ${migrationPath}`);
} catch (error) {
  console.error('❌ Failed to generate migration');
  process.exit(1);
}

