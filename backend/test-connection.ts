import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';
import fs from 'fs';
import dotenv from 'dotenv';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local', override: true });
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  console.log('Testing database connection...');

  // Parse the connection string manually
  const parsed = new URL(connectionString);
  
  // Pass configuration options directly to PrismaMariaDb
  const adapter = new PrismaMariaDb({
    host: parsed.hostname || 'localhost',
    port: parsed.port ? parseInt(parsed.port, 10) : 3306,
    user: parsed.username || 'root',
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : undefined,
    connectionLimit: 10,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const tenants = await prisma.tenant.findMany({ take: 1 });
    console.log('✅ MySQL connected successfully!');
    console.log('Result:', tenants);
  } catch (err) {
    console.error('❌ Failed to connect to MySQL:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
