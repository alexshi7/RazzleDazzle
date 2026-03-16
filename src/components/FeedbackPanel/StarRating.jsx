export default function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-3xl transition-transform hover:scale-110 ${
            n <= value ? 'text-yellow-400' : 'text-gray-600'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
