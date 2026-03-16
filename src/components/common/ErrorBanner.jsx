export default function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
      <span className="text-red-400 text-lg">⚠</span>
      <p className="text-red-300 text-sm flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-200 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
