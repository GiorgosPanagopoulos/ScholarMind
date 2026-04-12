import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import type { QAPair, Language } from '../types';
import { translations } from '../i18n';

interface Props {
  qaHistory: QAPair[];
  report: string;
  onAsk: (question: string, reportSummary: string) => Promise<void>;
  lang: Language;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-700/60 rounded-2xl rounded-tl-sm w-fit">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

export function FollowUp({ qaHistory, report, onAsk, lang }: Props) {
  const T = translations[lang];
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
    <div className="glass-card shadow-xl shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/8 flex items-start gap-3">
        <span className="w-7 h-7 rounded-lg bg-indigo-900/60 border border-indigo-700/40 flex items-center justify-center shrink-0 mt-0.5">
          <MessageCircle className="w-4 h-4 text-indigo-400" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-white">{T.followUpTitle}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{T.followUpSubtitle}</p>
        </div>
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
                <div className="max-w-[85%] bg-slate-700/60 border border-white/8 rounded-2xl rounded-tl-sm shadow-md overflow-hidden">
                  {pair.answer ? (
                    <div className="text-slate-200 text-sm markdown-content px-4 py-2.5">
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
      <div className={`px-5 py-4 ${qaHistory.length > 0 ? 'border-t border-white/8' : ''}`}>
        <form onSubmit={handleSubmit} className="flex gap-2.5">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={T.followUpPlaceholder}
            disabled={isAsking}
            className="flex-1 bg-slate-700/60 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-55 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || isAsking}
            className="shrink-0 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-md shadow-indigo-900/30 active:scale-[0.97]"
          >
            {isAsking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>{isAsking ? T.asking : T.ask}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
