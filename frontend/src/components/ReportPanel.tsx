import ReactMarkdown from 'react-markdown';
import type { Source } from '../types';

interface Props {
  report: string;
  sources: Source[];
  onExportPdf: () => void;
}

export function ReportPanel({ report, sources, onExportPdf }: Props) {
  if (!report) return null;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📄</span> Research Report
        </h2>
        <button
          onClick={onExportPdf}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <span>⬇</span> Export PDF
        </button>
      </div>

      {/* Report body */}
      <div className="p-6 markdown-content">
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>

      {/* Sources */}
      {sources.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Sources ({sources.length})
          </h3>
          <div className="space-y-2">
            {sources.map((src, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <span className="flex-shrink-0 text-indigo-400 font-mono text-xs mt-0.5">
                  [{idx + 1}]
                </span>
                <div className="min-w-0">
                  {src.url ? (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-300 hover:text-indigo-100 font-medium underline break-words"
                    >
                      {src.title || src.url}
                    </a>
                  ) : (
                    <span className="text-gray-300 font-medium">{src.title}</span>
                  )}
                  {src.snippet && (
                    <p className="text-gray-500 text-xs mt-0.5 leading-relaxed line-clamp-2">
                      {src.snippet}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
