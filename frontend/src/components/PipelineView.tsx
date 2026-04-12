import { useRef, useEffect, useState } from 'react';
import { Brain, Search, BarChart2, PenLine, Check, Sparkles } from 'lucide-react';
import type { ResearchStatus, Language } from '../types';
import { translations } from '../i18n';

const NODE_IDS: ResearchStatus[] = ['planning', 'searching', 'synthesizing', 'writing'];

const NODE_ICONS: Record<string, React.ReactNode> = {
  planning:     <Brain className="w-5 h-5" />,
  searching:    <Search className="w-5 h-5" />,
  synthesizing: <BarChart2 className="w-5 h-5" />,
  writing:      <PenLine className="w-5 h-5" />,
};

const STATUS_ORDER: ResearchStatus[] = [
  'idle', 'planning', 'searching', 'synthesizing', 'writing', 'complete',
];

function nodeStatus(
  nodeId: ResearchStatus,
  currentStatus: ResearchStatus,
): 'idle' | 'active' | 'complete' {
  if (currentStatus === 'complete') return 'complete';
  const nodeIdx = STATUS_ORDER.indexOf(nodeId);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  if (currentIdx > nodeIdx) return 'complete';
  if (currentIdx === nodeIdx) return 'active';
  return 'idle';
}

interface Props {
  status: ResearchStatus;
  currentStep: number;
  totalSteps: number;
  lang: Language;
}

export function PipelineView({ status, currentStep, totalSteps, lang }: Props) {
  const T = translations[lang];
  const progressPct = totalSteps > 0 ? Math.min((currentStep / totalSteps) * 100, 100) : 0;
  const prevStatus = useRef<ResearchStatus>(status);
  const [showSparkle, setShowSparkle] = useState(false);

  useEffect(() => {
    if (prevStatus.current !== 'complete' && status === 'complete') {
      setShowSparkle(true);
      const t = setTimeout(() => setShowSparkle(false), 1400);
      return () => clearTimeout(t);
    }
    prevStatus.current = status;
  }, [status]);

  const nodeLabels: Record<string, string> = {
    planning:     T.planLabel,
    searching:    T.searchLabel,
    synthesizing: T.synthesizeLabel,
    writing:      T.writeLabel,
  };

  /* ── Mobile node card ──────────────────────────────────────────── */
  function MobileNode({ nodeId }: { nodeId: ResearchStatus }) {
    const ns = nodeStatus(nodeId, status);
    return (
      <div className="flex flex-col items-center gap-2">
        <div
          className={[
            'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 relative',
            ns === 'active'
              ? 'bg-linear-to-br from-indigo-500 to-violet-600 border-2 border-indigo-400/60 text-white pulse-active shadow-lg shadow-indigo-900/60'
              : ns === 'complete'
              ? 'bg-linear-to-br from-emerald-600 to-emerald-700 border-2 border-emerald-500/60 text-white shadow-md shadow-emerald-900/40'
              : 'bg-slate-700/80 border-2 border-white/8 text-slate-500 shadow-md shadow-black/40',
          ].join(' ')}
        >
          {ns === 'complete' ? <Check className="w-5 h-5" /> : NODE_ICONS[nodeId]}
        </div>
        <span
          className={[
            'text-xs font-medium tracking-wide transition-colors duration-300 text-center',
            ns === 'active'    ? 'text-indigo-300'
            : ns === 'complete' ? 'text-emerald-400'
            : 'text-slate-600',
          ].join(' ')}
        >
          {nodeLabels[nodeId]}
        </span>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 shadow-xl shadow-black/30 relative overflow-hidden">
      {/* Subtle gradient shimmer on the card bg */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-600/5 to-violet-600/5 pointer-events-none rounded-2xl" />

      <div className="relative">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-5">
          {T.pipelineTitle}
        </h2>

        {/* ── Mobile: 2×2 grid ── */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {NODE_IDS.map(nodeId => (
            <MobileNode key={nodeId} nodeId={nodeId} />
          ))}
        </div>

        {/* ── Desktop: horizontal flex ── */}
        <div className="hidden md:flex items-center">
          {NODE_IDS.map((nodeId, idx) => {
            const ns = nodeStatus(nodeId, status);
            const isLast = idx === NODE_IDS.length - 1;
            const nextNs = !isLast ? nodeStatus(NODE_IDS[idx + 1], status) : null;
            const connectorActive = nextNs === 'active' || nextNs === 'complete';

            return (
              <div key={nodeId} className="flex items-center flex-1">
                {/* Node */}
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 relative',
                      ns === 'active'
                        ? 'bg-linear-to-br from-indigo-500 to-violet-600 border-2 border-indigo-400/60 text-white pulse-active shadow-lg shadow-indigo-900/60'
                        : ns === 'complete'
                        ? 'bg-linear-to-br from-emerald-600 to-emerald-700 border-2 border-emerald-500/60 text-white shadow-md shadow-emerald-900/40'
                        : 'bg-slate-700/80 border-2 border-white/8 text-slate-500 shadow-md shadow-black/40',
                    ].join(' ')}
                  >
                    {ns === 'complete' ? <Check className="w-5 h-5" /> : NODE_ICONS[nodeId]}
                    {/* Sparkle burst on last node when complete */}
                    {nodeId === 'writing' && showSparkle && (
                      <span className="absolute -top-1 -right-1 text-yellow-300 sparkle-burst pointer-events-none">
                        <Sparkles className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <span
                    className={[
                      'mt-2.5 text-xs font-medium tracking-wide transition-colors duration-300',
                      ns === 'active'    ? 'text-indigo-300'
                      : ns === 'complete' ? 'text-emerald-400'
                      : 'text-slate-600',
                    ].join(' ')}
                  >
                    {nodeLabels[nodeId]}
                  </span>
                </div>

                {/* Connector */}
                {!isLast && (
                  <div className="h-0.5 flex-1 mx-3 mb-6 bg-slate-700/80 relative overflow-hidden rounded-full">
                    {connectorActive && (
                      <div className="absolute inset-y-0 left-0 bg-linear-to-r from-indigo-500 to-violet-500 connector-fill rounded-full" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        {totalSteps > 0 && status !== 'idle' && status !== 'planning' && (
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>{T.subQuestionProgress(Math.min(currentStep, totalSteps), totalSteps)}</span>
              <span className="text-indigo-400 font-medium">{Math.round(progressPct)}%</span>
            </div>
            <div className="w-full bg-slate-700/80 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-linear-to-r from-indigo-500 to-violet-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
