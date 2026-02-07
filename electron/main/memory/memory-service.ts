import Database from 'better-sqlite3';

export class MemoryService {
  constructor(private db: Database.Database) {}

  saveObservation(sessionId: number, type: string, content: string, tags: string[] = []): number {
    const result = this.db.prepare(
      'INSERT INTO observations (session_id, type, content, tags) VALUES (?, ?, ?, ?)',
    ).run(sessionId, type, content, JSON.stringify(tags));
    return result.lastInsertRowid as number;
  }

  getObservations(sessionId: number): any[] {
    return this.db.prepare('SELECT * FROM observations WHERE session_id = ? ORDER BY created_at DESC').all(sessionId);
  }

  searchObservations(query: string, limit = 20): any[] {
    return this.db.prepare(
      `SELECT o.* FROM observations o
       JOIN observations_fts fts ON o.id = fts.rowid
       WHERE observations_fts MATCH ?
       ORDER BY rank
       LIMIT ?`,
    ).all(query, limit);
  }
}
