import { useState } from 'react';

const EMOTION_OPTIONS = [
  'n/a',
  'calm',
  'joy',
  'awe',
  'nostalgia',
  'grief',
  'tension',
  'confusion',
  'intimacy',
  'release',
  'hope',
  'loneliness',
  'anger',
  'wonder',
];

function toggleEmotion(value, emotion, checked) {
  if (emotion === 'n/a') {
    return checked ? ['n/a'] : [];
  }

  const next = new Set(value.filter(item => item !== 'n/a'));
  if (checked) {
    next.add(emotion);
  } else {
    next.delete(emotion);
  }
  return Array.from(next);
}

export default function EmotionDropdown({ value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = value.length === 0
    ? 'Choose emotion tags'
    : value.join(', ');

  return (
    <details
      className="group relative"
      open={isOpen}
      onToggle={event => setIsOpen(event.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-gray-700 bg-gray-800/60 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-fuchsia-500/50">
        <span className={`${value.length === 0 ? 'text-gray-500' : 'text-gray-200'} truncate pr-3`}>
          {selectedLabel}
        </span>
        <span className="text-gray-500 transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="mt-2 w-full rounded-2xl border border-gray-700 bg-[#14141c] p-3 shadow-2xl">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Select one or more</div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md border border-gray-700 bg-black/20 px-2 py-1 text-xs text-gray-300 transition-colors hover:border-fuchsia-500/50 hover:text-white"
          >
            ˄
          </button>
        </div>
        <div className="max-h-52 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EMOTION_OPTIONS.map(emotion => {
            const checked = value.includes(emotion);
            return (
              <label
                key={emotion}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  checked
                    ? 'border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-100'
                    : 'border-gray-700 bg-black/20 text-gray-300'
                } ${disabled ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={e => onChange(toggleEmotion(value, emotion, e.target.checked))}
                  className="accent-fuchsia-500"
                />
                <span className="capitalize">{emotion}</span>
              </label>
            );
          })}
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Select <span className="text-gray-300">N/A</span> if no emotion tags should guide the sketch.
        </p>
      </div>
    </details>
  );
}
