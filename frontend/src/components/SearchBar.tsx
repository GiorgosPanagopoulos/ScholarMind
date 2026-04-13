import { useState } from 'react';
import { Search, Loader2, RotateCcw } from 'lucide-react';
import type { CitationFormat, Language } from '../types';
import { translations } from '../i18n';

interface Props {
  onSearch: (topic: string, citationFormat: CitationFormat) => void;
  onReset: () => void;
  isLoading: boolean;
  hasResult: boolean;
  lang: Language;
}

export function SearchBar({ onSearch, onReset, isLoading, hasResult, lang }: Props) {
  const [value, setValue] = useState('');
  const [citationFormat, setCitationFormat] = useState<CitationFormat>('APA');
  const T = translations[lang];

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    const topic = value.trim();
    if (topic && !isLoading) onSearch(topic, citationFormat);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full">

      {/* ── Citation Style — secondary, compact, above search ── */}
      {!hasResult && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">
            {T.citationStyle}
          </span>
          <div className="inline-flex items-center bg-slate-800/30 rounded-full p-1 border border-white/8">
            {(['APA', 'IEEE'] as CitationFormat[]).map(fmt => (
              <button
                key={fmt}
                type="button"
                onClick={() => setCitationFormat(fmt)}
                disabled={isLoading}
                className={[
                  'flex flex-col items-center min-w-20 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-200 disabled:opacity-50',
                  citationFormat === fmt
                    ? 'bg-linear-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-gray-400 hover:text-gray-200',
                ].join(' ')}
              >
                <span className="leading-tight">{fmt}</span>
                <span className="text-[10px] opacity-60 leading-tight">{fmt === 'APA' ? T.apaHint : T.ieeeHint}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Search — primary, dominant ── */}
      <div className="flex flex-col w-full max-w-2xl mx-auto gap-3">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          {/* Input */}
          <div className="search-gradient-border flex-1">
            <div className="search-gradient-inner relative">
              <input
                type="text"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder=""
                disabled={isLoading}
                className="w-full h-16 bg-slate-800/90 text-white rounded-[calc(0.75rem-1.5px)] px-8 text-xl focus:outline-none disabled:opacity-55 transition-all duration-200 shadow-lg shadow-indigo-500/10"
              />
              {!value && (
                <div className="absolute inset-0 pointer-events-none flex items-center px-8">
                  <span className="text-slate-500 text-xl">{T.searchPlaceholder}</span>
                  {!isLoading && <span className="typewriter-cursor ml-0.5">|</span>}
                </div>
              )}
            </div>
          </div>

          {/* Action button */}
          {hasResult ? (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center justify-center gap-2 glass-card border-white/10 hover:border-white/20 hover:bg-slate-700/60 text-slate-300 hover:text-white font-bold px-8 h-16 rounded-xl text-lg transition-all duration-200 shrink-0 shadow-md"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{T.newResearch}</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim() || isLoading}
              className={[
                'flex items-center justify-center gap-2 text-white font-bold px-8 h-16 rounded-xl text-lg shrink-0 transition-all duration-200',
                'bg-linear-to-br from-indigo-500 to-indigo-700',
                'hover:from-indigo-400 hover:to-indigo-600',
                'active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                !isLoading && value.trim() ? 'btn-glow' : '',
                'shadow-lg shadow-indigo-900/40',
              ].join(' ')}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{T.researching}</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>{T.research}</span>
                </>
              )}
            </button>
          )}
        </form>

        {/* Keyboard hint */}
        {!hasResult && !isLoading && (
          <p className="text-xs text-slate-600 italic text-center">{T.pressEnter}</p>
        )}

        {/* Example topics */}
        {!isLoading && !hasResult && (
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <span className="text-xs text-slate-600 font-medium shrink-0">{T.tryLabel}</span>
            {T.exampleTopics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => setValue(topic)}
                className="text-xs bg-slate-800/60 hover:bg-indigo-900/30 text-slate-400 hover:text-slate-200 border border-white/10 hover:border-indigo-500/40 hover:shadow-sm hover:shadow-indigo-500/20 px-4 py-2 rounded-full transition-all duration-200"
              >
                {topic.length > 50 ? topic.slice(0, 50) + '…' : topic}
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
