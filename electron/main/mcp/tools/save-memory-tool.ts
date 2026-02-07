// MCP Tool: Save a memory observation
// Full implementation in Phase 11

export const saveMemoryTool = {
  name: 'save_memory',
  description: 'Save an observation to memory',
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['decision', 'bugfix', 'feature', 'learning', 'preference', 'context', 'general'],
      },
      content: { type: 'string', description: 'The observation content' },
      tags: { type: 'array', items: { type: 'string' }, description: 'Tags' },
    },
    required: ['type', 'content'],
  },
};
