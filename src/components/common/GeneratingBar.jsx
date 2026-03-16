export default function GeneratingBar({ progress, label }) {
  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
