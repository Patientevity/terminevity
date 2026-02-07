// Observation parser - extracts structured observations from AI conversations
// Adapted from claude-mem patterns

export interface ParsedObservation {
  type: 'decision' | 'bugfix' | 'feature' | 'learning' | 'preference' | 'context' | 'general';
  content: string;
  tags: string[];
}

const TYPE_PATTERNS: [RegExp, ParsedObservation['type']][] = [
  [/decided|decision|chose|choice/i, 'decision'],
  [/fix(?:ed)?|bug|error|issue|resolved/i, 'bugfix'],
  [/implement(?:ed)?|feature|add(?:ed)?|new/i, 'feature'],
  [/learn(?:ed)?|TIL|found out|discovered/i, 'learning'],
  [/prefer|like|want|always|never/i, 'preference'],
  [/context|background|note/i, 'context'],
];

export function parseObservations(text: string): ParsedObservation[] {
  // TODO: Implement full observation extraction logic
  // For now, return the full text as a general observation
  const observations: ParsedObservation[] = [];

  if (text.trim()) {
    let type: ParsedObservation['type'] = 'general';
    for (const [pattern, matchType] of TYPE_PATTERNS) {
      if (pattern.test(text)) {
        type = matchType;
        break;
      }
    }
    observations.push({ type, content: text.trim(), tags: [] });
  }

  return observations;
}
