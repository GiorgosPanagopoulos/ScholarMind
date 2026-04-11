import type { ResearchStatus } from '../types';

interface PipelineNode {
  id: ResearchStatus;
  label: string;
  icon: string;
}

const NODES: PipelineNode[] = [
  { id: 'planning', label: 'Plan', icon: '🧠' },
  { id: 'searching', label: 'Search', icon: '🔍' },
  { id: 'synthesizing', label: 'Synthesize', icon: '⚗️' },
  { id: 'writing', label: 'Write', icon: '📝' },
];

const STATUS_ORDER: ResearchStatus[] = [
  'idle',
  'planning',
  'searching',
  'synthesizing',
  'writing',
  'complete',
];

function nodeStatus(
  nodeId: ResearchStatus,
  currentStatus: ResearchStatus
): 'idle' | 'active' | 'complete' {
  const nodeIdx = STATUS_ORDER.indexOf(nodeId);
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  if (currentStatus === 'complete') return 'complete';
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
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Research Pipeline
      </h2>

      <div className="flex items-center gap-2">
        {NODES.map((node, idx) => {
          const ns = nodeStatus(node.id, status);
          const isLast = idx === NODES.length - 1;

          return (
            <div key={node.id} className="flex items-center flex-1">
              {/* Node */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={[
                    'w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300',
                    ns === 'active'
                      ? 'bg-indigo-600 border-2 border-indigo-400 pulse-active'
                      : ns === 'complete'
                      ? 'bg-green-700 border-2 border-green-500'
                      : 'bg-gray-700 border-2 border-gray-600',
                  ].join(' ')}
                >
                  {ns === 'complete' ? '✓' : node.icon}
                </div>
                <span
                  className={[
                    'mt-2 text-xs font-medium',
                    ns === 'active'
                      ? 'text-indigo-300'
                      : ns === 'complete'
                      ? 'text-green-400'
                      : 'text-gray-500',
                  ].join(' ')}
                >
                  {node.label}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={[
                    'h-0.5 flex-1 mx-1 transition-all duration-500',
                    nodeStatus(NODES[idx + 1].id, status) !== 'idle'
                      ? 'bg-indigo-500'
                      : 'bg-gray-600',
                  ].join(' ')}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {totalSteps > 0 && status !== 'idle' && status !== 'planning' && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Sub-question {Math.min(currentStep, totalSteps)} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((currentStep / totalSteps) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
