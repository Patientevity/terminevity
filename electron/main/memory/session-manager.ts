import Database from 'better-sqlite3';

export class SessionManager {
  constructor(private db: Database.Database) {}

  createSession(title: string, workspaceId?: number): number {
    const result = this.db.prepare(
      'INSERT INTO sessions (title, workspace_id) VALUES (?, ?)',
    ).run(title, workspaceId ?? null);
    return result.lastInsertRowid as number;
  }

  endSession(id: number, summary?: string): void {
    this.db.prepare(
      "UPDATE sessions SET ended_at = datetime('now'), summary = ? WHERE id = ?",
    ).run(summary ?? null, id);
  }

  getActiveSessions(): any[] {
    return this.db.prepare('SELECT * FROM sessions WHERE ended_at IS NULL ORDER BY started_at DESC').all();
  }

  getAllSessions(limit = 50): any[] {
    return this.db.prepare('SELECT * FROM sessions ORDER BY started_at DESC LIMIT ?').all(limit);
  }
}
