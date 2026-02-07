export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  name: string;
  goals: string;
  intents: string;
  github_username: string | null;
  github_token: string | null;
  preferred_note_tool: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIProvider {
  id: number;
  name: string;
  type: 'claude' | 'openai' | 'gemini';
  api_key_encrypted: string;
  model: string;
  is_default: boolean;
  enabled: boolean;
  created_at: string;
}

export interface Workspace {
  id: number;
  name: string;
  path: string;
  is_active: boolean;
  created_at: string;
}

export interface Session {
  id: number;
  title: string;
  workspace_id: number | null;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
}

export interface Observation {
  id: number;
  session_id: number;
  type: 'decision' | 'bugfix' | 'feature' | 'learning' | 'preference' | 'context' | 'general';
  content: string;
  tags: string;
  source: string | null;
  created_at: string;
}

export interface SessionSummary {
  id: number;
  session_id: number;
  summary: string;
  key_decisions: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  provider_id: number;
  workspace_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used: number | null;
  created_at: string;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  workspace_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface Canvas {
  id: number;
  title: string;
  data: string;
  workspace_id: number | null;
  created_at: string;
  updated_at: string;
}
