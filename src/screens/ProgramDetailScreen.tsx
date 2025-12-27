import { ArrowLeft, Heart, Play, Lock } from 'lucide-react';
import { Program } from '../App';
import { useState } from 'react';
import ConversionModal from '../components/ConversionModal';

interface ProgramDetailScreenProps {
  onNavigate: (screen: 'login' | 'pairing' | 'scanning' | 'device-list' | 'connected' | 'main-app' | 'program-detail' | 'create-routine', program?: Program) => void;
  program: Program | null;
  onStartProgram: (type: 'MANUAL' | 'PROGRAM', data: any) => void;
  isVisitorMode?: boolean;
}

interface ProgramSegment {
  id: string;
  name: string;
  duration: number;
  temperature?: number;
  mode?: string;
  type: 'hot' | 'cold' | 'pressure';
}

const programSegments: ProgramSegment[] = [
  {
    id: '1',
    name: '热敷预热 (Warm Up)',
    duration: 5,
    temperature: 40,
    type: 'hot',
  },
  {
    id: '2',
    name: '深层冷疗 (Deep Cool)',
    duration: 15,
    temperature: 10,
    type: 'cold',
  },
  {
    id: '3',
    name: '气压排酸 (Flush)',
    duration: 5,
    mode: 'Wave Mode',
    type: 'pressure',
  },
];

const getSegmentColor = (type: string) => {
  switch (type) {
    case 'hot':
      return 'bg-orange-500';
    case 'cold':
      return 'bg-blue-500';
    case 'pressure':
      return 'bg-slate-500';
    default:
      return 'bg-gray-500';
  }
};

export default function ProgramDetailScreen({ onNavigate, program, onStartProgram, isVisitorMode = false }: ProgramDetailScreenProps) {
  const [showConversionModal, setShowConversionModal] = useState(false);

  const handleStartProgram = () => {
    if (!program) return;
    
    if (isVisitorMode) {
      setShowConversionModal(true);
      return;
    }
    
    // Calculate total duration from segments
    const totalDuration = programSegments.reduce((sum, seg) => sum + seg.duration, 0);
    
    // Convert segments to the format expected by session state
    const sessionSegments = programSegments.map(seg => ({
      id: seg.id,
      name: seg.name,
      duration: seg.duration,
      temperature: seg.temperature,
      compressionLevel: 2, // Default compression level
      compressionMode: 'wave' as const,
      type: seg.type,
    }));
    
    onStartProgram('PROGRAM', {
      programId: program.id,
      programName: program.name,
      duration: totalDuration,
      segments: sessionSegments,
    });
    
    onNavigate('main-app');
  };

  const handlePairDevice = () => {
    setShowConversionModal(false);
    onNavigate('pairing');
  };

  return (
    <div className="min-h-screen bg-gradient-1 text-foreground pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => onNavigate('main-app')}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Program Detail</h1>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <Heart className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative h-64 bg-gradient-to-br from-blue-500 via-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-8 h-8" strokeWidth={2} />
            </div>
            <p className="text-sm font-medium opacity-90">Recovery Program</p>
          </div>
        </div>
      </div>

      {/* Program Info Card (Overlapping Hero) */}
      <div className="max-w-md mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Contrast Recovery (冷热交替)
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            经典的冷热交替疗法，通过血管的收缩与扩张（泵效应）加速代谢废物排出。适合高强度训练后。
          </p>
        </div>
      </div>

      {/* Sequence Flow Timeline */}
      <div className="max-w-md mx-auto px-4 mt-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">SEQUENCE FLOW</h3>

        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Timeline Items */}
          <div className="space-y-4">
            {programSegments.map((segment, index) => (
              <div key={segment.id} className="relative flex items-start gap-4">
                {/* Timeline Dot */}
                <div className={`relative z-10 w-4 h-4 rounded-full ${getSegmentColor(segment.type)} flex-shrink-0 mt-1`}></div>

                {/* Segment Card */}
                <div className="flex-1 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {segment.name}
                    </h4>
                    <span className="text-sm font-medium text-primary">
                      {segment.duration} min
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {segment.temperature && `${segment.temperature}°C`}
                    {segment.mode && `• ${segment.mode}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Start Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto p-4">
          <button 
            onClick={handleStartProgram}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
          >
            {isVisitorMode ? (
              <>
                <Lock className="w-5 h-5" strokeWidth={2} />
                Start (Requires Device)
              </>
            ) : (
              <>
                <Play className="w-5 h-5" strokeWidth={2} fill="currentColor" />
                Start Program
              </>
            )}
          </button>
        </div>
      </div>

      {/* Conversion Modal */}
      <ConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        onPairDevice={handlePairDevice}
      />
    </div>
  );
}
