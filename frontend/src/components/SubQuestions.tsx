interface Props {
  subQuestions: string[];
  currentStep: number;
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

export function SubQuestions({ subQuestions, currentStep }: Props) {
  if (subQuestions.length === 0) return null;

  return (
    <div className="bg-gray-800/90 rounded-2xl border border-gray-700/80 p-5 shadow-xl shadow-black/20">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
        Research Sub-Questions
      </h2>

      <ol className="space-y-2.5">
        {subQuestions.map((q, idx) => {
          const stepNum = idx + 1;
          const isComplete = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <li
              key={idx}
              className="fade-in-up flex items-start gap-3"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Status badge */}
              <span
                className={[
                  'shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition-all duration-300',
                  isComplete
                    ? 'bg-emerald-800/80 border border-emerald-600/40 text-emerald-300'
                    : isActive
                    ? 'bg-indigo-600 border border-indigo-400/60 text-white pulse-active'
                    : 'bg-gray-700/80 border border-gray-600/60 text-gray-500',
                ].join(' ')}
              >
                {isComplete ? <CheckIcon /> : stepNum}
              </span>

              {/* Question text */}
              <span
                className={[
                  'text-sm leading-relaxed transition-colors duration-300',
                  isComplete ? 'text-emerald-400/80'
                  : isActive  ? 'text-indigo-200 font-medium'
                  : 'text-gray-400',
                ].join(' ')}
              >
                {q}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
