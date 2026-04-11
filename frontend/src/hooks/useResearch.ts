import { useState, useCallback, useRef } from 'react';
import type { ResearchState, AgentUpdate, Source, QAPair } from '../types';

const INITIAL_STATE: ResearchState = {
  status: 'idle',
  topic: '',
  subQuestions: [],
  activities: [],
  report: '',
  sources: [],
  currentStep: 0,
  totalSteps: 0,
};

function timestamp(): string {
  return new Date().toLocaleTimeString();
}

export function useResearch() {
  const [state, setState] = useState<ResearchState>(INITIAL_STATE);
  const [qaHistory, setQaHistory] = useState<QAPair[]>([]);
  const reportRef = useRef<string>('');

  // ── helpers ──────────────────────────────────────────────────────────

  const addActivity = (msg: string) => {
    setState(prev => ({
      ...prev,
      activities: [...prev.activities, `[${timestamp()}] ${msg}`],
    }));
  };

  // ── startResearch ─────────────────────────────────────────────────────

  const startResearch = useCallback(async (topic: string) => {
    setState({
      ...INITIAL_STATE,
      status: 'planning',
      topic,
      activities: [`[${timestamp()}] Starting research on: "${topic}"`],
    });
    reportRef.current = '';

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          let update: AgentUpdate;
          try {
            update = JSON.parse(jsonStr);
          } catch {
            continue;
          }

          applyUpdate(update, topic);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setState(prev => ({
        ...prev,
        status: 'error',
        activities: [...prev.activities, `[${timestamp()}] Error: ${msg}`],
      }));
    }
  }, []);

  function applyUpdate(update: AgentUpdate, topic: string) {
    const { step, message, data } = update;

    switch (step) {
      case 'planning':
        if (Array.isArray(data)) {
          setState(prev => ({
            ...prev,
            status: 'planning',
            subQuestions: data,
            totalSteps: data.length,
            activities: [...prev.activities, `[${timestamp()}] ${message}`],
          }));
        } else {
          setState(prev => ({
            ...prev,
            status: 'planning',
            activities: [...prev.activities, `[${timestamp()}] ${message}`],
          }));
        }
        break;

      case 'searching':
        setState(prev => ({
          ...prev,
          status: 'searching',
          currentStep: update.sub_step ?? prev.currentStep,
          totalSteps: update.total_steps ?? prev.totalSteps,
          activities: [...prev.activities, `[${timestamp()}] ${message}`],
        }));
        break;

      case 'synthesizing':
        setState(prev => ({
          ...prev,
          status: 'synthesizing',
          currentStep: update.sub_step ?? prev.currentStep,
          totalSteps: update.total_steps ?? prev.totalSteps,
          activities: [...prev.activities, `[${timestamp()}] ${message}`],
        }));
        break;

      case 'writing':
        setState(prev => ({
          ...prev,
          status: 'writing',
          activities: [...prev.activities, `[${timestamp()}] ${message}`],
        }));
        break;

      case 'complete':
        if (data) {
          const report: string = data.report ?? '';
          const sources: Source[] = data.sources ?? [];
          const subQuestions: string[] = data.sub_questions ?? [];
          reportRef.current = report;
          setState(prev => ({
            ...prev,
            status: 'complete',
            report,
            sources,
            subQuestions: subQuestions.length ? subQuestions : prev.subQuestions,
            activities: [
              ...prev.activities,
              `[${timestamp()}] Research complete — report ready.`,
            ],
          }));
        }
        break;

      case 'error':
        setState(prev => ({
          ...prev,
          status: 'error',
          activities: [...prev.activities, `[${timestamp()}] Error: ${message}`],
        }));
        break;

      default:
        if (message) {
          setState(prev => ({
            ...prev,
            activities: [...prev.activities, `[${timestamp()}] ${message}`],
          }));
        }
    }
  }

  // ── askFollowup ────────────────────────────────────────────────────────

  const askFollowup = useCallback(
    async (question: string, reportSummary: string): Promise<void> => {
      const topic = state.topic;
      // Optimistically add the pair with empty answer
      setQaHistory(prev => [...prev, { question, answer: '' }]);

      try {
        const response = await fetch('/api/followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, topic, report_summary: reportSummary }),
        });

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            let update: AgentUpdate;
            try {
              update = JSON.parse(jsonStr);
            } catch {
              continue;
            }

            if (update.step === 'followup') {
              if (!update.done) {
                accumulated += update.message;
                // Update the last QA pair answer
                setQaHistory(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    answer: accumulated,
                  };
                  return updated;
                });
              }
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setQaHistory(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            answer: `Error: ${msg}`,
          };
          return updated;
        });
      }
    },
    [state.topic]
  );

  // ── exportPdf ──────────────────────────────────────────────────────────

  const exportPdf = useCallback(async () => {
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_text: state.report,
          topic: state.topic,
          sources: state.sources,
        }),
      });

      if (!response.ok) throw new Error(`PDF export failed: ${response.statusText}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scholarmind_${state.topic.slice(0, 30).replace(/\s+/g, '_')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF export error:', err);
    }
  }, [state.report, state.topic, state.sources]);

  // ── reset ──────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setState(INITIAL_STATE);
    setQaHistory([]);
    reportRef.current = '';
  }, []);

  return {
    state,
    qaHistory,
    startResearch,
    askFollowup,
    exportPdf,
    reset,
  };
}
