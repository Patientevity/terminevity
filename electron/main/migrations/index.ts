import Database from 'better-sqlite3';
import { migration001 } from './001-initial-schema';
import { migration002 } from './002-memory-system';
import { migration003 } from './003-chat-history';

interface Migration {
  id: number;
  name: string;
  up: (db: Database.Database) => void;
}

const migrations: Migration[] = [
  { id: 1, name: '001-initial-schema', up: migration001 },
  { id: 2, name: '002-memory-system', up: migration002 },
  { id: 3, name: '003-chat-history', up: migration003 },
];

export function runMigrations(db: Database.Database): void {
  // Create migrations tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const applied = db
    .prepare('SELECT id FROM _migrations')
    .all()
    .map((row: any) => row.id);

  for (const migration of migrations) {
    if (!applied.includes(migration.id)) {
      db.transaction(() => {
        migration.up(db);
        db.prepare('INSERT INTO _migrations (id, name) VALUES (?, ?)').run(
          migration.id,
          migration.name,
        );
      })();
      console.log(`Migration applied: ${migration.name}`);
    }
  }
}
