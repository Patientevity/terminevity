import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import '@excalidraw/excalidraw/index.css';
import { api } from '@/lib/ipc';
import type { Canvas } from '@/types';

export function CanvasPage() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [activeCanvasId, setActiveCanvasId] = useState<number | null>(null);
  const [canvasData, setCanvasData] = useState<object | null>(null);
  const [title, setTitle] = useState('');
  const [ExcalidrawComp, setExcalidrawComp] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const excalidrawApiRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Lazy-load Excalidraw
  useEffect(() => {
    import('@excalidraw/excalidraw').then((mod) => {
      setExcalidrawComp(() => mod.Excalidraw);
    }).catch(() => {
      // Excalidraw failed to load
    });
  }, []);

  // Load canvas list and auto-select
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      const list = await api.canvas.list();
      if (list.length === 0) {
        // Auto-create first canvas
        const id = await api.canvas.create('Untitled Canvas', '{}');
        const full = await api.canvas.get(id);
        if (full) {
          setCanvases([full]);
          setActiveCanvasId(full.id);
          setCanvasData(parseCanvasData(full.data));
          setTitle(full.title);
        }
      } else {
        // Sort by updated_at descending and pick the most recent
        const sorted = [...list].sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setCanvases(sorted);
        const mostRecent = sorted[0];
        const full = await api.canvas.get(mostRecent.id);
        if (full) {
          setActiveCanvasId(full.id);
          setCanvasData(parseCanvasData(full.data));
          setTitle(full.title);
        }
      }
      setReady(true);
    })();
  }, []);

  const refreshCanvasList = useCallback(async () => {
    const list = await api.canvas.list();
    const sorted = [...list].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    setCanvases(sorted);
  }, []);

  const selectCanvas = useCallback(async (id: number) => {
    if (id === activeCanvasId) {
      setDropdownOpen(false);
      return;
    }
    const full = await api.canvas.get(id);
    if (full) {
      setActiveCanvasId(full.id);
      setCanvasData(parseCanvasData(full.data));
      setTitle(full.title);
    }
    setDropdownOpen(false);
  }, [activeCanvasId]);

  const createCanvas = useCallback(async () => {
    const id = await api.canvas.create('Untitled Canvas', '{}');
    await refreshCanvasList();
    const full = await api.canvas.get(id);
    if (full) {
      setActiveCanvasId(full.id);
      setCanvasData(null);
      setTitle('Untitled Canvas');
    }
    setDropdownOpen(false);
  }, [refreshCanvasList]);

  const deleteCanvas = useCallback(async () => {
    if (!activeCanvasId) return;
    await api.canvas.delete(activeCanvasId);

    const remaining = canvases.filter((c) => c.id !== activeCanvasId);
    setCanvases(remaining);

    if (remaining.length > 0) {
      const next = remaining[0];
      const full = await api.canvas.get(next.id);
      if (full) {
        setActiveCanvasId(full.id);
        setCanvasData(parseCanvasData(full.data));
        setTitle(full.title);
      }
    } else {
      // Auto-create a new one so we never have an empty state
      const id = await api.canvas.create('Untitled Canvas', '{}');
      await refreshCanvasList();
      const full = await api.canvas.get(id);
      if (full) {
        setActiveCanvasId(full.id);
        setCanvasData(null);
        setTitle('Untitled Canvas');
      }
    }
  }, [activeCanvasId, canvases, refreshCanvasList]);

  const handleChange = useCallback((elements: readonly any[], appState: any) => {
    if (!activeCanvasId) return;
    // Track zoom for the indicator
    const zoomVal = typeof appState.zoom === 'object' ? appState.zoom.value : appState.zoom;
    if (zoomVal) setZoomPercent(Math.round(zoomVal * 100));

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const data = JSON.stringify({
        elements,
        appState: {
          viewBackgroundColor: '#ffffff',
          zoom: appState.zoom,
          scrollX: appState.scrollX,
          scrollY: appState.scrollY,
        },
      });
      api.canvas.update(activeCanvasId, title, data);
    }, 1000);
  }, [activeCanvasId, title]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (activeCanvasId) {
      if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
      titleTimerRef.current = setTimeout(() => {
        // Get current data from Excalidraw to avoid overwriting with stale data
        const currentApi = excalidrawApiRef.current;
        if (currentApi) {
          const elements = currentApi.getSceneElements();
          const appState = currentApi.getAppState();
          const data = JSON.stringify({
            elements,
            appState: {
              viewBackgroundColor: appState.viewBackgroundColor,
              zoom: appState.zoom,
              scrollX: appState.scrollX,
              scrollY: appState.scrollY,
            },
          });
          api.canvas.update(activeCanvasId, val, data);
        } else {
          api.canvas.update(activeCanvasId, val, '{}');
        }
        refreshCanvasList();
      }, 500);
    }
  }, [activeCanvasId, refreshCanvasList]);

  const initialData = useMemo(() => {
    const base = { appState: { viewBackgroundColor: '#ffffff' } };
    if (!canvasData) return base;
    const d = canvasData as any;
    return {
      ...d,
      appState: { ...d.appState, viewBackgroundColor: '#ffffff' },
    };
  }, [canvasData]);

  // Show nothing until we've loaded
  if (!ready || !ExcalidrawComp) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-sm text-muted-foreground">Loading canvas...</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Excalidraw — full-screen */}
      <ExcalidrawComp
        key={activeCanvasId}
        excalidrawAPI={(a: any) => { excalidrawApiRef.current = a; }}
        initialData={initialData}
        onChange={handleChange}
        theme="light"
        gridModeEnabled
        autoFocus
        UIOptions={{
          canvasActions: {
            saveAsImage: true,
            changeViewBackgroundColor: false,
            clearCanvas: true,
            toggleTheme: false,
          },
        }}
      />

      {/* Floating canvas bar */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 10,
        }}
        className="flex items-center gap-1"
      >
        <div ref={dropdownRef} className="relative">
          {/* Canvas title + dropdown trigger */}
          <div
            className="flex items-center gap-1 rounded-lg px-2 py-1.5 cursor-pointer select-none"
            style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}
          >
            <input
              value={title}
              onChange={handleTitleChange}
              className="bg-transparent border-none outline-none text-sm font-medium w-40 text-zinc-900"
              placeholder="Canvas title..."
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="p-0.5 rounded hover:bg-black/5"
              title="Switch canvas"
            >
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className="absolute top-full left-0 mt-1 rounded-lg shadow-lg overflow-hidden min-w-[220px]"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0,0,0,0.1)',
              }}
            >
              <div className="max-h-64 overflow-y-auto">
                {canvases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectCanvas(c.id)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      c.id === activeCanvasId
                        ? 'bg-black/5 text-black'
                        : 'text-zinc-700 hover:bg-black/5'
                    }`}
                  >
                    <div className="truncate">{c.title}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {new Date(c.updated_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* New canvas button */}
        <button
          onClick={createCanvas}
          className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-700"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
          title="New canvas"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Delete canvas button */}
        <button
          onClick={deleteCanvas}
          className="rounded-lg p-1.5 text-zinc-500 hover:text-red-500"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
          title="Delete canvas"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Zoom indicator */}
        <div
          className="rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-500 tabular-nums"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
        >
          {zoomPercent}%
        </div>
      </div>
    </div>
  );
}

function parseCanvasData(data: string): object | null {
  if (!data || data === '{}') return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}
