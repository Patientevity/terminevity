import fs from 'fs';
import path from 'path';

// File system watching for workspace changes
// Full implementation in Phase 10

export class FileWatcher {
  private watchers = new Map<string, fs.FSWatcher>();

  watch(dirPath: string, callback: (event: string, filename: string) => void): void {
    if (this.watchers.has(dirPath)) return;

    try {
      const watcher = fs.watch(dirPath, { recursive: true }, (event, filename) => {
        if (filename) {
          callback(event, path.join(dirPath, filename));
        }
      });
      this.watchers.set(dirPath, watcher);
    } catch {
      // Directory might not exist
    }
  }

  unwatch(dirPath: string): void {
    const watcher = this.watchers.get(dirPath);
    if (watcher) {
      watcher.close();
      this.watchers.delete(dirPath);
    }
  }

  unwatchAll(): void {
    for (const [dirPath] of this.watchers) {
      this.unwatch(dirPath);
    }
  }
}
