import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { QAPair } from '../types';

interface Props {
  qaHistory: QAPair[];
  report: string;
  onAsk: (question: string, reportSummary: string) => Promise<void>;
}

function SendIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-700/60 rounded-2xl rounded-tl-sm w-fit">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

export function FollowUp({ qaHistory, report, onAsk }: Props) {
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaHistory]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || isAsking) return;

    setInput('');
    setIsAsking(true);
    await onAsk(question, report.slice(0, 500));
    setIsAsking(false);
  };

  return (
    <div className="bg-gray-800/90 rounded-2xl border border-gray-700/80 shadow-xl shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/80">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-900/60 border border-indigo-700/40 flex items-center justify-center text-sm">
            💬
          </span>
          Follow-Up Questions
        </h2>
        <p className="text-xs text-gray-500 mt-1.5 ml-9">Ask anything about the research findings</p>
      </div>

      {/* Q&A history */}
      {qaHistory.length > 0 && (
        <div className="px-5 py-5 space-y-5 max-h-120 overflow-y-auto">
          {qaHistory.map((pair, idx) => (
            <div key={idx} className="space-y-3 slide-up">
              {/* Question bubble */}
              <div className="flex items-start gap-3 justify-end">
                <div className="max-w-[85%] bg-indigo-600/80 border border-indigo-500/40 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-md">
                  {pair.question}
                </div>
                <span className="shrink-0 w-7 h-7 rounded-full bg-indigo-700 border border-indigo-500/40 flex items-center justify-center text-xs text-white font-bold shadow-sm mt-0.5">
                  Q
                </span>
              </div>

              {/* Answer bubble */}
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-800/80 border border-emerald-600/40 flex items-center justify-center text-xs text-emerald-200 font-bold shadow-sm mt-0.5">
                  A
                </span>
                <div className="max-w-[85%] bg-gray-700/60 border border-gray-600/40 rounded-2xl rounded-tl-sm shadow-md overflow-hidden">
                  {pair.answer ? (
                    <div className="text-gray-200 text-sm markdown-content px-4 py-2.5">
                      <ReactMarkdown>{pair.answer}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="px-3 py-2.5">
                      <TypingIndicator />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div className={`px-5 py-4 ${qaHistory.length > 0 ? 'border-t border-gray-700/80' : ''}`}>
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a follow-up question…"
            disabled={isAsking}
            className="flex-1 bg-gray-700/60 border border-gray-600/80 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-55 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAsking}
            className="shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-md shadow-indigo-900/30 active:scale-[0.97]"
          >
            {isAsking ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <SendIcon />
            )}
            <span>{isAsking ? 'Asking…' : 'Ask'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
