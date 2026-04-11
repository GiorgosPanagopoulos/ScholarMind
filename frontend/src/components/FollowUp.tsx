import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { QAPair } from '../types';

interface Props {
  qaHistory: QAPair[];
  report: string;
  onAsk: (question: string, reportSummary: string) => Promise<void>;
}

export function FollowUp({ qaHistory, report, onAsk }: Props) {
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isAsking) return;

    setInput('');
    setIsAsking(true);

    // Use first 500 chars of report as summary
    const reportSummary = report.slice(0, 500);
    await onAsk(question, reportSummary);
    setIsAsking(false);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>💬</span> Follow-Up Questions
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Ask anything about the research findings
        </p>
      </div>

      {/* Q&A history */}
      {qaHistory.length > 0 && (
        <div className="px-6 py-4 space-y-6 max-h-96 overflow-y-auto">
          {qaHistory.map((pair, idx) => (
            <div key={idx} className="space-y-3">
              {/* Question */}
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-xs text-white font-bold">
                  Q
                </span>
                <p className="text-gray-100 text-sm font-medium pt-0.5">{pair.question}</p>
              </div>

              {/* Answer */}
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center text-xs text-white font-bold">
                  A
                </span>
                <div className="text-gray-300 text-sm markdown-content flex-1 min-w-0">
                  {pair.answer ? (
                    <ReactMarkdown>{pair.answer}</ReactMarkdown>
                  ) : (
                    <span className="text-indigo-400 animate-pulse">Thinking…</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input form */}
      <div className="px-6 py-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a follow-up question about the research…"
            disabled={isAsking}
            className="flex-1 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAsking}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors flex-shrink-0"
          >
            {isAsking ? 'Asking…' : 'Ask'}
          </button>
        </form>
      </div>
    </div>
  );
}
