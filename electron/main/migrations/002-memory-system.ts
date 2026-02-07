import Database from 'better-sqlite3';

export function migration002(db: Database.Database): void {
  db.exec(`
    -- Sessions (memory context windows)
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT 'Untitled Session',
      workspace_id INTEGER REFERENCES workspaces(id),
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT,
      summary TEXT
    );

    -- Observations (core memory units)
    CREATE TABLE IF NOT EXISTS observations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id),
      type TEXT NOT NULL CHECK(type IN ('decision', 'bugfix', 'feature', 'learning', 'preference', 'context', 'general')),
      content TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      source TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Full-text search index for observations
    CREATE VIRTUAL TABLE IF NOT EXISTS observations_fts USING fts5(
      content,
      tags,
      content=observations,
      content_rowid=id,
      tokenize='porter unicode61'
    );

    -- Triggers to keep FTS in sync
    CREATE TRIGGER IF NOT EXISTS observations_ai AFTER INSERT ON observations BEGIN
      INSERT INTO observations_fts(rowid, content, tags) VALUES (new.id, new.content, new.tags);
    END;

    CREATE TRIGGER IF NOT EXISTS observations_ad AFTER DELETE ON observations BEGIN
      INSERT INTO observations_fts(observations_fts, rowid, content, tags) VALUES ('delete', old.id, old.content, old.tags);
    END;

    CREATE TRIGGER IF NOT EXISTS observations_au AFTER UPDATE ON observations BEGIN
      INSERT INTO observations_fts(observations_fts, rowid, content, tags) VALUES ('delete', old.id, old.content, old.tags);
      INSERT INTO observations_fts(rowid, content, tags) VALUES (new.id, new.content, new.tags);
    END;

    -- Session summaries
    CREATE TABLE IF NOT EXISTS session_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id),
      summary TEXT NOT NULL,
      key_decisions TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- User prompts / templates
    CREATE TABLE IF NOT EXISTS user_prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_observations_session ON observations(session_id);
    CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(type);
    CREATE INDEX IF NOT EXISTS idx_observations_created ON observations(created_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_workspace ON sessions(workspace_id);
  `);
}
