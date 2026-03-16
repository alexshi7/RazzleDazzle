import { useRef } from 'react';
import { useIframeSketch } from '../../hooks/useIframeSketch';

export default function SketchCard({ code, index, onSelect }) {
  const iframeRef = useRef(null);
  useIframeSketch(code, iframeRef);

  return (
    <div
      className="relative group cursor-pointer rounded-xl overflow-hidden border-2 border-gray-700 hover:border-purple-500 transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/30"
      onClick={() => onSelect(index)}
    >
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        allow="accelerometer; gyroscope; magnetometer"
        title={`sketch-${index + 1}`}
        className="w-full aspect-square block pointer-events-none"
        style={{ overflow: 'hidden' }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
        <div className="p-4 w-full">
          <button className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors">
            Select this sketch
          </button>
        </div>
      </div>
      {/* Label */}
      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
        #{index + 1}
      </div>
    </div>
  );
}
