import { useEffect, useRef } from 'react';

interface Props {
  activities: string[];
}

type EntryKind = 'planning' | 'searching' | 'synthesizing' | 'writing' | 'complete' | 'error' | 'default';

function classifyEntry(entry: string): EntryKind {
  const t = entry.toLowerCase();
  if (t.includes('error')) return 'error';
  if (t.includes('complete') || t.includes('report ready')) return 'complete';
  if (t.includes('generating') || t.includes('writing')) return 'writing';
  if (t.includes('synthes')) return 'synthesizing';
  if (t.includes('search')) return 'searching';
  if (
    t.includes('planning') ||
    t.includes('breaking') ||
    t.includes('sub-question') ||
    t.includes('starting')
  ) return 'planning';
  return 'default';
}

const BORDER: Record<EntryKind, string> = {
  planning:     'border-blue-500/70',
  searching:    'border-emerald-500/70',
  synthesizing: 'border-amber-500/70',
  writing:      'border-violet-500/70',
  complete:     'border-emerald-400',
  error:        'border-red-500/70',
  default:      'border-gray-600/50',
};

const DOT: Record<EntryKind, string> = {
  planning:     'bg-blue-400',
  searching:    'bg-emerald-400',
  synthesizing: 'bg-amber-400',
  writing:      'bg-violet-400',
  complete:     'bg-emerald-300',
  error:        'bg-red-400',
  default:      'bg-gray-500',
};

export function ActivityFeed({ activities }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities]);

  return (
    <div className="bg-gray-800/90 rounded-2xl border border-gray-700/80 flex flex-col shadow-xl shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700/80 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Activity Log
        </h2>
      </div>

      {/* Entries */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-1.5"
        style={{ maxHeight: '260px', minHeight: '120px' }}
      >
        {activities.length === 0 ? (
          <p className="text-gray-600 text-xs italic py-2">Awaiting activity…</p>
        ) : (
          activities.map((entry, idx) => {
            const isLatest = idx === activities.length - 1;
            const kind = classifyEntry(entry);
            return (
              <div
                key={idx}
                className={[
                  'activity-entry flex items-start gap-2.5 pl-3 border-l-2 py-0.5',
                  BORDER[kind],
                ].join(' ')}
                style={{ animationDelay: `${Math.min(idx * 30, 120)}ms` }}
              >
                {/* Dot */}
                <span
                  className={[
                    'mt-1.5 w-1.5 h-1.5 rounded-full shrink-0',
                    DOT[kind],
                    isLatest ? 'animate-pulse' : 'opacity-60',
                  ].join(' ')}
                />
                {/* Text */}
                <span
                  className={[
                    'text-xs font-mono leading-relaxed break-all',
                    isLatest ? 'text-gray-200' : 'text-gray-500',
                  ].join(' ')}
                >
                  {entry}
                </span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
