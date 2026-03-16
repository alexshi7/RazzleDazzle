import { useState } from 'react';
import StarRating from './StarRating';
import LoadingSpinner from '../common/LoadingSpinner';

function getRatingResponse(rating) {
  if (rating <= 2) {
    return "I'm sorry this missed the mark. We'll make it right.";
  }
  if (rating <= 4) {
    return "Let's work hard to get this right.";
  }
  return "Strong signal. I'll preserve what's working and make only the changes you describe.";
}

export default function FeedbackPanel({ onSubmit, onSatisfied, isLoading, iteration }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  const canSubmit = rating > 0 && text.trim().length > 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit || isLoading) return;
    onSubmit({ rating, text: text.trim() });
    setRating(0);
    setText('');
  }

  return (
    <div className="border-t border-gray-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-300">Iteration {iteration}</span>
        <span className="text-xs text-gray-500">Refine until you're happy</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <LoadingSpinner label="Refining your sketch..." />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              How close is this? <span className="text-purple-400">*</span>
            </label>
            <StarRating value={rating} onChange={setRating} />
            {rating > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">
                  {['', 'Not there yet', 'Getting warmer', 'Pretty close', 'Almost!', 'Perfect!'][rating]}
                </p>
                <p className={`text-xs ${
                  rating <= 2 ? 'text-rose-300' : rating <= 4 ? 'text-amber-300' : 'text-emerald-300'
                }`}>
                  {getRatingResponse(rating)}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              What should change? <span className="text-purple-400">*</span>
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              disabled={isLoading}
              placeholder="Be specific — e.g. 'make the snow faster', 'add a figure crossing the bridge', 'use colder blue tones'…"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
            />
            <p className="text-xs text-gray-600 mt-1">
              A star rating alone will not continue. Include written feedback so the next iteration has clear direction.
            </p>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
          >
            Submit Feedback &amp; Refine →
          </button>

          <div className="flex items-center gap-2 my-0.5">
            <div className="flex-1 h-px bg-gray-700/50" />
            <span className="text-xs text-gray-600">or</span>
            <div className="flex-1 h-px bg-gray-700/50" />
          </div>

          <button
            type="button"
            onClick={onSatisfied}
            className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium transition-colors"
          >
            ✓ I'm satisfied with this sketch
          </button>
        </form>
      )}
    </div>
  );
}
