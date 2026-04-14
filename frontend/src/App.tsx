import { useState, useEffect, Fragment } from 'react';
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
import { AlertTriangle, Brain, Globe, FileText, Search, Layers, ChevronRight } from 'lucide-react';

/* ── Deterministic star positions ──────────────────────────────────── */
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

/* ── Rotating tagline hook ─────────────────────────────────────────── */
function useTaglineRotation(taglines: readonly string[], interval = 3000) {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % taglines.length);
        setVisible(true);
      }, 350);
    }, interval);
    return () => clearInterval(timer);
  }, [taglines, interval]);
  return { tagline: taglines[idx], visible };
}

/* ── CountUp component ─────────────────────────────────────────────── */
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = target / (1400 / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}{suffix}</>;
}

export default function App() {
  const { state, qaHistory, startResearch, askFollowup, exportPdf, reset } = useResearch();
  const [lang, setLang] = useState<Language>('EN');
  const T = translations[lang];

  const isLoading = ['planning', 'searching', 'synthesizing', 'writing'].includes(state.status);
  const hasResult = state.status === 'complete';
  const showPipeline = state.status !== 'idle';
  const isIdle = state.status === 'idle';

  const { displayed: heroTitle, done: typingDone } = useTypewriter(
    isIdle ? T.heroTitle : '', 42, 400,
  );
  const { tagline, visible: taglineVisible } = useTaglineRotation(T.taglines);

  const featureCards = [
    {
      Icon: Brain,      iconColor: 'text-indigo-400',
      title: T.smartPlanning,  desc: T.smartPlanningDesc,
      gradient: 'from-indigo-600/20 to-blue-600/20',
      border: 'border-indigo-500/30', topBorder: 'border-t-indigo-500',
      hoverBorder: 'hover:border-indigo-400/60', hoverGlow: 'hover:shadow-indigo-500/25',
    },
    {
      Icon: Globe,      iconColor: 'text-emerald-400',
      title: T.liveWebSearch,  desc: T.liveWebSearchDesc,
      gradient: 'from-emerald-600/20 to-teal-600/20',
      border: 'border-emerald-500/30', topBorder: 'border-t-emerald-500',
      hoverBorder: 'hover:border-emerald-400/60', hoverGlow: 'hover:shadow-emerald-500/25',
    },
    {
      Icon: FileText,   iconColor: 'text-purple-400',
      title: T.academicReport, desc: T.academicReportDesc,
      gradient: 'from-purple-600/20 to-pink-600/20',
      border: 'border-purple-500/30', topBorder: 'border-t-purple-500',
      hoverBorder: 'hover:border-purple-400/60', hoverGlow: 'hover:shadow-purple-500/25',
    },
  ] as const;

  const howItWorksSteps = [
    { Icon: Search,   label: T.howItWorks[0] },
    { Icon: Globe,    label: T.howItWorks[1] },
    { Icon: Layers,   label: T.howItWorks[2] },
    { Icon: FileText, label: T.howItWorks[3] },
  ] as const;

  /* ── Language / model controls (reused in both bars) ── */
  const Controls = () => (
    <>
      <div className="relative flex items-center bg-slate-800/60 backdrop-blur-sm rounded-full p-1 border border-white/10">
        {/* Sliding indicator */}
        <div
          className="absolute top-1 bottom-1 rounded-full bg-linear-to-r from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 transition-all duration-300 ease-in-out pointer-events-none"
          style={{
            width: 'calc(50% - 4px)',
            left: lang === 'EN' ? '4px' : 'calc(50%)',
          }}
        />
        {(['EN', 'GR'] as Language[]).map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={[
              'relative z-10 flex items-center gap-1.5 px-5 py-2 text-sm font-bold uppercase tracking-wider rounded-full transition-colors duration-300',
              lang === l ? 'text-white' : 'text-gray-400 hover:text-gray-200',
            ].join(' ')}
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            {l}
          </button>
        ))}
      </div>
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-800/60 border border-white/8 px-2.5 py-1 rounded-full">
        <span className="relative flex items-center justify-center w-2 h-2">
          <span className="absolute w-2 h-2 rounded-full bg-emerald-400 status-dot-ping" />
          <span className="relative w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </span>
        <span className="font-mono">claude-sonnet-4-5</span>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-x-hidden flex flex-col">

      {/* ── Background orbs ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="orb-1 absolute -top-48 -left-48 w-162.5 h-162.5 rounded-full bg-indigo-600/15 blur-3xl" />
        <div className="orb-2 absolute -bottom-56 -right-48 w-137.5 h-137.5 rounded-full bg-violet-600/12 blur-3xl" />
        <div className="orb-3 absolute top-1/2 right-1/4 w-95 h-95 rounded-full bg-cyan-600/8 blur-3xl" />
      </div>
      <div className="fixed inset-0 bg-grid-overlay pointer-events-none z-0" aria-hidden="true" />

      {/* ══════════════════════════════════════════════════════════════
          IDLE: slim top bar — controls only, no logo
      ══════════════════════════════════════════════════════════════ */}
      {isIdle && (
        <div className="relative z-10 h-10 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/6">
          <div className="w-full px-4 h-full flex items-center justify-between gap-3">
            <Controls />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ACTIVE: compact branded header — logo left, controls right
      ══════════════════════════════════════════════════════════════ */}
      {!isIdle && (
        <header className="fixed top-0 left-0 right-0 h-12 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
          <div className="w-full px-4 h-full grid grid-cols-3 items-center">
            {/* Left: empty spacer */}
            <div />
            {/* Center: title */}
            <div className="flex items-center justify-center gap-2">
              <Brain className="w-9 h-9 text-indigo-400 logo-pulse" />
              <span className="text-3xl font-bold tracking-tight">
                Scholar<span className="text-indigo-400"> Mind</span>
              </span>
            </div>
            {/* Right: controls */}
            <div className="flex items-center justify-end gap-2 md:gap-3">
              <Controls />
            </div>
          </div>
        </header>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MAIN
      ══════════════════════════════════════════════════════════════ */}
      <main className={`relative z-10 flex-1 flex flex-col ${isIdle ? '' : 'pt-12'}`}>

        {isIdle ? (

          /* ── Idle hero: fills viewport on desktop, scrolls on mobile ── */
          <div className="relative w-full flex-1 overflow-hidden">

            {/* Star field */}
            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
              {STARS.map(s => (
                <div
                  key={s.x + '-' + s.y}
                  className="star absolute rounded-full bg-white"
                  style={{
                    left: `${s.x}%`, top: `${s.y}%`,
                    width: `${s.size}px`, height: `${s.size}px`,
                    opacity: s.opacity,
                    '--dur': `${s.duration}s`,
                    '--delay': `${s.delay}s`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Content column */}
            <div className="relative flex flex-col items-center gap-6 px-4 pt-8 pb-12 w-full fade-in-up">

              {/* 1. Large centered logo */}
              <div className="flex items-center justify-center gap-3 w-full text-center mb-4">
                <Brain className="w-12 h-12 text-indigo-400 logo-pulse shrink-0" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Scholar<span className="text-indigo-400"> Mind</span>
                </h1>
              </div>

              {/* 2. Hero tagline + rotating subtitle */}
              <div className="text-center space-y-2 max-w-2xl">
                <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight">
                  <span className={heroTitle ? 'bg-linear-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'text-slate-100'}>
                    {heroTitle || '\u00A0'}
                  </span>
                  {!typingDone && <span className="typewriter-cursor">|</span>}
                </h2>
                <p
                  className="text-indigo-300/80 text-sm md:text-base italic tracking-wide transition-opacity duration-300"
                  style={{ opacity: taglineVisible ? 1 : 0 }}
                >
                  {tagline}
                </p>
              </div>

              {/* 3. Description */}
              <p className="text-slate-400 font-light tracking-wide leading-relaxed text-sm md:text-base text-center max-w-xl">
                {T.heroDesc}
              </p>

              {/* 4. Citation toggle + Search bar + Example topics */}
              <div className="w-full max-w-3xl">
                <SearchBar
                  onSearch={startResearch}
                  onReset={reset}
                  isLoading={isLoading}
                  hasResult={hasResult}
                  lang={lang}
                />
              </div>

              {/* 5. How it works */}
              <div className="flex items-center justify-center w-full max-w-lg">
                {howItWorksSteps.map((step, i, arr) => (
                  <Fragment key={i}>
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                      <div className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center bg-slate-800/70 backdrop-blur-sm">
                        <step.Icon className="w-4 h-4 text-slate-400" />
                      </div>
                      <span className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">
                        {step.label}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex items-center mx-1 mb-4 text-slate-600">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </Fragment>
                ))}
              </div>

              {/* 6. Feature cards */}
              <div className="flex flex-wrap justify-center items-center gap-4 w-full mx-auto">
                {featureCards.map((card, i) => (
                  <div
                    key={i}
                    className={[
                      'group relative flex flex-col w-full sm:min-w-70 sm:flex-1 sm:max-w-xs',
                      `bg-linear-to-br ${card.gradient} to-transparent`,
                      'backdrop-blur-xl rounded-2xl p-5',
                      `border-t-4 ${card.topBorder} border ${card.border} ${card.hoverBorder}`,
                      `transition-all duration-300 hover:scale-105 hover:shadow-2xl ${card.hoverGlow}`,
                      'shadow-lg shadow-black/25',
                    ].join(' ')}
                  >
                    <span className="absolute top-3 right-4 font-mono text-base font-bold text-slate-700/30 select-none">
                      0{i + 1}
                    </span>
                    <div className={`w-11 h-11 mb-3 flex items-center justify-center rounded-xl bg-slate-900/40 border border-white/6 transition-transform duration-300 group-hover:scale-110 ${card.iconColor}`}>
                      <card.Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-100 mb-1">{card.title}</h3>
                    <p className="text-xs font-light tracking-wide text-slate-400 leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>

              {/* 7. Stats */}
              <div className="flex items-stretch glass-card border-white/8 rounded-2xl overflow-hidden w-full max-w-lg mx-auto">
                {([
                  { target: 5,  suffix: '+', label: T.statsSubQ    },
                  { target: 20, suffix: '+', label: T.statsSources },
                  { target: 1,  suffix: '',  label: T.statsReport  },
                ] as const).map((stat, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-center px-6 py-5 text-center relative">
                    {i > 0 && <div className="absolute left-0 top-1/4 bottom-1/4 w-px bg-white/10" />}
                    <div className="font-mono text-4xl font-bold bg-linear-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent leading-none">
                      <CountUp target={stat.target} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs text-slate-500 mt-2 tracking-wide">{stat.label}</div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        ) : (

          /* ── Active pipeline layout ── */
          <div className="w-full px-3 md:px-6 py-6 md:py-10 space-y-6 md:space-y-8">

            <SearchBar
              onSearch={startResearch}
              onReset={reset}
              isLoading={isLoading}
              hasResult={hasResult}
              lang={lang}
            />

            {state.status === 'error' && (
              <div className="glass-card px-4 md:px-5 py-4 text-red-300 text-sm flex items-start gap-3 border-red-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{state.activities[state.activities.length - 1] ?? T.somethingWentWrong}</span>
              </div>
            )}

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

          </div>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/6 mt-auto">
        <div className="w-full px-3 md:px-6 py-4 text-center">
          <span className="text-xs text-slate-700 font-mono">Built by Georgios Panagopoulos</span>
        </div>
      </footer>
    </div>
  );
}
