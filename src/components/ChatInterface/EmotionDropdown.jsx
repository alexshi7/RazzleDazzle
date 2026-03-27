import { useEffect, useRef, useState } from 'react';

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
  const dropdownRef = useRef(null);
  const selectedLabel = value.length === 0
    ? 'Choose emotion tags'
    : value.join(', ');

  useEffect(() => {
    function handlePointerDown(event) {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  return (
    <div className="group relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(current => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-700 bg-gray-800/60 px-3 py-2 text-sm text-gray-300 transition-colors hover:border-fuchsia-500/50 disabled:opacity-50"
      >
        <span className={`${value.length === 0 ? 'text-gray-500' : 'text-gray-200'} truncate pr-3`}>
          {selectedLabel}
        </span>
        <span className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {isOpen && (
        <div className="mt-2 w-full rounded-2xl border border-gray-700 bg-[#14141c] p-3 shadow-2xl">
          <style>{`
            .emotion-scrollbar {
              scrollbar-width: auto;
              scrollbar-color: #f59e0b rgba(255, 255, 255, 0.08);
            }
            .emotion-scrollbar::-webkit-scrollbar {
              width: 10px;
            }
            .emotion-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.08);
              border-radius: 9999px;
            }
            .emotion-scrollbar::-webkit-scrollbar-thumb {
              background: #f59e0b;
              border-radius: 9999px;
              border: 2px solid rgba(20, 20, 28, 1);
            }
          `}</style>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Select one or more</div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-300 transition-colors hover:border-amber-300 hover:text-amber-200"
            >
              X
            </button>
          </div>
          <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-amber-300/80">
            Scroll for more emotions
          </div>
          <div className="emotion-scrollbar max-h-52 overflow-y-scroll pr-2">
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
      )}
    </div>
  );
}
