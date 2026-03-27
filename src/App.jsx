import { useEffect, useRef } from 'react';
import { useAppState, PHASE } from './hooks/useAppState';
import {
  initChat,
  sendChatMessage,
  getSummary,
  requestSketchNow,
  generateProofSketches,
  iterateSketch,
} from './services/aiService';

import ChatInterface from './components/ChatInterface/ChatInterface';
import SketchGrid from './components/SketchGrid/SketchGrid';
import SketchViewer from './components/SketchViewer/SketchViewer';
import FeedbackPanel from './components/FeedbackPanel/FeedbackPanel';
import ErrorBanner from './components/common/ErrorBanner';
import FlowPanel from './components/common/FlowPanel';

function useProgressTimer(dispatch) {
  const timerRef = useRef(null);

  function start(label, targetPct = 85, durationMs = 12000) {
    dispatch({ type: 'SET_PROGRESS', payload: { progress: 5, label } });
    let current = 5;
    const step = (targetPct - current) / (durationMs / 200);
    timerRef.current = setInterval(() => {
      current = Math.min(current + step, targetPct);
      dispatch({ type: 'SET_PROGRESS', payload: { progress: Math.round(current) } });
    }, 200);
  }

  function finish() {
    clearInterval(timerRef.current);
    dispatch({ type: 'SET_PROGRESS', payload: { progress: 100 } });
    setTimeout(() => dispatch({ type: 'SET_LOADING', payload: false }), 400);
  }

  function cancel() {
    clearInterval(timerRef.current);
  }

  return { start, finish, cancel };
}

const WELCOME = "Hi! I'm here to help you create a p5.js sketch from a meaningful life experience. What moment would you like to bring to life?";

export default function App() {
  const { state, dispatch } = useAppState();
  const { phase, messages, sketchMode, weather, emotions, summary, sketches, currentSketch, iteration, feedbackHistory, isLoading, loadingLabel, progress, error } = state;
  const progressTimer = useProgressTimer(dispatch);
  const metadataComplete = weather !== '' && emotions.length > 0 && Boolean(sketchMode);
  const hasBootstrappedRef = useRef(false);

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;
    initChat();
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'ai', text: WELCOME } });
    return () => progressTimer.cancel();
  }, []);

  // ── Chat phase ──────────────────────────────────────────────────────────────

  async function handleChatSend(text) {
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'user', text } });
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await sendChatMessage(text, sketchMode);
      dispatch({ type: 'ADD_MESSAGE', payload: { role: 'ai', text: result.text } });
      if (result.ready) {
        await startGridGeneration(result.summary);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (err) {
      progressTimer.cancel();
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }

  async function handleSketchNow() {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const sum = await requestSketchNow(sketchMode);
      dispatch({ type: 'SET_SUMMARY', payload: sum });
      await startGridGeneration(sum);
    } catch (err) {
      progressTimer.cancel();
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }

  async function startGridGeneration(sum) {
    if (!metadataComplete) {
      dispatch({ type: 'SET_ERROR', payload: 'Choose weather, at least one emotion tag, and a sketch direction before generating sketches. Use N/A if they do not apply.' });
      return;
    }
    dispatch({ type: 'SET_SUMMARY', payload: sum });
    dispatch({ type: 'SET_PHASE', payload: PHASE.GRID });
    progressTimer.start('Generating 4 sketch concepts…', 85, 14000);
    try {
      const generated = await generateProofSketches(sum, sketchMode, emotions, weather);
      dispatch({ type: 'SET_SKETCHES', payload: generated });
      progressTimer.finish();
    } catch (err) {
      progressTimer.cancel();
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }

  // ── Grid phase ──────────────────────────────────────────────────────────────

  function handleSelectSketch(index) {
    dispatch({ type: 'SELECT_SKETCH', payload: index });
  }

  // ── Iteration phase ─────────────────────────────────────────────────────────

  async function handleFeedback({ rating, text }) {
    const feedback = { rating, text };
    dispatch({ type: 'ADD_FEEDBACK', payload: feedback });
    dispatch({ type: 'SET_LOADING', payload: true });
    progressTimer.start('Refining your sketch…', 85, 10000);
    try {
      const newCode = await iterateSketch(
        summary || getSummary(),
        sketchMode,
        currentSketch,
        [...feedbackHistory, feedback]
      );
      dispatch({ type: 'SET_CURRENT_SKETCH', payload: newCode });
      progressTimer.finish();
    } catch (err) {
      progressTimer.cancel();
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  }

  function handleSatisfied() {
    dispatch({ type: 'SET_PHASE', payload: PHASE.DONE });
  }

  // ── Reset ───────────────────────────────────────────────────────────────────

  function handleReset() {
    progressTimer.cancel();
    initChat();
    dispatch({ type: 'RESET' });
    dispatch({ type: 'ADD_MESSAGE', payload: { role: 'ai', text: WELCOME } });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="h-dvh bg-[#0f0f13] flex flex-col overflow-hidden">
      <header className="border-b border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-fuchsia-300 text-xl">✦</span>
          <span className="font-semibold text-white tracking-tight">Razzle Dazzle</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
            GPT-4o mini · GPT-5
          </span>
        </div>
        {phase !== PHASE.CHAT && (
          <button onClick={handleReset} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Start over
          </button>
        )}
      </header>

      {error && (
        <div className="px-4 sm:px-6 pt-3">
          <ErrorBanner message={error} onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })} />
        </div>
      )}

      <div className="px-4 sm:px-6 pt-3 shrink-0">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/8 px-4 py-2.5 text-xs sm:text-sm text-amber-100">
          <span className="font-medium">Disclaimer:</span> Razzle Dazzle is AI and can make mistakes. Please be patient and cooperative. It is not a mental health service. If you need professional support, please seek professional help.
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden min-h-0 pt-3 sm:pt-4">
        <FlowPanel
          phase={phase}
          isLoading={isLoading}
          loadingLabel={loadingLabel}
          sketchMode={sketchMode}
          weather={weather}
          emotions={emotions}
          summary={summary}
          feedbackCount={feedbackHistory.length}
        />

        {phase === PHASE.CHAT && (
          <div className="flex-1 min-h-0 max-w-2xl mx-auto w-full flex flex-col border-x border-gray-800">
            <ChatInterface
              messages={messages}
              onSend={handleChatSend}
              onSketchNow={handleSketchNow}
              isLoading={isLoading}
              sketchMode={sketchMode}
              onSketchModeChange={mode => dispatch({ type: 'SET_SKETCH_MODE', payload: mode })}
              weather={weather}
              onWeatherChange={val => dispatch({ type: 'SET_WEATHER', payload: val })}
              emotions={emotions}
              onEmotionsChange={val => dispatch({ type: 'SET_EMOTIONS', payload: val })}
            />
          </div>
        )}

        {phase === PHASE.GRID && (
          <div className="flex-1 min-h-0 max-w-4xl mx-auto w-full flex flex-col">
            <SketchGrid
              sketches={sketches}
              onSelect={handleSelectSketch}
              isLoading={isLoading}
              progress={progress}
              loadingLabel={loadingLabel}
            />
          </div>
        )}

        {(phase === PHASE.ITERATION || phase === PHASE.DONE) && (
          <div className="flex-1 min-h-0 flex overflow-hidden">
            <div className="flex-1 min-h-0 p-4 sm:p-6 flex items-center justify-center bg-gray-900/20 overflow-y-auto">
              {phase === PHASE.DONE ? (
                <div className="flex flex-col items-center gap-6 text-center max-w-lg w-full">
                  <SketchViewer code={currentSketch} isLoading={false} />
                  <div>
                    <h2 className="text-2xl font-semibold text-white">Your sketch is complete!</h2>
                    <p className="text-gray-400 mt-2 text-sm">
                      Refined over {feedbackHistory.length} iteration{feedbackHistory.length !== 1 ? 's' : ''}.
                    </p>
                  </div>

                  {/* Code export */}
                  <div className="w-full text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">p5.js code</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigator.clipboard.writeText(`new p5(function(p) {\n${currentSketch}\n});`)}
                          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Copy
                        </button>
                        <a
                          href="https://editor.p5js.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          Open p5 Editor ↗
                        </a>
                      </div>
                    </div>
                    <pre className="bg-gray-900 border border-gray-700 rounded-xl p-4 text-xs text-gray-300 overflow-auto max-h-48 text-left whitespace-pre-wrap break-all">
                      <code>{`new p5(function(p) {\n${currentSketch}\n});`}</code>
                    </pre>
                    <p className="text-xs text-gray-600 mt-2">Paste this into the p5.js web editor to save or share.</p>
                  </div>

                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Create another sketch
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-xl">
                  <SketchViewer code={currentSketch} isLoading={isLoading} progress={progress} loadingLabel={loadingLabel} />
                </div>
              )}
            </div>

            {phase === PHASE.ITERATION && (
                <div className="w-80 shrink-0 border-l border-gray-800 flex flex-col bg-[#0f0f13]">
                  <div className="px-5 py-5 border-b border-gray-700/50">
                    <h2 className="text-lg font-semibold text-white">Refine Your Sketch</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {sketchMode === 'literal' ? '🎨 Literal mode' : '✨ Abstract mode'}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <div className="px-5 py-4">
                    {feedbackHistory.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Previous feedback</p>
                        {feedbackHistory.map((f, i) => (
                          <div key={i} className="bg-gray-800/50 rounded-lg px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Round {i + 1}</span>
                              <span className="text-yellow-400 text-xs">{'★'.repeat(f.rating)}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{f.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <FeedbackPanel
                  onSubmit={handleFeedback}
                  onSatisfied={handleSatisfied}
                  isLoading={isLoading}
                  iteration={iteration}
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
