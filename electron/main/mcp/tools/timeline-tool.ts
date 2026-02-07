// MCP Tool: Get session timeline
// Full implementation in Phase 11

export const timelineTool = {
  name: 'get_timeline',
  description: 'Get a timeline of sessions and activities',
  inputSchema: {
    type: 'object',
    properties: {
      limit: { type: 'number', description: 'Max sessions', default: 10 },
    },
  },
};
