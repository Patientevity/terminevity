import React, { useState, useCallback } from 'react';
import { Search, FolderOpen, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/ipc';

interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
  isFile: boolean;
}

export function ResearchPanel() {
  const [dirPath, setDirPath] = useState('');
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);

  const scanDirectory = useCallback(async () => {
    if (!dirPath.trim()) return;
    setLoading(true);
    try {
      const entries = await api.fs.readDir(dirPath);
      const filtered = entries.filter((e: FileEntry) => !e.name.startsWith('.'));
      const sorted = [...filtered].sort((a: FileEntry, b: FileEntry) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      setFiles(sorted);
    } finally {
      setLoading(false);
    }
  }, [dirPath]);

  const toggleFile = useCallback((path: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const buildContext = useCallback(async () => {
    if (selectedFiles.size === 0) return;
    setLoading(true);
    try {
      const parts: string[] = [];
      for (const filePath of selectedFiles) {
        const content = await api.fs.readFile(filePath);
        if (content) {
          parts.push(`--- ${filePath} ---\n${content}\n`);
        }
      }
      setContext(parts.join('\n'));
    } finally {
      setLoading(false);
    }
  }, [selectedFiles]);

  const useHomePath = useCallback(async () => {
    const home = await api.app.getPath('home');
    setDirPath(home);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium">Research Assistant</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File selection sidebar */}
        <div className="w-72 border-r border-border flex flex-col">
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex gap-1">
              <Input
                value={dirPath}
                onChange={(e) => setDirPath(e.target.value)}
                placeholder="Enter directory path..."
                className="text-xs h-8"
                onKeyDown={(e) => e.key === 'Enter' && scanDirectory()}
              />
              <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={scanDirectory}>
                Scan
              </Button>
            </div>
            <Button size="sm" variant="ghost" className="w-full h-7 text-xs" onClick={useHomePath}>
              Use Home Directory
            </Button>
          </div>

          <ScrollArea className="flex-1">
            {files.map((entry) => (
              <button
                key={entry.path}
                onClick={() => !entry.isDirectory && toggleFile(entry.path)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors ${
                  selectedFiles.has(entry.path) ? 'bg-primary/10 text-primary' : ''
                } ${entry.isDirectory ? 'opacity-50' : ''}`}
                disabled={entry.isDirectory}
              >
                {entry.isDirectory ? (
                  <FolderOpen className="w-4 h-4 text-blue-400 shrink-0" />
                ) : (
                  <File className="w-4 h-4 shrink-0" />
                )}
                <span className="truncate">{entry.name}</span>
              </button>
            ))}
            {files.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Enter a directory path and click Scan to browse files.
              </div>
            )}
          </ScrollArea>

          {selectedFiles.size > 0 && (
            <div className="p-3 border-t border-border">
              <Button size="sm" className="w-full" onClick={buildContext} disabled={loading}>
                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Build Context ({selectedFiles.size} files)
              </Button>
            </div>
          )}
        </div>

        {/* Context output */}
        <div className="flex-1 flex flex-col">
          {context ? (
            <>
              <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{selectedFiles.size} files loaded</p>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => navigator.clipboard.writeText(context)}>
                  Copy to Clipboard
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <pre className="p-4 text-xs font-mono whitespace-pre-wrap">{context}</pre>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <div>
                <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-sm font-medium">Research Assistant</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Point at a directory, select files, and build context for AI analysis.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
