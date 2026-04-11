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
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Scholar<span className="text-indigo-400">Mind</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">AI-Powered Academic Research Agent</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            claude-sonnet-4-5
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Search bar */}
        <SearchBar
          onSearch={startResearch}
          onReset={reset}
          isLoading={isLoading}
          hasResult={hasResult}
        />

        {/* Error state */}
        {state.status === 'error' && (
          <div className="bg-red-900/40 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
            <strong>Error:</strong>{' '}
            {state.activities[state.activities.length - 1] ?? 'Something went wrong.'}
          </div>
        )}

        {/* Pipeline + Activity feed */}
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

        {/* Sub-questions only (after planning, before search grid shows) */}
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
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">🎓</div>
            <h2 className="text-2xl font-semibold text-gray-200">
              Research anything, instantly
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
              ScholarMind autonomously breaks your topic into sub-questions, searches
              the web, synthesizes sources, and delivers a structured academic report
              — complete with citations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto text-left">
              {[
                { icon: '🧠', title: 'Smart Planning', desc: 'Claude breaks your topic into focused sub-questions' },
                { icon: '🔍', title: 'Web Search', desc: 'Live DuckDuckGo search for up-to-date information' },
                { icon: '📄', title: 'Academic Report', desc: 'Structured report with APA citations and PDF export' },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                >
                  <div className="text-2xl mb-2">{card.icon}</div>
                  <h3 className="text-sm font-semibold text-gray-200 mb-1">{card.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-gray-600">
          <span>ScholarMind — AUEB AI for Developers Final Project</span>
          <span>Powered by Claude + RAG + FastAPI</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
