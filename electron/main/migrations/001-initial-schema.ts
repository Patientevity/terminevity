import Database from 'better-sqlite3';

export function migration001(db: Database.Database): void {
  db.exec(`
    -- Key-value settings store
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- User profile
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT '',
      goals TEXT NOT NULL DEFAULT '',
      intents TEXT NOT NULL DEFAULT '',
      github_username TEXT,
      github_token TEXT,
      preferred_note_tool TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- AI provider configurations
    CREATE TABLE IF NOT EXISTS ai_providers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('claude', 'openai', 'gemini')),
      api_key_encrypted TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      is_default INTEGER NOT NULL DEFAULT 0,
      enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Workspaces
    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Insert default settings
    INSERT OR IGNORE INTO settings (key, value) VALUES
      ('theme', 'dark'),
      ('hotkey', 'F1'),
      ('font_size', '14'),
      ('font_family', 'monospace'),
      ('terminal_shell', 'auto'),
      ('onboarding_complete', 'false');
  `);
}
