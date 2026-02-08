import React, { useEffect, useState, useCallback } from 'react';
import { Brain, Search, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMemory } from '@/hooks/useMemory';
import { useMemoryStore } from '@/stores/memory-store';
import type { Session, Observation } from '@/types';

const TYPE_COLORS: Record<string, string> = {
  decision: 'text-blue-400 bg-blue-400/10',
  bugfix: 'text-red-400 bg-red-400/10',
  feature: 'text-green-400 bg-green-400/10',
  learning: 'text-yellow-400 bg-yellow-400/10',
  preference: 'text-purple-400 bg-purple-400/10',
  context: 'text-cyan-400 bg-cyan-400/10',
  general: 'text-muted-foreground bg-muted',
};

export function MemoryViewer() {
  const { sessions, observations, searchResults, isSearching, currentSession } = useMemoryStore();
  const { setCurrentSession } = useMemoryStore();
  const { loadSessions, loadObservations, search } = useMemory();
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'sessions' | 'search'>('sessions');

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSelectSession = useCallback(async (session: Session) => {
    setCurrentSession(session);
    await loadObservations(session.id);
  }, [setCurrentSession, loadObservations]);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      setView('search');
      await search(searchQuery);
    }
  }, [searchQuery, search]);

  const displayObservations = view === 'search' ? searchResults : observations;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-12 px-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          <span className="text-sm font-medium">Memory</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sessions sidebar */}
        <div className="w-64 border-r border-border flex flex-col">
          <div className="p-2 border-b border-border">
            <div className="flex gap-1">
              <button
                onClick={() => setView('sessions')}
                className={`flex-1 px-2 py-1 text-xs rounded ${view === 'sessions' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              >
                Sessions
              </button>
              <button
                onClick={() => setView('search')}
                className={`flex-1 px-2 py-1 text-xs rounded ${view === 'search' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
              >
                Search
              </button>
            </div>
          </div>
          {view === 'search' && (
            <div className="p-2 border-b border-border">
              <div className="flex gap-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search memories..."
                  className="text-xs h-7"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleSearch}>
                  <Search className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
          <ScrollArea className="flex-1">
            {view === 'sessions' && sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session)}
                className={`w-full text-left px-3 py-2 border-b border-border hover:bg-muted/50 transition-colors ${
                  currentSession?.id === session.id ? 'bg-muted' : ''
                }`}
              >
                <div className="text-sm font-medium truncate">{session.title}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {new Date(session.started_at).toLocaleDateString()}
                  {!session.ended_at && <span className="text-green-400 ml-1">active</span>}
                </div>
              </button>
            ))}
            {view === 'sessions' && sessions.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No sessions yet. Sessions are created during AI conversations.
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Observations area */}
        <div className="flex-1 flex flex-col">
          {currentSession && view === 'sessions' && (
            <div className="px-4 py-2 border-b border-border">
              <h3 className="text-sm font-medium">{currentSession.title}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(currentSession.started_at).toLocaleString()}
                {currentSession.summary && ` -- ${currentSession.summary}`}
              </p>
            </div>
          )}
          {view === 'search' && searchResults.length > 0 && (
            <div className="px-4 py-2 border-b border-border">
              <p className="text-xs text-muted-foreground">{searchResults.length} results for "{searchQuery}"</p>
            </div>
          )}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {displayObservations.map((obs: Observation) => (
                <div key={obs.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${TYPE_COLORS[obs.type] ?? TYPE_COLORS.general}`}>
                      {obs.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(obs.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{obs.content}</p>
                  {obs.tags && obs.tags !== '[]' && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="w-3 h-3 text-muted-foreground" />
                      {JSON.parse(obs.tags).map((tag: string) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {displayObservations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Brain className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {view === 'search' ? 'Search for memories above' : 'Select a session to view observations'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
