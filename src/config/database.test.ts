import 'dotenv/config';
import { DataSourceOptions } from 'typeorm';

export const testDatabaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5433),
  username: process.env.DB_USERNAME || 'test_user',
  password: process.env.DB_PASSWORD || 'test_password',
  database: process.env.DB_NAME || 'bright_social_test',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  synchronize: true, // Always true for test environment
  dropSchema: true, // Drop schema before each test run
  logging: false, // Turn off logging in tests
};

export const getDatabaseConfig = (): DataSourceOptions => {
  if (process.env.NODE_ENV === 'test') {
    return testDatabaseConfig;
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    synchronize: process.env.DB_SYNC === 'true',
  };
};

// Keep the original export for backward compatibility
export const databaseConfig: DataSourceOptions = getDatabaseConfig();
