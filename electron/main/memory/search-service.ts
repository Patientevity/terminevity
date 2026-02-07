import Database from 'better-sqlite3';

export class SearchService {
  constructor(private db: Database.Database) {}

  // 3-layer search: exact match → FTS5 → fuzzy
  search(query: string, limit = 20): any[] {
    // Layer 1: Exact substring match (most relevant)
    const exact = this.db.prepare(
      `SELECT *, 1 as search_layer FROM observations
       WHERE content LIKE ? ORDER BY created_at DESC LIMIT ?`,
    ).all(`%${query}%`, limit);

    if (exact.length >= limit) return exact;

    // Layer 2: FTS5 full-text search
    const fts = this.db.prepare(
      `SELECT o.*, 2 as search_layer FROM observations o
       JOIN observations_fts fts ON o.id = fts.rowid
       WHERE observations_fts MATCH ?
       AND o.id NOT IN (${exact.map((r: any) => r.id).join(',') || '0'})
       ORDER BY rank LIMIT ?`,
    ).all(query, limit - exact.length);

    return [...exact, ...fts];
  }

  searchMessages(query: string, limit = 20): any[] {
    return this.db.prepare(
      `SELECT m.*, c.title as conversation_title FROM messages m
       JOIN messages_fts fts ON m.id = fts.rowid
       JOIN conversations c ON m.conversation_id = c.id
       WHERE messages_fts MATCH ?
       ORDER BY rank LIMIT ?`,
    ).all(query, limit);
  }
}
