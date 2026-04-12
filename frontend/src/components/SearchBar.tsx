import { useState } from 'react';
import type { CitationFormat } from '../types';

interface Props {
  onSearch: (topic: string, citationFormat: CitationFormat) => void;
  onReset: () => void;
  isLoading: boolean;
  hasResult: boolean;
}

const EXAMPLE_TOPICS = [
  'The impact of large language models on scientific research',
  'Quantum computing applications in cryptography',
  'CRISPR gene editing: current capabilities and ethical implications',
];

export function SearchBar({ onSearch, onReset, isLoading, hasResult }: Props) {
  const [value, setValue] = useState('');
  const [citationFormat, setCitationFormat] = useState<CitationFormat>('APA');

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    const topic = value.trim();
    if (topic && !isLoading) onSearch(topic, citationFormat);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2.5 items-stretch">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Enter a research topic…"
            disabled={isLoading}
            className="w-full bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-5 py-3.5 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25 disabled:opacity-55 transition-all duration-200 shadow-inner shadow-black/20"
          />
          {/* Animated focus indicator line */}
          <div className="absolute bottom-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Citation format toggle — slides in when not loading/showing result */}
        <div
          className={[
            'flex items-center bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shrink-0 transition-all duration-300',
            !hasResult ? 'opacity-100 max-w-30 translate-x-0' : 'opacity-0 max-w-0 pointer-events-none',
          ].join(' ')}
        >
          {(['APA', 'IEEE'] as CitationFormat[]).map(fmt => (
            <button
              key={fmt}
              type="button"
              onClick={() => setCitationFormat(fmt)}
              disabled={isLoading}
              title={fmt === 'APA' ? 'APA 7th edition' : 'IEEE citation style'}
              className={[
                'px-4 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 flex-1',
                citationFormat === fmt
                  ? 'bg-indigo-600 text-white shadow-inner'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-gray-700/60',
              ].join(' ')}
            >
              {fmt}
            </button>
          ))}
        </div>

        {/* Action button */}
        {hasResult ? (
          <button
            type="button"
            onClick={onReset}
            className="bg-gray-700 hover:bg-gray-600 active:bg-gray-600 text-gray-200 font-medium px-6 py-3.5 rounded-xl text-sm transition-all duration-200 shrink-0 border border-gray-600 hover:border-gray-500 shadow-md"
          >
            New Research
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className={[
              'relative overflow-hidden text-white font-semibold px-8 py-3.5 rounded-xl text-sm shrink-0 transition-all duration-200',
              'bg-linear-to-br from-indigo-500 to-indigo-700',
              'hover:from-indigo-400 hover:to-indigo-600',
              'active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-500 disabled:hover:to-indigo-700',
              !isLoading && value.trim() ? 'btn-glow' : '',
              'shadow-lg shadow-indigo-900/40',
            ].join(' ')}
          >
            {/* Shimmer overlay */}
            {!isLoading && value.trim() && (
              <span
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 pointer-events-none"
                aria-hidden
              />
            )}
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Researching…
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z" />
                </svg>
                Research
              </span>
            )}
          </button>
        )}
      </form>

      {/* Example topics */}
      {!isLoading && !hasResult && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-600 font-medium">Try:</span>
          {EXAMPLE_TOPICS.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => setValue(topic)}
              className="text-xs bg-gray-800/70 hover:bg-gray-700 text-gray-500 hover:text-gray-200 border border-gray-700/80 hover:border-gray-600 px-3 py-1.5 rounded-full transition-all duration-200"
            >
              {topic.length > 50 ? topic.slice(0, 50) + '…' : topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
