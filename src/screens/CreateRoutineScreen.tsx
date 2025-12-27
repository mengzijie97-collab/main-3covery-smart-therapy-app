import { useState } from 'react';
import { X, Save, Thermometer, Flame, Wind, Edit2, Trash2 } from 'lucide-react';
import { Program } from '../App';

interface CreateRoutineScreenProps {
  onNavigate: (screen: 'login' | 'pairing' | 'scanning' | 'device-list' | 'connected' | 'main-app' | 'program-detail' | 'create-routine') => void;
  onSaveRoutine: (program: Program) => void;
}

type SegmentType = 'cold' | 'heat' | 'pressure';
type CompressionMode = 'overall' | 'flow' | 'wave' | 'custom';

interface Segment {
  id: string;
  type: SegmentType;
  duration: number;
  temperature?: number;
  compressionLevel?: number;
  compressionMode?: CompressionMode;
}

const defaultSegmentValues: Record<SegmentType, Partial<Segment>> = {
  cold: {
    duration: 15,
    temperature: 10,
    compressionLevel: 2,
    compressionMode: 'wave',
  },
  heat: {
    duration: 15,
    temperature: 40,
    compressionLevel: 2,
    compressionMode: 'wave',
  },
  pressure: {
    duration: 20,
    compressionLevel: 3,
    compressionMode: 'wave',
  },
};

export default function CreateRoutineScreen({ onNavigate, onSaveRoutine }: CreateRoutineScreenProps) {
  const [routineName, setRoutineName] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);

  const addSegment = (type: SegmentType) => {
    const newSegment: Segment = {
      id: `segment-${Date.now()}`,
      type,
      ...defaultSegmentValues[type],
    } as Segment;
    setSegments([...segments, newSegment]);
  };

  const deleteSegment = (id: string) => {
    setSegments(segments.filter(seg => seg.id !== id));
  };

  const getSegmentIcon = (type: SegmentType) => {
    switch (type) {
      case 'cold':
        return <Thermometer className="w-5 h-5 text-blue-500" strokeWidth={1.5} />;
      case 'heat':
        return <Flame className="w-5 h-5 text-orange-500" strokeWidth={1.5} />;
      case 'pressure':
        return <Wind className="w-5 h-5 text-primary" strokeWidth={1.5} />;
    }
  };

  const getSegmentColor = (type: SegmentType) => {
    switch (type) {
      case 'cold':
        return 'bg-blue-500';
      case 'heat':
        return 'bg-orange-500';
      case 'pressure':
        return 'bg-primary';
    }
  };

  const getSegmentName = (type: SegmentType) => {
    switch (type) {
      case 'cold':
        return 'COLD Segment';
      case 'heat':
        return 'HEAT Segment';
      case 'pressure':
        return 'PRESSURE Segment';
    }
  };

  const getSegmentSummary = (segment: Segment) => {
    const parts = [`${segment.duration} min`];
    if (segment.temperature) {
      parts.push(`${segment.temperature}°C`);
    }
    if (segment.compressionLevel !== undefined) {
      parts.push(`Level ${segment.compressionLevel}`);
    }
    return parts.join(' • ');
  };

  const canSave = routineName.trim() !== '' && segments.length > 0;

  const handleSave = () => {
    if (canSave) {
      const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
      const segmentSummary = segments.map(seg => getSegmentName(seg.type)).join(' → ');
      
      const newProgram: Program = {
        id: `custom_${Date.now()}`,
        name: routineName,
        description: segmentSummary,
        duration: totalDuration,
        segments: `${segments.length} segment${segments.length !== 1 ? 's' : ''}`,
      };
      
      onSaveRoutine(newProgram);
      onNavigate('main-app');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-1 text-foreground pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => onNavigate('main-app')}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">New Routine</h1>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
              canSave
                ? 'text-primary hover:bg-primary/10'
                : 'text-gray-400 opacity-50 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" strokeWidth={1.5} />
            Save
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Routine Name Input */}
        <div>
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            placeholder="Enter routine name..."
            className="w-full text-xl font-semibold text-gray-900 placeholder:text-gray-400 bg-white rounded-lg px-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Segment Selector (Palette) */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">ADD SEGMENT</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => addSegment('cold')}
              className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Thermometer className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold text-gray-900">COLD</span>
              </div>
            </button>

            <button
              onClick={() => addSegment('heat')}
              className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Flame className="w-6 h-6 text-orange-500" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold text-gray-900">HEAT</span>
              </div>
            </button>

            <button
              onClick={() => addSegment('pressure')}
              className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Wind className="w-6 h-6 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-semibold text-gray-900">PRESSURE</span>
              </div>
            </button>
          </div>
        </div>

        {/* Timeline Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            TIMELINE {segments.length > 0 && `(${segments.length})`}
          </h3>
          
          <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-4 min-h-[200px]">
            {segments.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center py-8">
                <p className="text-sm text-gray-500">
                  Tap a segment type above to add it to your routine
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setEditingSegment(segment)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Numbered Badge */}
                      <div className={`w-8 h-8 rounded-full ${getSegmentColor(segment.type)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>

                      {/* Segment Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                          {getSegmentIcon(segment.type)}
                          {getSegmentName(segment.type)}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getSegmentSummary(segment)}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSegment(segment);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSegment(segment.id);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Segment Modal */}
      {editingSegment && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit {getSegmentName(editingSegment.type)}
              </h3>
              <button
                onClick={() => setEditingSegment(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
              </button>
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Duration: {editingSegment.duration} min
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={editingSegment.duration}
                onChange={(e) => {
                  const updated = { ...editingSegment, duration: Number(e.target.value) };
                  setEditingSegment(updated);
                  setSegments(segments.map(s => s.id === updated.id ? updated : s));
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Temperature (for cold/heat) */}
            {editingSegment.temperature !== undefined && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Temperature: {editingSegment.temperature}°C
                </label>
                <input
                  type="range"
                  min={editingSegment.type === 'cold' ? 5 : 35}
                  max={editingSegment.type === 'cold' ? 15 : 42}
                  value={editingSegment.temperature}
                  onChange={(e) => {
                    const updated = { ...editingSegment, temperature: Number(e.target.value) };
                    setEditingSegment(updated);
                    setSegments(segments.map(s => s.id === updated.id ? updated : s));
                  }}
                  className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${
                    editingSegment.type === 'cold' ? 'accent-blue-500' : 'accent-orange-500'
                  }`}
                />
              </div>
            )}

            {/* Compression Level */}
            {editingSegment.compressionLevel !== undefined && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Compression Level: {editingSegment.compressionLevel}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[0, 1, 2, 3, 4].map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        const updated = { ...editingSegment, compressionLevel: level };
                        setEditingSegment(updated);
                        setSegments(segments.map(s => s.id === updated.id ? updated : s));
                      }}
                      className={`py-2 rounded border-2 transition-all text-sm font-semibold ${
                        editingSegment.compressionLevel === level
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compression Mode */}
            {editingSegment.compressionMode && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Compression Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['overall', 'flow', 'wave', 'custom'] as CompressionMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        const updated = { ...editingSegment, compressionMode: mode };
                        setEditingSegment(updated);
                        setSegments(segments.map(s => s.id === updated.id ? updated : s));
                      }}
                      className={`py-2 px-3 rounded border-2 transition-all text-sm font-medium capitalize ${
                        editingSegment.compressionMode === mode
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setEditingSegment(null)}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
