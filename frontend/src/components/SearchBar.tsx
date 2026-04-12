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
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        {/* Search input with rotating gradient border */}
        <div className="search-gradient-border">
          <div className="search-gradient-inner relative">
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder=""
              disabled={isLoading}
              className="w-full bg-slate-800/90 text-white rounded-[calc(0.75rem-1.5px)] px-5 py-3.5 text-base focus:outline-none disabled:opacity-55 transition-all duration-200 shadow-inner shadow-black/20"
            />
            {/* Terminal-style placeholder with blinking cursor */}
            {!value && (
              <div className="absolute inset-0 pointer-events-none flex items-center px-5 gap-0">
                <span className="text-slate-500 text-base">{T.searchPlaceholder}</span>
                {!isLoading && <span className="typewriter-cursor ml-0.5">|</span>}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2.5">
          {/* Citation format toggle */}
          {!hasResult && (
            <div className="flex items-center glass-card border-white/10 rounded-xl overflow-hidden shrink-0">
              {(['APA', 'IEEE'] as CitationFormat[]).map(fmt => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setCitationFormat(fmt)}
                  disabled={isLoading}
                  title={fmt === 'APA' ? 'APA 7th edition' : 'IEEE citation style'}
                  className={[
                    'px-3.5 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50',
                    citationFormat === fmt
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-200',
                  ].join(' ')}
                >
                  {fmt}
                </button>
              ))}
            </div>
          )}

          {/* Action button */}
          {hasResult ? (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-2 glass-card border-white/10 hover:border-white/20 hover:bg-slate-700/60 text-slate-300 hover:text-white font-medium px-5 py-3.5 rounded-xl text-sm transition-all duration-200 shrink-0 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{T.newResearch}</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim() || isLoading}
              className={[
                'flex items-center gap-2 text-white font-semibold px-6 py-3.5 rounded-xl text-sm shrink-0 transition-all duration-200',
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{T.researching}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{T.research}</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Example topics — language-aware */}
      {!isLoading && !hasResult && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-600 font-medium">{T.tryLabel}</span>
          {T.exampleTopics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => setValue(topic)}
              className="text-xs bg-slate-800/60 hover:bg-slate-700/80 text-slate-500 hover:text-slate-200 border border-white/8 hover:border-white/15 px-3 py-1.5 rounded-full transition-all duration-200"
            >
              {topic.length > 50 ? topic.slice(0, 50) + '…' : topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
