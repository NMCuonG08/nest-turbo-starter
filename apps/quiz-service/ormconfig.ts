import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import * as entities from './src/data-access/all.entity';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.QUIZ_SERVICE_DB_HOST || 'localhost',
  port: +process.env.QUIZ_SERVICE_DB_PORT || 5432,
  username: process.env.QUIZ_SERVICE_DB_USERNAME || '',
  password: process.env.QUIZ_SERVICE_DB_PASSWORD || '',
  database: process.env.QUIZ_SERVICE_DB_DATABASE || '',
  schema: process.env.QUIZ_SERVICE_DB_SCHEMA || 'public',
  entities: Object.values(entities),
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
