import type { ResearchStatus } from '../types';

interface PipelineNode {
  id: ResearchStatus;
  label: string;
}

const NODES: PipelineNode[] = [
  { id: 'planning',     label: 'Plan' },
  { id: 'searching',    label: 'Search' },
  { id: 'synthesizing', label: 'Synthesize' },
  { id: 'writing',      label: 'Write' },
];

const NODE_ICONS: Record<string, React.ReactNode> = {
  planning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  ),
  searching: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  synthesizing: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
    </svg>
  ),
  writing: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
};

// SVG checkmark used for completed nodes
function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

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
}

export function PipelineView({ status, currentStep, totalSteps }: Props) {
  const progressPct = totalSteps > 0
    ? Math.min((currentStep / totalSteps) * 100, 100)
    : 0;

  return (
    <div className="bg-gray-800/90 rounded-2xl p-5 border border-gray-700/80 shadow-xl shadow-black/30">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">
        Research Pipeline
      </h2>

      <div className="flex items-center">
        {NODES.map((node, idx) => {
          const ns = nodeStatus(node.id, status);
          const isLast = idx === NODES.length - 1;
          const nextNs = !isLast ? nodeStatus(NODES[idx + 1].id, status) : null;
          const connectorActive = nextNs === 'active' || nextNs === 'complete';

          return (
            <div key={node.id} className="flex items-center flex-1">
              {/* Node */}
              <div className="flex flex-col items-center">
                <div
                  className={[
                    'w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500',
                    ns === 'active'
                      ? 'bg-indigo-600 border-2 border-indigo-400 text-white pulse-active'
                      : ns === 'complete'
                      ? 'bg-emerald-700/80 border-2 border-emerald-500 text-emerald-200'
                      : 'bg-gray-700/80 border-2 border-gray-600 text-gray-500',
                  ].join(' ')}
                >
                  {ns === 'complete' ? <CheckIcon /> : NODE_ICONS[node.id]}
                </div>
                <span
                  className={[
                    'mt-2 text-xs font-medium tracking-wide transition-colors duration-300',
                    ns === 'active'   ? 'text-indigo-300'
                    : ns === 'complete' ? 'text-emerald-400'
                    : 'text-gray-600',
                  ].join(' ')}
                >
                  {node.label}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="h-px flex-1 mx-2 mb-5 bg-gray-700 relative overflow-hidden rounded-full">
                  {connectorActive && (
                    <div className="absolute inset-y-0 left-0 bg-indigo-500 connector-fill rounded-full" />
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
          <div className="flex justify-between text-xs text-gray-500">
            <span>Sub-question {Math.min(currentStep, totalSteps)} / {totalSteps}</span>
            <span className="text-indigo-400 font-medium">{Math.round(progressPct)}%</span>
          </div>
          <div className="w-full bg-gray-700/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-linear-to-r from-indigo-500 to-violet-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
