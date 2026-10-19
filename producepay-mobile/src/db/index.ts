import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let initialized = false;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('producepay.db');
  if (!initialized) {
    await migrate(db);
    initialized = true;
  }
  return db;
}

async function migrate(database: SQLite.SQLiteDatabase): Promise<void> {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS farmers (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      location TEXT,
      synced_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_farmers_name ON farmers(name);
    CREATE INDEX IF NOT EXISTS idx_farmers_code ON farmers(code);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      synced_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS outbox (
      client_request_id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL,
      farmer_code TEXT NOT NULL,
      farmer_name TEXT NOT NULL,
      farmer_phone TEXT,
      weight_kg REAL NOT NULL,
      collected_at TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      error TEXT,
      attempt_count INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      synced_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox(status);
  `);
}