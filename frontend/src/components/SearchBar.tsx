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

  const handleExample = (topic: string) => {
    setValue(topic);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Enter a research topic…"
          disabled={isLoading}
          className="flex-1 bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-xl px-5 py-3.5 text-base focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60 transition-all"
        />

        {/* Citation format toggle */}
        {!hasResult && (
          <div className="flex items-center bg-gray-800 border border-gray-600 rounded-xl overflow-hidden flex-shrink-0">
            {(['APA', 'IEEE'] as CitationFormat[]).map(fmt => (
              <button
                key={fmt}
                type="button"
                onClick={() => setCitationFormat(fmt)}
                disabled={isLoading}
                className={`px-4 py-3.5 text-sm font-medium transition-colors disabled:opacity-60 ${
                  citationFormat === fmt
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        )}

        {hasResult ? (
          <button
            type="button"
            onClick={onReset}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium px-6 py-3.5 rounded-xl text-sm transition-colors flex-shrink-0"
          >
            New Research
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-colors flex-shrink-0"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Researching…
              </span>
            ) : (
              'Research'
            )}
          </button>
        )}
      </form>

      {/* Example topics */}
      {!isLoading && !hasResult && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 self-center">Try:</span>
          {EXAMPLE_TOPICS.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => handleExample(topic)}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 border border-gray-700 px-3 py-1.5 rounded-full transition-colors"
            >
              {topic.length > 50 ? topic.slice(0, 50) + '…' : topic}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
