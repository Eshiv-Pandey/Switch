import postgres from 'postgres';
import fs from 'fs';
import path from 'path';

async function runMigration() {
  const sql = postgres(process.env.DATABASE_URL);
  const migrationPath = path.join(process.cwd(), 'drizzle', '0000_windy_zaran.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Running migration...');
  try {
    await sql.unsafe(migrationSql);
    console.log('Migration successful!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sql.end();
  }
}

runMigration();
