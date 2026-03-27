import { useState } from 'react';

export default function LiteralAbstractToggle({ value, onChange, disabled }) {
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 px-4 pb-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Sketch direction</p>
        <button
          type="button"
          onClick={() => setIsExplainerOpen(true)}
          className="text-xs text-fuchsia-300 hover:text-fuchsia-200 transition-colors"
        >
          What’s the difference?
        </button>
      </div>
      <div className="flex bg-gray-800 rounded-xl p-1 gap-1">
        {['literal', 'abstract'].map(mode => (
          <button
            type="button"
            key={mode}
            onClick={() => !disabled && onChange(mode)}
            disabled={disabled}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${
              value === mode
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-200'
            } disabled:cursor-not-allowed`}
          >
            {mode === 'literal' ? '🎨 Literal' : '✨ Abstract'}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-600">
        {value === 'literal'
          ? 'Depict the actual scene or event'
          : value === 'abstract'
            ? 'Express the feeling or emotion visually'
            : 'Choose a direction before you start sketching'}
      </p>

      {isExplainerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#14141b] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-fuchsia-200/80">Sketch direction guide</div>
                <h3 className="mt-2 text-xl font-semibold text-white">Literal vs. Abstract</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsExplainerOpen(false)}
                className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold text-white">🎨 Literal</div>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  Literal sketches are more realistic and representational. They try to show the actual scene, place,
                  people, objects, weather, and actions from your memory in a recognizable way.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold text-white">✨ Abstract</div>
                <p className="mt-2 text-sm leading-6 text-gray-300">
                  Abstract sketches are more symbolic and non-representational. They focus less on what literally
                  happened and more on expressing the feeling, rhythm, tension, or atmosphere of the memory.
                </p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              Choose literal if you want the event depicted. Choose abstract if you want the emotion interpreted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
