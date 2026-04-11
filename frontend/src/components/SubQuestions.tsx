interface Props {
  subQuestions: string[];
  currentStep: number;
}

export function SubQuestions({ subQuestions, currentStep }: Props) {
  if (subQuestions.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Research Sub-Questions
      </h2>

      <ol className="space-y-3">
        {subQuestions.map((q, idx) => {
          const stepNum = idx + 1;
          const isComplete = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <li
              key={idx}
              className="fade-in-up flex items-start gap-3"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Status indicator */}
              <span
                className={[
                  'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5',
                  isComplete
                    ? 'bg-green-700 text-green-200'
                    : isActive
                    ? 'bg-indigo-600 text-indigo-200 pulse-active'
                    : 'bg-gray-700 text-gray-400',
                ].join(' ')}
              >
                {isComplete ? '✓' : stepNum}
              </span>

              {/* Question text */}
              <span
                className={[
                  'text-sm leading-relaxed',
                  isComplete
                    ? 'text-green-400'
                    : isActive
                    ? 'text-indigo-200 font-medium'
                    : 'text-gray-300',
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
