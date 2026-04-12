import { Check } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../i18n';

interface Props {
  subQuestions: string[];
  currentStep: number;
  lang: Language;
}

export function SubQuestions({ subQuestions, currentStep, lang }: Props) {
  const T = translations[lang];
  if (subQuestions.length === 0) return null;

  return (
    <div className="glass-card p-5 shadow-xl shadow-black/20">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
        {T.subQuestionsTitle}
      </h2>

      <ol className="space-y-4">
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
              <span
                className={[
                  'shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 transition-all duration-300',
                  isComplete
                    ? 'bg-emerald-800/80 border border-emerald-600/40 text-emerald-300'
                    : isActive
                    ? 'bg-indigo-600 border border-indigo-400/60 text-white pulse-active'
                    : 'bg-slate-700/80 border border-white/10 text-slate-500',
                ].join(' ')}
              >
                {isComplete ? <Check className="w-3.5 h-3.5" /> : stepNum}
              </span>

              <span
                className={[
                  'text-sm leading-loose transition-colors duration-300',
                  isComplete ? 'text-emerald-400/80'
                  : isActive  ? 'text-indigo-200 font-medium'
                  : 'text-slate-400',
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
