import { SearchService } from './search-service';

export class ContextInjector {
  constructor(private searchService: SearchService) {}

  // Inject relevant memory context into AI prompts
  buildContext(userMessage: string): string {
    const relevant = this.searchService.search(userMessage, 5);

    if (relevant.length === 0) return '';

    const contextLines = relevant.map((obs: any) =>
      `[${obs.type}] ${obs.content} (${obs.created_at})`,
    );

    return `\n<memory_context>\nRelevant past observations:\n${contextLines.join('\n')}\n</memory_context>\n`;
  }
}
