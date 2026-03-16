import { useMemo } from 'react';
import { buildSketchHtml } from '../../utils/buildSketchHtml';
import GeneratingBar from '../common/GeneratingBar';

export default function SketchViewer({ code, isLoading, progress, loadingLabel }) {
  const srcdoc = useMemo(() => (code ? buildSketchHtml(code) : ''), [code]);

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-gray-700 bg-gray-900">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <GeneratingBar progress={progress} label={loadingLabel} />
        </div>
      )}
      <iframe
        srcDoc={srcdoc}
        sandbox="allow-scripts"
        allow="accelerometer; gyroscope; magnetometer"
        title="current-sketch"
        className="w-full h-full block"
        style={{ overflow: 'hidden', visibility: isLoading ? 'hidden' : 'visible' }}
      />
    </div>
  );
}
