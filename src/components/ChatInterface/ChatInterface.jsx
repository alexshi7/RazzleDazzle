import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import LiteralAbstractToggle from './LiteralAbstractToggle';
import EmotionDropdown from './EmotionDropdown';

const WEATHER_OPTIONS = ['n/a', 'sunny', 'cloudy', 'rainy', 'stormy', 'snowy', 'foggy', 'windy'];

export default function ChatInterface({
  messages,
  onSend,
  onSketchNow,
  isLoading,
  sketchMode,
  onSketchModeChange,
  weather,
  onWeatherChange,
  emotions,
  onEmotionsChange,
}) {
  const scrollRef = useRef(null);
  const hasUserMessage = messages.some(m => m.role === 'user');
  const planningComplete = weather !== '' && emotions.length > 0 && Boolean(sketchMode);
  const submitHint = planningComplete
    ? ''
    : 'Pick weather, at least one emotion tag, and a sketch direction before sending.';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-700/50 shrink-0">
        <div className={`rd-fade-up rounded-3xl border border-fuchsia-400/15 bg-[linear-gradient(135deg,rgba(168,85,247,0.18),rgba(244,114,182,0.08),rgba(255,255,255,0.02))] shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition-all duration-300 ${hasUserMessage ? 'p-3 sm:p-4' : 'p-4 sm:p-5'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-fuchsia-200/80">Razzle Dazzle</div>
              <h1 className={`mt-2 font-semibold text-white transition-all duration-300 ${hasUserMessage ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'}`}>Turn a memory into an animated sketch.</h1>
              {hasUserMessage ? (
                <p className="mt-2 max-w-xl text-sm text-gray-300">
                  Planning is active below. Adjust the scene inputs, then keep sketching.
                </p>
              ) : (
                <>
                  <p className="mt-2 max-w-xl text-sm text-gray-300">
                    Start with the story, set the scene context, then compare four p5.js directions and refine the strongest one.
                  </p>
                  <p className="mt-3 max-w-xl text-sm text-fuchsia-100/90">
                    Please take 1-2 minutes to carefully fill out these planning steps before you generate sketches.
                  </p>
                </>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-300">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">1. Describe</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">2. Compare</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">3. Refine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-gray-500">
            <div className="text-5xl">🎨</div>
            <p className="text-sm max-w-xs">
              Start by describing a memorable life experience — a moment that shaped you, moved you, or stayed with you.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} role={msg.role} text={msg.text} />
        ))}
        {isLoading && (
          <div className="flex justify-start mb-3">
            <div className="w-8 h-8 rounded-full ring-1 ring-white/10 mr-2 shrink-0 bg-gray-900 overflow-hidden">
              <img
                src="/touchdown.jpg"
                alt="Razzle Dazzle avatar"
                className="w-full h-full object-cover object-top scale-[1.9] origin-top"
              />
            </div>
            <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sketch Now button — appears once the user has sent at least one message */}
      {hasUserMessage && !isLoading && (
        <div className="px-4 pb-2 shrink-0">
          <button
            onClick={onSketchNow}
            disabled={!planningComplete}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>✦</span> Sketch Now
          </button>
          <p className="text-xs text-gray-600 text-center mt-1.5">
            {planningComplete
              ? 'Skip Q&A and generate sketches with what I have'
              : 'Choose weather, emotions, and sketch direction first, even if the choice is N/A'}
          </p>
        </div>
      )}

      {/* Scene controls */}
      <div className="px-4 pt-3 pb-2 border-t border-gray-700/50 shrink-0">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-gray-500">
              Weather <span className="text-fuchsia-300">*</span>
            </label>
            <select
              value={weather}
              onChange={e => onWeatherChange(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-xl border border-gray-700 bg-gray-800/60 px-3 py-2 text-sm text-gray-200 outline-none transition-colors focus:border-fuchsia-500 disabled:opacity-50"
            >
              <option value="" disabled>Select weather</option>
              {WEATHER_OPTIONS.map(option => (
                <option key={option} value={option}>{option.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-gray-500">
              Emotions <span className="text-fuchsia-300">*</span>
            </label>
            <EmotionDropdown value={emotions} onChange={onEmotionsChange} disabled={isLoading} />
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-600">
          These inputs are required for generation. If they do not apply, explicitly choose <span className="text-gray-400">N/A</span>.
        </p>
      </div>

      {/* Toggle */}
      <LiteralAbstractToggle
        value={sketchMode}
        onChange={onSketchModeChange}
        disabled={isLoading}
      />

      {/* Input */}
      <div className="shrink-0">
        {!planningComplete && (
          <p className="px-4 pb-2 text-xs text-gray-600">
            Complete weather, emotions, and sketch direction to enable sending. You can still type your description now.
          </p>
        )}
        <ChatInput
          onSend={onSend}
          disabled={isLoading}
          canSubmit={planningComplete}
          submitHint={submitHint}
        />
      </div>
    </div>
  );
}
