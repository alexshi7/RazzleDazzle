export default function LiteralAbstractToggle({ value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1.5 px-4 pb-2">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Sketch direction</p>
      <div className="flex bg-gray-800 rounded-xl p-1 gap-1">
        {['literal', 'abstract'].map(mode => (
          <button
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
    </div>
  );
}
