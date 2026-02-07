export interface TerminalInstance {
  id: string;
  title: string;
  cwd: string;
  isActive: boolean;
}

export interface TerminalSplit {
  id: string;
  direction: 'horizontal' | 'vertical';
  terminalIds: string[];
  sizes: number[];
}

export interface TerminalTab {
  id: string;
  label: string;
  terminalId: string;
  splits?: TerminalSplit;
}
