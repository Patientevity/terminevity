import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Palette, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/lib/ipc';
import type { Canvas } from '@/types';

let Excalidraw: any = null;

export function CanvasPage() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [activeCanvas, setActiveCanvas] = useState<Canvas | null>(null);
  const [title, setTitle] = useState('');
  const [excalidrawLoaded, setExcalidrawLoaded] = useState(false);
  const [ExcalidrawComponent, setExcalidrawComponent] = useState<any>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const excalidrawApiRef = useRef<any>(null);

  useEffect(() => {
    import('@excalidraw/excalidraw').then((mod) => {
      setExcalidrawComponent(() => mod.Excalidraw);
      setExcalidrawLoaded(true);
    }).catch(() => {
      // Excalidraw failed to load
    });
  }, []);

  const loadCanvases = useCallback(async () => {
    const list = await api.canvas.list();
    setCanvases(list);
  }, []);

  useEffect(() => {
    loadCanvases();
  }, [loadCanvases]);

  const selectCanvas = useCallback(async (canvas: Canvas) => {
    const full = await api.canvas.get(canvas.id);
    if (full) {
      setActiveCanvas(full);
      setTitle(full.title);
    }
  }, []);

  const createCanvas = useCallback(async () => {
    const id = await api.canvas.create('Untitled Canvas', '{}');
    await loadCanvases();
    const full = await api.canvas.get(id);
    if (full) {
      setActiveCanvas(full);
      setTitle('Untitled Canvas');
    }
  }, [loadCanvases]);

  const deleteCanvas = useCallback(async (id: number) => {
    await api.canvas.delete(id);
    if (activeCanvas?.id === id) {
      setActiveCanvas(null);
      setTitle('');
    }
    await loadCanvases();
  }, [activeCanvas, loadCanvases]);

  const handleChange = useCallback((elements: any[], appState: any) => {
    if (!activeCanvas) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const data = JSON.stringify({ elements, appState: { viewBackgroundColor: appState.viewBackgroundColor } });
      api.canvas.update(activeCanvas.id, title, data);
    }, 1000);
  }, [activeCanvas, title]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (activeCanvas) {
      api.canvas.update(activeCanvas.id, val, activeCanvas.data);
    }
  }, [activeCanvas]);

  const getInitialData = useCallback(() => {
    if (!activeCanvas?.data || activeCanvas.data === '{}') return undefined;
    try {
      return JSON.parse(activeCanvas.data);
    } catch {
      return undefined;
    }
  }, [activeCanvas]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <span className="text-sm font-medium">Canvas</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createCanvas}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Canvas list */}
        <div className="w-56 border-r border-border flex flex-col">
          <ScrollArea className="flex-1">
            {canvases.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCanvas(c)}
                className={`w-full text-left px-3 py-2 border-b border-border hover:bg-muted/50 transition-colors group ${
                  activeCanvas?.id === c.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate">{c.title}</span>
                  <span
                    onClick={(e) => { e.stopPropagation(); deleteCanvas(c.id); }}
                    className="p-0.5 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {new Date(c.updated_at).toLocaleDateString()}
                </div>
              </button>
            ))}
            {canvases.length === 0 && (
              <div className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-2">No canvases yet.</p>
                <Button variant="ghost" size="sm" onClick={createCanvas} className="gap-1 text-xs">
                  <Plus className="w-3 h-3" />
                  Create
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Canvas area */}
        {activeCanvas ? (
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 border-b border-border">
              <Input
                value={title}
                onChange={handleTitleChange}
                className="text-sm font-medium border-none bg-transparent p-0 h-auto focus-visible:ring-0"
                placeholder="Canvas title..."
              />
            </div>
            <div className="flex-1 relative">
              {excalidrawLoaded && ExcalidrawComponent ? (
                <ExcalidrawComponent
                  key={activeCanvas.id}
                  ref={excalidrawApiRef}
                  initialData={getInitialData()}
                  onChange={handleChange}
                  theme="dark"
                  UIOptions={{ canvasActions: { saveAsImage: true } }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Loading canvas...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div>
              <Palette className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-medium">No canvas selected</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Select a canvas or create a new one</p>
              <Button variant="outline" onClick={createCanvas} className="gap-2">
                <Plus className="w-4 h-4" />
                New Canvas
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
