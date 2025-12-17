#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: process.env.QUIZ_SERVICE_DB_HOST || 'localhost',
    port: +process.env.QUIZ_SERVICE_DB_PORT || 5432,
    user: process.env.QUIZ_SERVICE_DB_USERNAME || 'postgres',
    password: process.env.QUIZ_SERVICE_DB_PASSWORD || '',
    database: process.env.QUIZ_SERVICE_DB_DATABASE || '',
});

const schemaName = process.env.QUIZ_SERVICE_DB_SCHEMA || 'quiz_schema';

async function createSchema() {
    try {
        await client.connect();
        console.log(`📦 Creating schema: ${schemaName}`);

        // Check if schema exists
        const checkResult = await client.query(
            `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
            [schemaName]
        );

        if (checkResult.rows.length > 0) {
            console.log(`✅ Schema "${schemaName}" already exists`);
        } else {
            // Create schema
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
            console.log(`✅ Schema "${schemaName}" created successfully`);
        }

        // Create uuid extension if not exists
        await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        console.log(`✅ UUID extension ready`);

        await client.end();
    } catch (error) {
        console.error('❌ Failed to create schema:', error.message);
        process.exit(1);
    }
}

createSchema();

