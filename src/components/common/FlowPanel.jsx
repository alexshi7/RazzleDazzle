import { PHASE } from '../../hooks/useAppState';

const STEPS = [
  { id: PHASE.CHAT, label: 'Tell the story' },
  { id: PHASE.GRID, label: 'Compare 4 directions' },
  { id: PHASE.ITERATION, label: 'Refine the favorite' },
  { id: PHASE.DONE, label: 'Export the sketch' },
];

function getStepState(stepId, phase) {
  const order = [PHASE.CHAT, PHASE.GRID, PHASE.ITERATION, PHASE.DONE];
  const currentIndex = order.indexOf(phase);
  const stepIndex = order.indexOf(stepId);

  if (stepIndex < currentIndex) return 'done';
  if (stepIndex === currentIndex) return 'current';
  return 'upcoming';
}

function getPhaseCopy({ phase, isLoading, loadingLabel, feedbackCount }) {
  if (phase === PHASE.CHAT) {
    return {
      eyebrow: 'What happens next',
      title: 'Start with the memory, not the visuals.',
      body: 'Describe the moment in plain language. The system may ask one short follow-up if it needs more texture, then it will turn your description into four different animated p5.js directions.',
      status: isLoading ? 'Reading your story now.' : 'Waiting for your first memory.',
    };
  }

  if (phase === PHASE.GRID) {
    return {
      eyebrow: isLoading ? 'Generating previews' : 'Choose a direction',
      title: isLoading ? 'Four animated sketches are being built.' : 'Each preview is a different interpretation of the same moment.',
      body: isLoading
        ? (loadingLabel || 'The system is composing four distinct concepts from your story, then it will show them side by side.')
        : 'Compare the four previews and pick the one that feels closest to what you imagined. The next step is refinement, not regeneration from scratch.',
      status: isLoading ? 'Building candidate sketches.' : 'Ready for selection.',
    };
  }

  if (phase === PHASE.ITERATION) {
    return {
      eyebrow: 'Refinement mode',
      title: 'You guide the next pass with targeted feedback.',
      body: `Rate the sketch and say what should change. The next version will keep the strongest parts and push the differences you asked for${feedbackCount > 0 ? ` after ${feedbackCount} prior round${feedbackCount === 1 ? '' : 's'}` : ''}.`,
      status: isLoading ? (loadingLabel || 'Refining your selected sketch.') : 'Waiting for your notes.',
    };
  }

  return {
    eyebrow: 'Final output',
    title: 'The sketch is ready to export or restart.',
    body: 'You can copy the p5.js code, open it in the editor, or begin another piece with a new memory.',
    status: 'Complete.',
  };
}

export default function FlowPanel(props) {
  const { phase, sketchMode, summary, weather, emotions = [] } = props;
  const copy = getPhaseCopy(props);

  return (
    <aside className="hidden lg:flex w-[300px] xl:w-[320px] shrink-0 border-r border-gray-800 bg-[radial-gradient(circle_at_top,#1d1630,transparent_45%),linear-gradient(180deg,#11111a_0%,#0b0b11_100%)]">
      <div className="flex h-full w-full flex-col overflow-y-auto px-5 py-5 xl:px-6 xl:py-6">
        <div className="rd-fade-up rounded-3xl border border-white/10 bg-black/20 p-4 xl:p-5">
          <div className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Flow</div>
          <div className="mt-4 space-y-3">
            {STEPS.map((step, index) => {
              const state = getStepState(step.id, phase);
              const isCurrent = state === 'current';
              const isDone = state === 'done';

              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold ${
                    isCurrent
                      ? 'border-fuchsia-400 bg-fuchsia-400/15 text-fuchsia-200 shadow-[0_0_0_6px_rgba(217,70,239,0.08)]'
                      : isDone
                        ? 'border-emerald-400/60 bg-emerald-400/10 text-emerald-200'
                        : 'border-gray-700 bg-gray-900 text-gray-500'
                  }`}>
                    {isDone ? '✓' : index + 1}
                  </div>
                  <div>
                    <div className={`text-sm ${isCurrent ? 'text-white' : isDone ? 'text-gray-300' : 'text-gray-500'}`}>{step.label}</div>
                    <div className="text-xs text-gray-600">{isCurrent ? 'Current step' : isDone ? 'Done' : 'Coming up'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rd-fade-up mt-4 rounded-3xl border border-fuchsia-400/20 bg-fuchsia-400/8 p-4 xl:p-5" style={{ animationDelay: '80ms' }}>
          <div className="text-[11px] uppercase tracking-[0.24em] text-fuchsia-200/80">{copy.eyebrow}</div>
          <h2 className="mt-2 text-lg font-semibold text-white">{copy.title}</h2>
          <p className="mt-3 text-sm leading-6 text-gray-300">{copy.body}</p>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-gray-300">
            <span className="text-gray-500">Status:</span> {copy.status}
          </div>
        </div>

        <div className="rd-fade-up mt-4 rounded-3xl border border-white/10 bg-black/20 p-4 xl:p-5 text-sm text-gray-300" style={{ animationDelay: '160ms' }}>
          <div className="text-[11px] uppercase tracking-[0.24em] text-gray-500">Current setup</div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-gray-300">
              {sketchMode === 'literal' ? 'Literal mode' : sketchMode === 'abstract' ? 'Abstract mode' : 'Direction: Required'}
            </span>
            <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-gray-300">
              Weather: {weather || 'Required'}
            </span>
            <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-gray-300">
              Emotions: {emotions.length ? emotions.join(', ') : 'Required'}
            </span>
          </div>
          {summary && (
            <p className="mt-4 text-xs leading-5 text-gray-400">
              Summary: {summary}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
