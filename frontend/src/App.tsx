import './index.css';
import { useResearch } from './hooks/useResearch';
import { SearchBar } from './components/SearchBar';
import { PipelineView } from './components/PipelineView';
import { ActivityFeed } from './components/ActivityFeed';
import { SubQuestions } from './components/SubQuestions';
import { ReportPanel } from './components/ReportPanel';
import { FollowUp } from './components/FollowUp';

function App() {
  const { state, qaHistory, startResearch, askFollowup, exportPdf, reset } = useResearch();

  const isLoading = ['planning', 'searching', 'synthesizing', 'writing'].includes(state.status);
  const hasResult = state.status === 'complete';
  const showPipeline = state.status !== 'idle';

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* ── Header ── */}
      <header className="border-b border-gray-800/80 bg-gray-900/90 backdrop-blur-md sticky top-0 z-20 shadow-md shadow-black/30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Scholar<span className="text-indigo-400">Mind</span>
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">AI-Powered Academic Research Agent</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-800/60 border border-gray-700/60 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            claude-sonnet-4-5
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-5">

        {/* Search bar */}
        <SearchBar
          onSearch={startResearch}
          onReset={reset}
          isLoading={isLoading}
          hasResult={hasResult}
        />

        {/* Error */}
        {state.status === 'error' && (
          <div className="bg-red-950/50 border border-red-700/60 rounded-2xl px-5 py-4 text-red-300 text-sm flex items-start gap-3 shadow-lg shadow-black/20">
            <svg className="w-4 h-4 shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span>{state.activities[state.activities.length - 1] ?? 'Something went wrong.'}</span>
          </div>
        )}

        {/* Pipeline + Activity */}
        {showPipeline && (
          <div className="space-y-4">
            <PipelineView
              status={state.status}
              currentStep={state.currentStep}
              totalSteps={state.totalSteps}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ActivityFeed activities={state.activities} />

              {state.subQuestions.length > 0 && (
                <SubQuestions
                  subQuestions={state.subQuestions}
                  currentStep={state.currentStep}
                />
              )}
            </div>
          </div>
        )}

        {/* Sub-questions only (after planning, before pipeline shows) */}
        {!showPipeline && state.subQuestions.length > 0 && (
          <SubQuestions
            subQuestions={state.subQuestions}
            currentStep={state.currentStep}
          />
        )}

        {/* Report */}
        {hasResult && (
          <ReportPanel
            report={state.report}
            sources={state.sources}
            onExportPdf={exportPdf}
          />
        )}

        {/* Follow-up */}
        {hasResult && (
          <FollowUp
            qaHistory={qaHistory}
            report={state.report}
            onAsk={askFollowup}
          />
        )}

        {/* Idle hero */}
        {state.status === 'idle' && (
          <div className="text-center py-20 space-y-5 fade-in-up">
            <div className="text-5xl">🎓</div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-gray-100">
                Research anything, instantly
              </h2>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed text-sm">
                ScholarMind autonomously breaks your topic into sub-questions, searches
                the web, synthesizes sources, and delivers a structured academic report
                — complete with citations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 max-w-2xl mx-auto text-left">
              {[
                {
                  icon: '🧠',
                  title: 'Smart Planning',
                  desc: 'Claude breaks your topic into focused sub-questions',
                  color: 'border-indigo-700/40 hover:border-indigo-600/60',
                },
                {
                  icon: '🔍',
                  title: 'Live Web Search',
                  desc: 'DuckDuckGo search for up-to-date information',
                  color: 'border-emerald-700/40 hover:border-emerald-600/60',
                },
                {
                  icon: '📄',
                  title: 'Academic Report',
                  desc: 'Structured report with APA or IEEE citations and PDF export',
                  color: 'border-violet-700/40 hover:border-violet-600/60',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`bg-gray-800/70 rounded-2xl p-4 border transition-all duration-200 hover:bg-gray-800 shadow-lg shadow-black/20 ${card.color}`}
                >
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <h3 className="text-sm font-semibold text-gray-200 mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800/60 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-gray-700">
          <span>ScholarMind — AUEB AI for Developers Final Project</span>
          <span>Powered by Claude + RAG + FastAPI</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
