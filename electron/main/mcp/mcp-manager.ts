import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import Database from 'better-sqlite3';
import { MemoryService } from '../memory/memory-service';
import { SessionManager } from '../memory/session-manager';
import { SearchService } from '../memory/search-service';

interface MCPServerConfig {
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
}

export class MCPManager {
  private server: Server | null = null;
  private memoryService: MemoryService;
  private sessionManager: SessionManager;
  private searchService: SearchService;
  private externalServers = new Map<string, { config: MCPServerConfig; status: string }>();

  constructor(private db: Database.Database) {
    this.memoryService = new MemoryService(db);
    this.sessionManager = new SessionManager(db);
    this.searchService = new SearchService(db);
  }

  async start(): Promise<void> {
    this.server = new Server(
      { name: 'terminevity', version: '0.1.0' },
      { capabilities: { tools: {} } },
    );

    this.registerToolHandlers();
    console.log('MCP Manager initialized with tools');
  }

  async startStdioTransport(): Promise<void> {
    if (!this.server) await this.start();
    const transport = new StdioServerTransport();
    await this.server!.connect(transport);
  }

  private registerToolHandlers(): void {
    if (!this.server) return;

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'memory_search',
          description: 'Search through past observations and memories by query string',
          inputSchema: {
            type: 'object' as const,
            properties: {
              query: { type: 'string', description: 'The search query' },
              limit: { type: 'number', description: 'Max results to return (default 20)' },
            },
            required: ['query'],
          },
        },
        {
          name: 'memory_save',
          description: 'Save a new observation to long-term memory',
          inputSchema: {
            type: 'object' as const,
            properties: {
              session_id: { type: 'number', description: 'The session ID to save the observation to' },
              type: {
                type: 'string',
                enum: ['decision', 'bugfix', 'feature', 'learning', 'preference', 'context', 'general'],
                description: 'Type of observation',
              },
              content: { type: 'string', description: 'The observation content' },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Tags for the observation',
              },
            },
            required: ['session_id', 'type', 'content'],
          },
        },
        {
          name: 'session_list',
          description: 'List recent sessions',
          inputSchema: {
            type: 'object' as const,
            properties: {
              limit: { type: 'number', description: 'Max sessions to return (default 20)' },
            },
          },
        },
        {
          name: 'session_create',
          description: 'Create a new session',
          inputSchema: {
            type: 'object' as const,
            properties: {
              title: { type: 'string', description: 'Session title' },
            },
            required: ['title'],
          },
        },
        {
          name: 'session_end',
          description: 'End an active session with an optional summary',
          inputSchema: {
            type: 'object' as const,
            properties: {
              session_id: { type: 'number', description: 'Session ID to end' },
              summary: { type: 'string', description: 'Optional summary of the session' },
            },
            required: ['session_id'],
          },
        },
        {
          name: 'message_search',
          description: 'Search through past chat messages',
          inputSchema: {
            type: 'object' as const,
            properties: {
              query: { type: 'string', description: 'The search query' },
              limit: { type: 'number', description: 'Max results to return (default 20)' },
            },
            required: ['query'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'memory_search': {
          const results = this.searchService.search(
            args?.query as string,
            (args?.limit as number) ?? 20,
          );
          return {
            content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
          };
        }

        case 'memory_save': {
          const id = this.memoryService.saveObservation(
            args?.session_id as number,
            args?.type as string,
            args?.content as string,
            (args?.tags as string[]) ?? [],
          );
          return {
            content: [{ type: 'text', text: JSON.stringify({ id, status: 'saved' }) }],
          };
        }

        case 'session_list': {
          const sessions = this.sessionManager.getAllSessions(
            (args?.limit as number) ?? 20,
          );
          return {
            content: [{ type: 'text', text: JSON.stringify(sessions, null, 2) }],
          };
        }

        case 'session_create': {
          const sessionId = this.sessionManager.createSession(args?.title as string);
          return {
            content: [{ type: 'text', text: JSON.stringify({ id: sessionId, status: 'created' }) }],
          };
        }

        case 'session_end': {
          this.sessionManager.endSession(
            args?.session_id as number,
            args?.summary as string | undefined,
          );
          return {
            content: [{ type: 'text', text: JSON.stringify({ status: 'ended' }) }],
          };
        }

        case 'message_search': {
          const messages = this.searchService.searchMessages(
            args?.query as string,
            (args?.limit as number) ?? 20,
          );
          return {
            content: [{ type: 'text', text: JSON.stringify(messages, null, 2) }],
          };
        }

        default:
          return {
            content: [{ type: 'text', text: `Unknown tool: ${name}` }],
            isError: true,
          };
      }
    });
  }

  addExternalServer(config: MCPServerConfig): void {
    this.externalServers.set(config.name, { config, status: 'stopped' });
  }

  removeExternalServer(name: string): void {
    this.externalServers.delete(name);
  }

  listServers(): { name: string; status: string; type: string }[] {
    const servers: { name: string; status: string; type: string }[] = [
      { name: 'terminevity', status: this.server ? 'running' : 'stopped', type: 'builtin' },
    ];
    for (const [name, entry] of this.externalServers) {
      servers.push({ name, status: entry.status, type: 'external' });
    }
    return servers;
  }

  async stop(): Promise<void> {
    if (this.server) {
      await this.server.close();
      this.server = null;
    }
    this.externalServers.clear();
  }
}
