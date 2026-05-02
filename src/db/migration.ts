import m0001 from '@src/db/migrations/0000_initial.sql?raw';
import { driver } from '@src/db/client.ts';

const migrations = [
  { id: 0, name: '0000_initial.sql', sql: m0001 },
] as {
  id: number;
  name: string;
  sql: string;
}[];

const MIGRATION_TABLE_NAME = '__migrations__';
const MIGRATION_HASH_KEY = '__migration_hash_key__';

export async function resetDatabase() {
  console.debug('Beginning database reset.');

  await driver('PRAGMA foreign_keys = OFF;', [], 'run');
  const tablesResult = await driver(
    `SELECT name
     FROM sqlite_master
     WHERE type = 'table'
       AND name NOT LIKE 'sqlite_%';`,
    [],
    'all'
  ) as { rows: [string][] };
  for (const row of tablesResult.rows) {
    const tableName = row[0];
    const stmt = `DROP TABLE IF EXISTS ${tableName};`
    console.debug(`Executing ${stmt}`)
    await driver(stmt, [], 'run');
    console.debug('Table dropped successfully.');
  }
  await driver('PRAGMA foreign_keys = ON;', [], 'run');
  console.debug('All tables dropped successfully');
}

async function generateHash(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function applyMigrations() {
  const migrationsHash = await generateHash(m0001.trim());
  if (localStorage.getItem(MIGRATION_HASH_KEY) !== migrationsHash) {
    await resetDatabase();
    localStorage.setItem(MIGRATION_HASH_KEY, migrationsHash);
  }


  await driver(
    `CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE_NAME}
     (
       id     INTEGER PRIMARY KEY,
       name   TEXT,
       run_at INTEGER
     )`,
    [],
    'run'
  );

  const appliedMigrations = await driver(
    `SELECT id, name, run_at
     FROM ${MIGRATION_TABLE_NAME}`,
    [],
    'all'
  ) as { rows: [number, string, number][] }

  console.debug('Existing migrations:', appliedMigrations.rows.map(row => ({
    id: row[0],
    name: row[1],
    runAt: row[2]
  })));

  const appliedMigrationIds = new Set(appliedMigrations.rows.map(row => row[0]));

  for (const migration of migrations) {
    if (appliedMigrationIds.has(migration.id)) continue;

    console.debug(`Running migration ${migration.name} :: [ID: ${migration.id}]`);

    // Split the file by Drizzle's custom breakpoint
    const statements = migration.sql.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

    for (const stmt of statements) {
      await driver(stmt, [], 'run');
    }

    // Record the migration as successful
    await driver(
      `INSERT INTO ${MIGRATION_TABLE_NAME} (id, name, run_at)
       VALUES (?, ?, ?)`,
      [migration.id, migration.name, new Date().getTime()],
      'run'
    );
  }
}