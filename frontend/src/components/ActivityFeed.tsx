import { useEffect, useRef } from 'react';

interface Props {
  activities: string[];
}

export function ActivityFeed({ activities }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities]);

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Activity Log
        </h2>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        style={{ maxHeight: '260px', minHeight: '120px' }}
      >
        {activities.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No activity yet…</p>
        ) : (
          activities.map((entry, idx) => {
            const isLatest = idx === activities.length - 1;
            return (
              <div
                key={idx}
                className={[
                  'text-xs font-mono leading-relaxed',
                  isLatest ? 'text-indigo-300' : 'text-gray-400',
                ].join(' ')}
              >
                <span className="text-gray-600 mr-2">›</span>
                {entry}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
