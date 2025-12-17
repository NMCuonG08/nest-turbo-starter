import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as entities from '../data-access/all.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.QUIZ_SERVICE_DB_HOST || 'localhost',
  port: +process.env.QUIZ_SERVICE_DB_PORT || 5432,
  username: process.env.QUIZ_SERVICE_DB_USERNAME || '',
  password: process.env.QUIZ_SERVICE_DB_PASSWORD || '',
  database: process.env.QUIZ_SERVICE_DB_DATABASE || '',
  schema: process.env.QUIZ_SERVICE_DB_SCHEMA || 'public',
  entities: Object.values(entities),
  synchronize: false, // NEVER true in production
  logging: process.env.NODE_ENV === 'development',
  migrations: ['dist/database/migrations/*.js'],
  migrationsRun: false,
};

export const dbConfiguration = registerAs('database', () => databaseConfig);
