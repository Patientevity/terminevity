import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FileText, Plus, Trash2, Eye, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api } from '@/lib/ipc';
import type { Document } from '@/types';

export function MarkdownEditor() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('split');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDocs = useCallback(async () => {
    const list = await api.doc.list();
    setDocs(list);
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const selectDoc = useCallback(async (doc: Document) => {
    const full = await api.doc.get(doc.id);
    if (full) {
      setActiveDoc(full);
      setContent(full.content);
      setTitle(full.title);
    }
  }, []);

  const createDoc = useCallback(async () => {
    const id = await api.doc.create('Untitled', '');
    await loadDocs();
    const full = await api.doc.get(id);
    if (full) {
      setActiveDoc(full);
      setContent('');
      setTitle('Untitled');
    }
  }, [loadDocs]);

  const deleteDoc = useCallback(async (id: number) => {
    await api.doc.delete(id);
    if (activeDoc?.id === id) {
      setActiveDoc(null);
      setContent('');
      setTitle('');
    }
    await loadDocs();
  }, [activeDoc, loadDocs]);

  const autoSave = useCallback((newContent: string, newTitle: string) => {
    if (!activeDoc) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      api.doc.update(activeDoc.id, newTitle, newContent);
    }, 500);
  }, [activeDoc]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    autoSave(val, title);
  }, [title, autoSave]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    autoSave(content, val);
  }, [content, autoSave]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm font-medium">Markdown Editor</span>
        </div>
        <div className="flex items-center gap-1">
          {activeDoc && (
            <>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMode('edit')} title="Edit">
                <Code className={`w-4 h-4 ${mode === 'edit' ? 'text-primary' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMode('split')} title="Split">
                <FileText className={`w-4 h-4 ${mode === 'split' ? 'text-primary' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMode('preview')} title="Preview">
                <Eye className={`w-4 h-4 ${mode === 'preview' ? 'text-primary' : ''}`} />
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createDoc}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Document list */}
        <div className="w-56 border-r border-border flex flex-col">
          <ScrollArea className="flex-1">
            {docs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => selectDoc(doc)}
                className={`w-full text-left px-3 py-2 border-b border-border hover:bg-muted/50 transition-colors group ${
                  activeDoc?.id === doc.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate">{doc.title}</span>
                  <span
                    onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}
                    className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(doc.updated_at).toLocaleDateString()}
                </div>
              </button>
            ))}
            {docs.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">No documents yet.</p>
                <Button variant="ghost" size="sm" onClick={createDoc} className="gap-1 text-xs">
                  <Plus className="w-3 h-3" />
                  Create
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Editor area */}
        {activeDoc ? (
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 border-b border-border">
              <Input
                value={title}
                onChange={handleTitleChange}
                className="text-sm font-medium border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                placeholder="Document title..."
              />
            </div>
            <div className="flex-1 flex overflow-hidden">
              {(mode === 'edit' || mode === 'split') && (
                <div className={`${mode === 'split' ? 'w-1/2 border-r border-border' : 'w-full'} flex flex-col`}>
                  <textarea
                    value={content}
                    onChange={handleContentChange}
                    className="flex-1 p-4 bg-transparent text-sm font-mono resize-none focus:outline-none"
                    placeholder="Start writing markdown..."
                    spellCheck={false}
                  />
                </div>
              )}
              {(mode === 'preview' || mode === 'split') && (
                <ScrollArea className={mode === 'split' ? 'w-1/2' : 'w-full'}>
                  <div className="p-4 prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div>
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-medium">No document selected</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Select a document or create a new one</p>
              <Button variant="outline" onClick={createDoc} className="gap-2">
                <Plus className="w-4 h-4" />
                New Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
