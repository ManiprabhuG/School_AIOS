import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export interface DbQueryConfig {
  host: string;
  port: number;
  database: string;
  user: string;
}

export const getDbConfig = (): DbQueryConfig => {
  return {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    database: process.env.DATABASE_NAME || 'abs_school_erp',
    user: process.env.DATABASE_USER || 'root',
  };
};

export const isDbConnected = (): boolean => {
  return Boolean(process.env.DATABASE_URL);
};
