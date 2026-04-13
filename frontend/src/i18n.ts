import type { Language } from './types';

export interface Translations {
  // SearchBar
  searchPlaceholder: string;
  research: string;
  researching: string;
  newResearch: string;
  tryLabel: string;
  // PipelineView
  pipelineTitle: string;
  planLabel: string;
  searchLabel: string;
  synthesizeLabel: string;
  writeLabel: string;
  subQuestionProgress: (cur: number, tot: number) => string;
  // ActivityFeed
  activityLog: string;
  awaitingActivity: string;
  // SubQuestions
  subQuestionsTitle: string;
  // ReportPanel
  reportTitle: string;
  copy: string;
  copied: string;
  exportPdf: string;
  sourceIndex: string;
  references: string;
  // FollowUp
  followUpTitle: string;
  followUpSubtitle: string;
  ask: string;
  asking: string;
  followUpPlaceholder: string;
  // Hero section
  heroTitle: string;
  heroDesc: string;
  smartPlanning: string;
  smartPlanningDesc: string;
  liveWebSearch: string;
  liveWebSearchDesc: string;
  academicReport: string;
  academicReportDesc: string;
  // Example topics
  exampleTopics: string[];
  // Citation style UI
  citationStyle: string;
  apaHint: string;
  ieeeHint: string;
  // Rotating taglines
  taglines: [string, string, string];
  // How it works
  howItWorks: [string, string, string, string];
  // Stats
  statsSubQ: string;
  statsSources: string;
  statsReport: string;
  // Keyboard hint
  pressEnter: string;
  // Misc
  somethingWentWrong: string;
}

export const translations: Record<Language, Translations> = {
  EN: {
    searchPlaceholder: 'Enter a research topic…',
    research: 'Research',
    researching: 'Researching…',
    newResearch: 'New Research',
    tryLabel: 'Try:',

    pipelineTitle: 'Research Pipeline',
    planLabel: 'Plan',
    searchLabel: 'Search',
    synthesizeLabel: 'Synthesize',
    writeLabel: 'Write',
    subQuestionProgress: (cur, tot) => `Sub-question ${cur} / ${tot}`,

    activityLog: 'Activity Log',
    awaitingActivity: 'Awaiting activity…',

    subQuestionsTitle: 'Research Sub-Questions',

    reportTitle: 'Research Report',
    copy: 'Copy',
    copied: 'Copied!',
    exportPdf: 'Export PDF',
    sourceIndex: 'Source Index',
    references: 'References',

    followUpTitle: 'Follow-Up Questions',
    followUpSubtitle: 'Ask anything about the research findings',
    ask: 'Ask',
    asking: 'Asking…',
    followUpPlaceholder: 'Ask a follow-up question…',

    heroTitle: 'Research anything, instantly',
    heroDesc:
      'ScholarMind autonomously breaks your topic into sub-questions, searches the web, synthesizes sources, and delivers a structured academic report — complete with citations.',
    smartPlanning: 'Smart Planning',
    smartPlanningDesc: 'AI breaks your topic into focused sub-questions',
    liveWebSearch: 'Live Web Search',
    liveWebSearchDesc: 'DuckDuckGo search for up-to-date information',
    academicReport: 'Academic Report',
    academicReportDesc: 'Structured report with APA or IEEE citations and PDF export',

    exampleTopics: [
      'The impact of large language models on scientific research',
      'Quantum computing applications in cryptography',
      'CRISPR gene editing: current capabilities and ethical implications',
    ],

    citationStyle: 'Citation Style',
    apaHint: '(Author, Year)',
    ieeeHint: '[1], [2]',

    taglines: [
      'From question to report in seconds',
      'AI-powered academic research',
      'Cite with confidence',
    ],
    howItWorks: ['Ask', 'Research', 'Synthesize', 'Report'],
    statsSubQ: 'Sub-Questions Generated',
    statsSources: 'Sources Analyzed',
    statsReport: 'Comprehensive Report',
    pressEnter: 'Press Enter to start',

    somethingWentWrong: 'Something went wrong.',
  },

  GR: {
    searchPlaceholder: 'Εισάγετε ένα ερευνητικό θέμα…',
    research: 'Αναζήτηση',
    researching: 'Σε εξέλιξη…',
    newResearch: 'Νέα Έρευνα',
    tryLabel: 'Δοκιμάστε:',

    pipelineTitle: 'Ερευνητικό Pipeline',
    planLabel: 'Σχέδιο',
    searchLabel: 'Αναζήτηση',
    synthesizeLabel: 'Σύνθεση',
    writeLabel: 'Συγγραφή',
    subQuestionProgress: (cur, tot) => `Υπο-ερώτημα ${cur} / ${tot}`,

    activityLog: 'Αρχείο Δραστηριότητας',
    awaitingActivity: 'Αναμονή δραστηριότητας…',

    subQuestionsTitle: 'Ερευνητικά Υπο-ερωτήματα',

    reportTitle: 'Ερευνητική Αναφορά',
    copy: 'Αντιγραφή',
    copied: 'Αντιγράφηκε!',
    exportPdf: 'Εξαγωγή PDF',
    sourceIndex: 'Ευρετήριο Πηγών',
    references: 'Βιβλιογραφία',

    followUpTitle: 'Επιπλέον Ερωτήσεις',
    followUpSubtitle: 'Ρωτήστε οτιδήποτε για τα ευρήματα της έρευνας',
    ask: 'Ερώτηση',
    asking: 'Σε εξέλιξη…',
    followUpPlaceholder: 'Υποβάλετε μια επιπλέον ερώτηση…',

    heroTitle: 'Ερευνήστε οτιδήποτε, άμεσα',
    heroDesc:
      'Το ScholarMind αναλύει αυτόματα το θέμα σας σε υπο-ερωτήματα, αναζητά στο διαδίκτυο, συνθέτει πηγές και παράγει μια δομημένη ακαδημαϊκή αναφορά — με πλήρεις παραπομπές.',
    smartPlanning: 'Έξυπνος Σχεδιασμός',
    smartPlanningDesc: 'Η ΤΝ αναλύει το θέμα σας σε εστιασμένα υπο-ερωτήματα',
    liveWebSearch: 'Ζωντανή Αναζήτηση',
    liveWebSearchDesc: 'Αναζήτηση DuckDuckGo για ενημερωμένες πληροφορίες',
    academicReport: 'Ακαδημαϊκή Αναφορά',
    academicReportDesc: 'Δομημένη αναφορά με παραπομπές APA ή IEEE και εξαγωγή PDF',

    exampleTopics: [
      'Η επίδραση των μεγάλων γλωσσικών μοντέλων στην επιστημονική έρευνα',
      'Εφαρμογές κβαντικών υπολογιστών στην κρυπτογραφία',
      'Επεξεργασία γονιδίων CRISPR: δυνατότητες και ηθικά ζητήματα',
    ],

    citationStyle: 'Στυλ Αναφορών',
    apaHint: '(Συγγραφέας, Έτος)',
    ieeeHint: '[1], [2]',

    taglines: [
      'Από ερώτημα σε αναφορά σε δευτερόλεπτα',
      'Ακαδημαϊκή έρευνα με ΤΝ',
      'Παραπομπές με αξιοπιστία',
    ],
    howItWorks: ['Ερώτηση', 'Αναζήτηση', 'Σύνθεση', 'Αναφορά'],
    statsSubQ: 'Υπο-ερωτήματα',
    statsSources: 'Πηγές',
    statsReport: 'Αναφορά',
    pressEnter: 'Πατήστε Enter για έναρξη',

    somethingWentWrong: 'Κάτι πήγε στραβά.',
  },
};
