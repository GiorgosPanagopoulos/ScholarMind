import { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../i18n';

interface Props {
  activities: string[];
  lang: Language;
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

function parseEntry(raw: string): { ts: string; msg: string } {
  const m = raw.match(/^(\[.*?\])\s+(.*)$/s);
  if (m) return { ts: m[1], msg: m[2] };
  return { ts: '', msg: raw };
}

const BORDER: Record<EntryKind, string> = {
  planning:     'border-blue-500/60',
  searching:    'border-emerald-500/60',
  synthesizing: 'border-amber-500/60',
  writing:      'border-violet-500/60',
  complete:     'border-emerald-400/80',
  error:        'border-red-500/60',
  default:      'border-slate-600/40',
};

const DOT: Record<EntryKind, string> = {
  planning:     'bg-blue-400',
  searching:    'bg-emerald-400',
  synthesizing: 'bg-amber-400',
  writing:      'bg-violet-400',
  complete:     'bg-emerald-300',
  error:        'bg-red-400',
  default:      'bg-slate-500',
};

export function ActivityFeed({ activities, lang }: Props) {
  const T = translations[lang];
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities]);

  return (
    <div className="glass-card flex flex-col shadow-xl shadow-black/20 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/8 flex items-center gap-2.5">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0" />
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex-1">
          {T.activityLog}
        </h2>
      </div>

      {/* Entries */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
        style={{ maxHeight: '320px', minHeight: '140px' }}
      >
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-slate-600">
            <Activity className="w-6 h-6 opacity-40" />
            <p className="text-xs italic">{T.awaitingActivity}</p>
          </div>
        ) : (
          activities.map((raw, idx) => {
            const isLatest = idx === activities.length - 1;
            const kind = classifyEntry(raw);
            const { ts, msg } = parseEntry(raw);
            return (
              <div
                key={idx}
                className={[
                  'activity-entry flex items-start gap-3 pl-3 pr-2 py-2 border-l-2 rounded-r-md',
                  BORDER[kind],
                  isLatest ? 'bg-slate-700/20' : '',
                ].join(' ')}
                style={{ animationDelay: `${Math.min(idx * 30, 120)}ms` }}
              >
                <span
                  className={[
                    'mt-1 w-1.5 h-1.5 rounded-full shrink-0',
                    DOT[kind],
                    isLatest ? 'animate-pulse' : 'opacity-50',
                  ].join(' ')}
                />
                <span className="min-w-0 flex-1">
                  {ts && (
                    <span className="font-mono text-[10px] text-slate-600 mr-2 select-none">
                      {ts}
                    </span>
                  )}
                  <span
                    className={[
                      'font-mono text-xs leading-loose break-all',
                      isLatest ? 'text-slate-200' : 'text-slate-500',
                    ].join(' ')}
                  >
                    {msg}
                  </span>
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
