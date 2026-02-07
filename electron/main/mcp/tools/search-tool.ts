// MCP Tool: Search memory observations
// Full implementation in Phase 11

export const searchTool = {
  name: 'search_memory',
  description: 'Search through stored observations and memory',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      limit: { type: 'number', description: 'Max results', default: 10 },
    },
    required: ['query'],
  },
};
