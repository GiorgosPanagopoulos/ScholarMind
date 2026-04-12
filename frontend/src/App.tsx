import { useState, useEffect } from 'react';
import './index.css';
import type { Language } from './types';
import { translations } from './i18n';
import { useResearch } from './hooks/useResearch';
import { SearchBar } from './components/SearchBar';
import { PipelineView } from './components/PipelineView';
import { ActivityFeed } from './components/ActivityFeed';
import { SubQuestions } from './components/SubQuestions';
import { ReportPanel } from './components/ReportPanel';
import { FollowUp } from './components/FollowUp';
import { AlertTriangle } from 'lucide-react';

/* ── Deterministic star positions (no randomness per render) ───────── */
const STARS = Array.from({ length: 55 }, (_, i) => ({
  x:        ((i * 7919 + 3571) % 97)  + 1.5,
  y:        ((i * 6271 + 4733) % 91)  + 4,
  size:     i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.8 : 1,
  delay:    (i * 0.31) % 4.5,
  duration: 2 + (i % 7) * 0.35,
  opacity:  0.12 + (i % 6) * 0.07,
}));

/* ── Typewriter hook ───────────────────────────────────────────────── */
function useTypewriter(fullText: string, speed = 42, startDelay = 300) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(fullText.slice(0, i));
        if (i >= fullText.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(start);
  }, [fullText, speed, startDelay]);

  return { displayed, done };
}

export default function App() {
  const { state, qaHistory, startResearch, askFollowup, exportPdf, reset } = useResearch();
  const [lang, setLang] = useState<Language>('EN');
  const T = translations[lang];

  const isLoading = ['planning', 'searching', 'synthesizing', 'writing'].includes(state.status);
  const hasResult = state.status === 'complete';
  const showPipeline = state.status !== 'idle';

  const { displayed: heroTitle, done: typingDone } = useTypewriter(
    state.status === 'idle' ? T.heroTitle : '',
    42,
    400,
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-x-hidden">

      {/* ── Background orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="orb-1 absolute -top-48 -left-48 w-162.5 h-162.5 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="orb-2 absolute -bottom-56 -right-48 w-137.5 h-137.5 rounded-full bg-violet-600/12 blur-3xl" />
        <div className="orb-3 absolute top-1/2 right-1/4 w-95 h-95 rounded-full bg-cyan-600/8 blur-3xl" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-white/8 bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/30">
        <div className="max-w-5xl mx-auto px-3 md:px-6 py-3.5 flex items-center justify-between gap-3">
          <h1 className="text-lg md:text-xl font-bold tracking-tight shrink-0">
            Scholar<span className="text-indigo-400">Mind</span>
          </h1>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Language toggle */}
            <div className="flex items-center bg-slate-800/80 border border-white/10 rounded-full overflow-hidden">
              {(['EN', 'GR'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={[
                    'px-2.5 md:px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-300',
                    lang === l
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-500 hover:text-slate-200',
                  ].join(' ')}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Model badge */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-slate-800/60 border border-white/8 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono">claude-sonnet-4-5</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="relative z-10 max-w-5xl mx-auto px-3 md:px-6 py-6 md:py-10 space-y-6 md:space-y-8">

        <SearchBar
          onSearch={startResearch}
          onReset={reset}
          isLoading={isLoading}
          hasResult={hasResult}
          lang={lang}
        />

        {/* Error */}
        {state.status === 'error' && (
          <div className="glass-card px-4 md:px-5 py-4 text-red-300 text-sm flex items-start gap-3 border-red-500/20">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>{state.activities[state.activities.length - 1] ?? T.somethingWentWrong}</span>
          </div>
        )}

        {/* Pipeline + Activity + Sub-questions */}
        {showPipeline && (
          <div className="space-y-5 md:space-y-6">
            <PipelineView
              status={state.status}
              currentStep={state.currentStep}
              totalSteps={state.totalSteps}
              lang={lang}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <ActivityFeed activities={state.activities} lang={lang} />
              {state.subQuestions.length > 0 && (
                <SubQuestions
                  subQuestions={state.subQuestions}
                  currentStep={state.currentStep}
                  lang={lang}
                />
              )}
            </div>
          </div>
        )}

        {!showPipeline && state.subQuestions.length > 0 && (
          <SubQuestions subQuestions={state.subQuestions} currentStep={state.currentStep} lang={lang} />
        )}

        {hasResult && (
          <ReportPanel report={state.report} sources={state.sources} onExportPdf={exportPdf} lang={lang} />
        )}

        {hasResult && (
          <FollowUp qaHistory={qaHistory} report={state.report} onAsk={askFollowup} lang={lang} />
        )}

        {/* ── Idle hero ── */}
        {state.status === 'idle' && (
          <div className="relative text-center py-16 md:py-24 space-y-6 fade-in-up overflow-hidden">

            {/* Star field */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {STARS.map(s => (
                <div
                  key={s.x + '-' + s.y}
                  className="star absolute rounded-full bg-white"
                  style={{
                    left: `${s.x}%`,
                    top: `${s.y}%`,
                    width: `${s.size}px`,
                    height: `${s.size}px`,
                    opacity: s.opacity,
                    '--dur': `${s.duration}s`,
                    '--delay': `${s.delay}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative space-y-4">
              <div className="text-5xl md:text-6xl">🎓</div>
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-100 min-h-9 md:min-h-11">
                  {heroTitle || '\u00A0'}
                  {!typingDone && <span className="typewriter-cursor">|</span>}
                </h2>
                <p className="text-slate-400 max-w-md mx-auto leading-relaxed text-sm md:text-base px-4 md:px-0">
                  {T.heroDesc}
                </p>
              </div>
            </div>

            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              {[
                { icon: '🧠', title: T.smartPlanning,  desc: T.smartPlanningDesc,  from: 'from-indigo-500/10',  border: 'border-indigo-500/25  hover:border-indigo-400/50' },
                { icon: '🔍', title: T.liveWebSearch,  desc: T.liveWebSearchDesc,  from: 'from-emerald-500/10', border: 'border-emerald-500/25 hover:border-emerald-400/50' },
                { icon: '📄', title: T.academicReport, desc: T.academicReportDesc, from: 'from-violet-500/10',  border: 'border-violet-500/25  hover:border-violet-400/50' },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`bg-linear-to-br ${card.from} to-transparent backdrop-blur-xl rounded-2xl p-4 border ${card.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30 shadow-md shadow-black/20`}
                >
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">{card.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/6 mt-12 md:mt-16">
        <div className="max-w-5xl mx-auto px-3 md:px-6 py-4 flex justify-end">
          <span className="text-xs text-slate-700 font-mono">Built by Georgios Panagopoulos</span>
        </div>
      </footer>
    </div>
  );
}
