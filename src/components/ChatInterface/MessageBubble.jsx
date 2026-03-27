export default function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full ring-1 ring-white/10 mr-2 shrink-0 mt-1 bg-gray-900 overflow-hidden">
          <img
            src="/touchdown.jpg"
            alt="Razzle Dazzle avatar"
            className="w-full h-full object-cover object-top scale-[1.9] origin-top"
          />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-purple-600 text-white rounded-br-sm'
            : 'bg-gray-800 text-gray-100 rounded-bl-sm'
        }`}
      >
        {text}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold ml-2 shrink-0 mt-1">
          You
        </div>
      )}
    </div>
  );
}
