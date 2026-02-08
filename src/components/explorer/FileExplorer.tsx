import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  FolderOpen, File, Folder, Home, ArrowUp, ArrowLeft, ArrowRight,
  ChevronRight, Eye, EyeOff, X,
} from 'lucide-react';
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

export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [editingPath, setEditingPath] = useState(false);
  const [addressValue, setAddressValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const addressRef = useRef<HTMLInputElement>(null);

  const loadDirectory = useCallback(async (dirPath: string) => {
    setLoading(true);
    try {
      const items = await api.fs.readDir(dirPath);
      const filtered = showHidden
        ? items
        : items.filter((e: FileEntry) => !e.name.startsWith('.'));
      const sorted = [...filtered].sort((a: FileEntry, b: FileEntry) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });
      setEntries(sorted);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [showHidden]);

  // Navigate to a directory, pushing to history
  const navigateTo = useCallback(async (dirPath: string, pushHistory = true) => {
    setCurrentPath(dirPath);
    setSelectedFile(null);
    setFileContent(null);
    setEditingPath(false);

    if (pushHistory) {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(dirPath);
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
    }

    await loadDirectory(dirPath);
  }, [historyIndex, loadDirectory]);

  // Reload current directory when showHidden changes
  useEffect(() => {
    if (currentPath) {
      loadDirectory(currentPath);
    }
  }, [showHidden]);

  const goBack = useCallback(() => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    const path = history[newIndex];
    setCurrentPath(path);
    setSelectedFile(null);
    setFileContent(null);
    loadDirectory(path);
  }, [history, historyIndex, loadDirectory]);

  const goForward = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    const path = history[newIndex];
    setCurrentPath(path);
    setSelectedFile(null);
    setFileContent(null);
    loadDirectory(path);
  }, [history, historyIndex, loadDirectory]);

  const goUp = useCallback(() => {
    if (!currentPath || currentPath === '/') return;
    const parent = currentPath.split('/').slice(0, -1).join('/') || '/';
    navigateTo(parent);
  }, [currentPath, navigateTo]);

  const goHome = useCallback(async () => {
    const homePath = await api.app.getPath('home');
    navigateTo(homePath);
  }, [navigateTo]);

  const handleEntryClick = useCallback(async (entry: FileEntry) => {
    if (entry.isDirectory) {
      navigateTo(entry.path);
    } else {
      setSelectedFile(entry.path);
      const content = await api.fs.readFile(entry.path);
      setFileContent(content);
    }
  }, [navigateTo]);

  const handleBreadcrumbClick = useCallback(() => {
    if (!currentPath) return;
    setEditingPath(true);
    setAddressValue(currentPath);
    setTimeout(() => addressRef.current?.select(), 0);
  }, [currentPath]);

  const handleAddressSubmit = useCallback(() => {
    const path = addressValue.trim();
    if (path) {
      navigateTo(path);
    }
    setEditingPath(false);
  }, [addressValue, navigateTo]);

  const handleAddressKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddressSubmit();
    } else if (e.key === 'Escape') {
      setEditingPath(false);
    }
  }, [handleAddressSubmit]);

  // Build breadcrumb segments from path
  const breadcrumbs = currentPath
    ? currentPath.split('/').filter(Boolean).map((segment, i, arr) => ({
        name: segment,
        path: '/' + arr.slice(0, i + 1).join('/'),
      }))
    : [];

  // Start at home on mount
  useEffect(() => {
    if (!currentPath) {
      goHome();
    }
  }, []);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;
  const canGoUp = currentPath !== null && currentPath !== '/';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm font-medium">Explorer</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setShowHidden(!showHidden)}
          title={showHidden ? 'Hide hidden files' : 'Show hidden files'}
        >
          {showHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={goBack}
          disabled={!canGoBack}
          title="Back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={goForward}
          disabled={!canGoForward}
          title="Forward"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={goUp}
          disabled={!canGoUp}
          title="Up"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={goHome}
          title="Home"
        >
          <Home className="w-3.5 h-3.5" />
        </Button>

        {/* Breadcrumbs / Address bar */}
        <div className="flex-1 min-w-0 ml-1">
          {editingPath ? (
            <Input
              ref={addressRef}
              value={addressValue}
              onChange={(e) => setAddressValue(e.target.value)}
              onKeyDown={handleAddressKeyDown}
              onBlur={() => setEditingPath(false)}
              className="h-7 text-xs font-mono"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={handleBreadcrumbClick}
              className="w-full flex items-center gap-0.5 h-7 px-2 rounded-md hover:bg-muted/50 transition-colors overflow-hidden"
              title="Click to edit path"
            >
              <span className="text-xs text-muted-foreground shrink-0">/</span>
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={crumb.path}>
                  {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                  <span
                    className={`text-xs truncate ${
                      i === breadcrumbs.length - 1
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={(e) => {
                      if (i < breadcrumbs.length - 1) {
                        e.stopPropagation();
                        navigateTo(crumb.path);
                      }
                    }}
                  >
                    {crumb.name}
                  </span>
                </React.Fragment>
              ))}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File list */}
        <div className={`${selectedFile ? 'w-2/5 border-r border-border' : 'w-full'} flex flex-col`}>
          <ScrollArea className="flex-1">
            {/* Parent directory row */}
            {canGoUp && (
              <button
                type="button"
                onClick={goUp}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors text-muted-foreground"
              >
                <ArrowUp className="w-4 h-4 shrink-0" />
                <span>..</span>
              </button>
            )}

            {entries.map((entry) => (
              <button
                key={entry.path}
                type="button"
                onClick={() => handleEntryClick(entry)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted/50 transition-colors ${
                  selectedFile === entry.path ? 'bg-muted' : ''
                }`}
              >
                {entry.isDirectory ? (
                  <Folder className="w-4 h-4 text-blue-400 shrink-0" />
                ) : (
                  <File className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
                <span className="truncate text-left">{entry.name}</span>
                {entry.isDirectory && (
                  <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto shrink-0" />
                )}
              </button>
            ))}

            {entries.length === 0 && !loading && (
              <div className="p-4 text-center text-xs text-muted-foreground">
                {currentPath ? 'This folder is empty.' : 'Loading...'}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* File preview */}
        {selectedFile && (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
              <p className="text-xs text-muted-foreground truncate">{selectedFile.split('/').pop()}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => { setSelectedFile(null); setFileContent(null); }}
                title="Close preview"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <pre className="p-4 text-xs font-mono whitespace-pre-wrap">
                {fileContent ?? 'Unable to read file'}
              </pre>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
