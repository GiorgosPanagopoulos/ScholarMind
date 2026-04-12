import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Source } from '../types';

interface Props {
  report: string;
  sources: Source[];
  onExportPdf: () => void;
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

export function ReportPanel({ report, sources, onExportPdf }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="bg-gray-800/90 rounded-2xl border border-gray-700/80 shadow-xl shadow-black/30 overflow-hidden">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-700/80 bg-gray-800/95 backdrop-blur-sm">
        <button
          onClick={() => setIsOpen(o => !o)}
          className="flex items-center gap-2.5 text-left group"
          aria-expanded={isOpen}
        >
          <span className="text-base font-semibold text-white group-hover:text-indigo-200 transition-colors duration-200">
            Research Report
          </span>
          <ChevronIcon open={isOpen} />
        </button>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Copy */}
          <button
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy Markdown'}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border',
              copied
                ? 'bg-emerald-900/40 border-emerald-700/60 text-emerald-300'
                : 'bg-gray-700/60 border-gray-600/60 text-gray-400 hover:bg-gray-700 hover:text-gray-200 hover:border-gray-500',
            ].join(' ')}
          >
            <CopyIcon copied={copied} />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 bg-linear-to-br from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white shadow-md shadow-indigo-900/40 hover:shadow-indigo-700/50 active:scale-[0.97]"
          >
            <DownloadIcon />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Collapsible body (grid-rows trick for smooth height animation) */}
      <div className={`collapsible-wrap ${isOpen ? 'is-open' : 'is-closed'}`}>
        <div className="collapsible-inner">
          {/* Report body */}
          <div className="px-6 py-6 markdown-content border-b border-gray-700/60">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>

          {/* Sources */}
          {sources.length > 0 && (
            <div className="px-6 py-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                Sources — {sources.length}
              </h3>
              <div className="space-y-3">
                {sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 text-sm group p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/60 border border-transparent hover:border-gray-600/60 transition-all duration-200"
                  >
                    <span className="shrink-0 w-6 h-6 rounded-md bg-indigo-900/60 border border-indigo-700/40 flex items-center justify-center text-indigo-400 font-mono text-xs mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      {src.url ? (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-300 hover:text-indigo-100 font-medium wrap-break-word underline decoration-indigo-700 hover:decoration-indigo-400 transition-colors duration-150"
                        >
                          {src.title || src.url}
                        </a>
                      ) : (
                        <span className="text-gray-300 font-medium">{src.title}</span>
                      )}
                      {src.snippet && (
                        <p className="text-gray-500 text-xs mt-1 leading-relaxed line-clamp-2">
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
      </div>
    </div>
  );
}
