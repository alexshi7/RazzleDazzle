import SketchCard from './SketchCard';
import GeneratingBar from '../common/GeneratingBar';
import RotatingFactsPanel from '../common/RotatingFactsPanel';

export default function SketchGrid({ sketches, onSelect, isLoading, progress, loadingLabel }) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700/50">
        <h2 className="text-xl font-semibold text-white">Choose Your Vision</h2>
        <p className="text-sm text-gray-400 mt-1">
          Here are 4 different interpretations. Click the one that resonates most with what you had in mind.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex min-h-full flex-col items-center justify-center">
            <GeneratingBar progress={progress} label={loadingLabel} />
            <RotatingFactsPanel warning="Generating all 4 sketches may take up to 3 minutes." />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {sketches.map((code, i) => (
              <SketchCard key={i} code={code} index={i} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
