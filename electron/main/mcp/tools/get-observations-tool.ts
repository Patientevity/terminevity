// MCP Tool: Get observations for a session
// Full implementation in Phase 11

export const getObservationsTool = {
  name: 'get_observations',
  description: 'Get observations for a specific session',
  inputSchema: {
    type: 'object',
    properties: {
      session_id: { type: 'number', description: 'Session ID' },
    },
    required: ['session_id'],
  },
};
