import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, BookOpen, Download, Copy, Check, ChevronDown } from 'lucide-react';
import type { Source, Language } from '../types';
import { translations } from '../i18n';

interface Props {
  report: string;
  sources: Source[];
  onExportPdf: () => void;
  lang: Language;
}

export function ReportPanel({ report, sources, onExportPdf, lang }: Props) {
  const T = translations[lang];
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  // Split the report at the References heading for hanging-indent treatment.
  const refMatch = report.search(/^## References/im);
  const mainBody = refMatch >= 0 ? report.slice(0, refMatch).trimEnd() : report;
  const refsBody = refMatch >= 0 ? report.slice(refMatch) : '';

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
    <div className="glass-card shadow-xl shadow-black/30 overflow-hidden">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/8 bg-slate-800/95 backdrop-blur-sm rounded-t-2xl">
        <button
          onClick={() => setIsOpen(o => !o)}
          className="flex items-center gap-2.5 text-left group"
          aria-expanded={isOpen}
        >
          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-base font-semibold text-white group-hover:text-indigo-200 transition-colors duration-200">
            {T.reportTitle}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <div className="flex items-center gap-2">
          {/* Copy */}
          <button
            onClick={handleCopy}
            title={copied ? T.copied : T.copy}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border',
              copied
                ? 'bg-emerald-900/40 border-emerald-700/60 text-emerald-300'
                : 'bg-slate-700/60 border-white/10 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:border-white/20',
            ].join(' ')}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? T.copied : T.copy}</span>
          </button>

          {/* Export PDF */}
          <button
            onClick={onExportPdf}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 bg-linear-to-br from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white shadow-md shadow-indigo-900/40 hover:shadow-indigo-700/50 active:scale-[0.97]"
          >
            <Download className="w-4 h-4" />
            <span>{T.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* Collapsible body */}
      <div className={`collapsible-wrap ${isOpen ? 'is-open' : 'is-closed'}`}>
        <div className="collapsible-inner">
          {/* Main report body */}
          <div className="px-8 py-7 markdown-content">
            <ReactMarkdown>{mainBody}</ReactMarkdown>
          </div>

          {/* References section */}
          {refsBody && (
            <div className="px-8 py-6 border-t border-white/6 bg-slate-900/25 markdown-content references-section">
              <ReactMarkdown>{refsBody}</ReactMarkdown>
            </div>
          )}

          {/* Source index */}
          {sources.length > 0 && (
            <div className="px-8 py-6 border-t border-white/6">
              <div className="flex items-center gap-3 mb-5">
                <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {T.sourceIndex}
                </h3>
                <span className="text-xs text-slate-600 bg-slate-700/50 px-2 py-0.5 rounded-full">
                  {sources.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 px-4 py-3.5 rounded-xl bg-slate-700/25 hover:bg-slate-700/50 border border-white/6 hover:border-white/12 transition-all duration-200 group"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-indigo-900/50 border border-indigo-700/40 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold mt-0.5 group-hover:border-indigo-600/60 transition-colors duration-200">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      {src.url ? (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-indigo-300 hover:text-indigo-100 font-medium wrap-break-word underline decoration-indigo-700/60 hover:decoration-indigo-400 underline-offset-2 transition-colors duration-150 leading-snug"
                        >
                          {src.title || src.url}
                        </a>
                      ) : (
                        <span className="text-sm text-slate-300 font-medium leading-snug">
                          {src.title}
                        </span>
                      )}
                      {src.snippet && (
                        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed line-clamp-2">
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
