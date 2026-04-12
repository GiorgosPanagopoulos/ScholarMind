export type CitationFormat = 'APA' | 'IEEE';
export type Language = 'EN' | 'GR';

export interface AgentUpdate {
  step: string;
  sub_step?: number;
  total_steps?: number;
  message: string;
  data?: any;
  done?: boolean;
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

export type ResearchStatus =
  | 'idle'
  | 'planning'
  | 'searching'
  | 'synthesizing'
  | 'writing'
  | 'complete'
  | 'error';

export interface ResearchState {
  status: ResearchStatus;
  topic: string;
  subQuestions: string[];
  activities: string[];
  report: string;
  sources: Source[];
  currentStep: number;
  totalSteps: number;
  citationFormat: CitationFormat;
}

export interface QAPair {
  question: string;
  answer: string;
}
