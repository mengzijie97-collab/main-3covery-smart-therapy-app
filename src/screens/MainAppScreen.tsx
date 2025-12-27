import { useState, useEffect } from 'react';
import { Home, BarChart3, BookOpen, User, Settings, Droplet, Thermometer, Wind, Clock, Play, Zap, Activity, Shirt, Square, Link2, Signal, Plus, Heart, Trash2, Pause, X, CheckCircle2, ChevronRight, Shield, ArrowLeft, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Program, SessionState, SessionRecord, ProgramSegment } from '../App';
import LearnContent from '../components/LearnContent';
import GlobalAICopilot from '../components/GlobalAICopilot';
import ConversionModal from '../components/ConversionModal';

interface MainAppScreenProps {
  onNavigate: (screen: 'login' | 'pairing' | 'scanning' | 'device-list' | 'connected' | 'main-app' | 'program-detail' | 'create-routine', program?: Program) => void;
  officialPrograms: Program[];
  customPrograms: Program[];
  onDeleteCustomProgram: (id: string) => void;
  onCloneOfficialProgram: (program: Program) => void;
  sessionState: SessionState;
  onStartSession: (type: 'MANUAL' | 'PROGRAM', data: any) => void;
  onStopSession: (isComplete: boolean) => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onUpdateLiveParameter: (param: 'temperature' | 'compressionLevel', value: number) => void;
  onUpdateSessionTime: (newTimeLeft: number) => void;
  history: SessionRecord[];
  completedSession: SessionRecord | null;
  onCloseSummary: () => void;
  isVisitorMode?: boolean;
  onExitVisitorMode?: () => void;
}

type Tab = 'device' | 'data' | 'learn' | 'my';
type ControlMode = 'manual' | 'preset';
type ProgramTab = 'official' | 'custom';
type TreatmentMode = 'cold' | 'hot' | 'compression-only';
type CompressionMode = 'overall' | 'flow' | 'wave' | 'custom';
type WaterLevel = 'low' | 'normal' | 'high';

interface Accessory {
  id: string;
  name: string;
  chamberType: 'multi' | 'single';
  chambers: number;
  icon: 'arm' | 'single-leg' | 'double-legs' | 'vest' | 'lower-back';
}

const connectedAccessories: Accessory[] = [
  { id: '3', name: 'Double Legs', chamberType: 'multi', chambers: 4, icon: 'double-legs' },
];

const getAccessoryIcon = (iconType: string) => {
  switch (iconType) {
    case 'arm':
      return <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />;
    case 'single-leg':
      return <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />;
    case 'double-legs':
      return <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />;
    case 'vest':
      return <Shirt className="w-3.5 h-3.5" strokeWidth={1.5} />;
    case 'lower-back':
      return <Square className="w-3.5 h-3.5" strokeWidth={1.5} />;
    default:
      return <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />;
  }
};

export default function MainAppScreen({ 
  onNavigate, 
  officialPrograms, 
  customPrograms, 
  onDeleteCustomProgram,
  onCloneOfficialProgram,
  sessionState,
  onStartSession,
  onStopSession,
  onPauseSession,
  onResumeSession,
  onUpdateLiveParameter,
  onUpdateSessionTime,
  history,
  completedSession,
  onCloseSummary,
  isVisitorMode = false,
  onExitVisitorMode
}: MainAppScreenProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('device');
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [controlMode, setControlMode] = useState<ControlMode>('manual');
  const [programTab, setProgramTab] = useState<ProgramTab>('official');
  const [treatmentMode, setTreatmentMode] = useState<TreatmentMode>('cold');
  const [compressionMode, setCompressionMode] = useState<CompressionMode>('overall');
  const [temperature, setTemperature] = useState(10);
  const [compressionLevel, setCompressionLevel] = useState(2);
  const [duration, setDuration] = useState(15);
  const [waterLevel] = useState<WaterLevel>('normal');
  const [currentTemp] = useState(22);
  const [manualThermalMode, setManualThermalMode] = useState<'cold' | 'heat' | 'off'>('cold');
  const [subPage, setSubPage] = useState<'main' | 'account' | 'devices' | 'preferences' | 'support' | 'feedback' | 'privacy'>('main');
  const [userName, setUserName] = useState('John Doe');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);

  const hasMultiChamber = connectedAccessories.some(acc => acc.chamberType === 'multi');

  const getTempRange = () => {
    if (treatmentMode === 'cold') {
      return { min: 5, max: 15 };
    }
    return { min: 35, max: 42 };
  };

  const getMaxDuration = () => {
    switch (treatmentMode) {
      case 'cold': return 20;
      case 'hot': return 30;
      case 'compression-only': return 60;
      default: return 60;
    }
  };

  const showTemperature = treatmentMode !== 'compression-only';
  const showCompression = true;

  const getWaterLevelColor = () => {
    switch (waterLevel) {
      case 'low': return 'text-warning';
      case 'high': return 'text-warning';
      default: return 'text-success';
    }
  };

  const getWaterLevelText = () => {
    switch (waterLevel) {
      case 'low': return 'LOW';
      case 'high': return 'HIGH';
      default: return 'OK';
    }
  };

  const getCompressionLevelLabel = (level: number) => {
    switch (level) {
      case 0: return 'None';
      case 1: return 'Low';
      case 2: return 'Mid';
      case 3: return 'High';
      case 4: return 'Max';
      default: return '';
    }
  };

  const getCompressionLevelColor = (level: number) => {
    switch (level) {
      case 0: return { border: 'border-gray-300', bg: 'bg-gray-50', text: 'text-gray-600' };
      case 1: return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700' };
      case 2: return { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' };
      case 3: return { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' };
      case 4: return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700' };
      default: return { border: 'border-gray-200', bg: 'bg-white', text: 'text-gray-400' };
    }
  };

  const getCompressionLevelTextColor = () => {
    switch (compressionLevel) {
      case 0: return 'text-gray-600';
      case 1: return 'text-green-700';
      case 2: return 'text-blue-700';
      case 3: return 'text-orange-700';
      case 4: return 'text-red-700';
      default: return 'text-gray-600';
    }
  };

  const handleFavoriteProgram = (program: Program) => {
    onCloneOfficialProgram(program);
    toast({
      title: "Saved to My Routines",
      description: `"${program.name}" has been added to your custom routines.`,
      duration: 3000,
    });
    setProgramTab('custom');
  };

  const handleStartManualSession = () => {
    if (isVisitorMode) {
      setShowConversionModal(true);
      return;
    }
    onStartSession('MANUAL', {
      duration,
      temperature: showTemperature ? temperature : undefined,
      compressionLevel,
      compressionMode,
      treatmentMode,
    });
  };

  const handlePairDevice = () => {
    setShowConversionModal(false);
    if (onExitVisitorMode) {
      onExitVisitorMode();
    }
  };

  // Sample data for visitor mode
  const sampleHistory: SessionRecord[] = [
    {
      id: 'sample-1',
      date: new Date(Date.now() - 86400000),
      program: 'Contrast Recovery',
      duration: 25,
      score: 100,
      type: 'program',
    },
    {
      id: 'sample-2',
      date: new Date(Date.now() - 172800000),
      program: 'Deep Cold Therapy',
      duration: 15,
      score: 95,
      type: 'program',
    },
    {
      id: 'sample-3',
      date: new Date(Date.now() - 259200000),
      program: 'Manual Session',
      duration: 20,
      score: 88,
      type: 'manual',
    },
    {
      id: 'sample-4',
      date: new Date(Date.now() - 345600000),
      program: 'Warm Recovery',
      duration: 20,
      score: 92,
      type: 'program',
    },
    {
      id: 'sample-5',
      date: new Date(Date.now() - 432000000),
      program: 'Contrast Recovery',
      duration: 25,
      score: 100,
      type: 'program',
    },
    {
      id: 'sample-6',
      date: new Date(Date.now() - 518400000),
      program: 'Manual Session',
      duration: 18,
      score: 85,
      type: 'manual',
    },
    {
      id: 'sample-7',
      date: new Date(Date.now() - 604800000),
      program: 'Deep Cold Therapy',
      duration: 15,
      score: 98,
      type: 'program',
    },
  ];

  const displayHistory = isVisitorMode ? sampleHistory : history;

  // Timer effect
  useEffect(() => {
    if (sessionState.status !== 'running') return;

    const interval = setInterval(() => {
      const newTimeLeft = sessionState.timeLeft - 1;
      
      if (newTimeLeft <= 0) {
        onStopSession(true);
      } else {
        onUpdateSessionTime(newTimeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState.status, sessionState.timeLeft, onStopSession, onUpdateSessionTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Active session view
  if (sessionState.status === 'running' || sessionState.status === 'paused') {
    const currentTemp = sessionState.liveOverrides.temperature ?? sessionState.config.temperature;
    const currentCompression = sessionState.liveOverrides.compressionLevel ?? sessionState.config.compressionLevel;

    const getSegmentColor = (type: string) => {
      switch (type) {
        case 'hot': return 'border-orange-500 bg-orange-50';
        case 'cold': return 'border-blue-500 bg-blue-50';
        case 'pressure': return 'border-slate-500 bg-slate-50';
        default: return 'border-gray-500 bg-gray-50';
      }
    };

    const getSegmentDotColor = (type: string) => {
      switch (type) {
        case 'hot': return 'bg-orange-500';
        case 'cold': return 'bg-blue-500';
        case 'pressure': return 'bg-slate-500';
        default: return 'bg-gray-500';
      }
    };

    const handleThermalModeSwitch = (mode: 'cold' | 'heat' | 'off') => {
      setManualThermalMode(mode);
      if (mode === 'cold') {
        onUpdateLiveParameter('temperature', 10);
      } else if (mode === 'heat') {
        onUpdateLiveParameter('temperature', 40);
      }
    };

    const getTempRangeForMode = () => {
      if (manualThermalMode === 'cold') {
        return { min: 5, max: 15 };
      } else if (manualThermalMode === 'heat') {
        return { min: 35, max: 42 };
      }
      return { min: 5, max: 42 };
    };

    return (
      <div className="min-h-screen bg-white text-slate-900 flex flex-col">
        {/* Compact Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{sessionState.mode} Session</p>
              <h1 className="text-base font-semibold text-slate-900 truncate">{sessionState.config.programName}</h1>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatTime(sessionState.timeLeft)}
              </div>
              <p className="text-xs text-gray-500">Time Left</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto px-4 py-4 space-y-4">
            {/* Program Timeline - Horizontal Scrollable */}
            {sessionState.mode === 'PROGRAM' && sessionState.config.segments && (
              <div>
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Program Timeline</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {sessionState.config.segments.map((segment, index) => {
                    const isActive = index === sessionState.currentSegmentIndex;
                    const isPast = index < (sessionState.currentSegmentIndex || 0);
                    
                    return (
                      <div
                        key={segment.id}
                        className={`flex-shrink-0 rounded-lg border-2 p-3 transition-all ${
                          isActive
                            ? `${getSegmentColor(segment.type)} shadow-md`
                            : isPast
                            ? 'border-gray-200 bg-gray-50 opacity-50'
                            : 'border-gray-200 bg-white opacity-70'
                        } ${isActive ? 'w-48' : 'w-32'}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${getSegmentDotColor(segment.type)} ${isActive ? 'animate-pulse' : ''}`}></div>
                          <span className="text-xs font-medium text-gray-600">Step {index + 1}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 mb-1 truncate">{segment.name}</h4>
                        {isActive && (
                          <div className="text-xs text-gray-600 space-y-0.5">
                            <div>{segment.duration} min</div>
                            {segment.temperature && <div>{segment.temperature}°C</div>}
                            {segment.compressionLevel !== undefined && <div>Level {segment.compressionLevel}</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Manual Mode: Thermal Mode Switcher */}
            {sessionState.mode === 'MANUAL' && (
              <div>
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Therapy Mode</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleThermalModeSwitch('cold')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      manualThermalMode === 'cold'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Thermometer className="w-5 h-5 text-blue-500 mx-auto mb-1" strokeWidth={1.5} />
                    <div className="text-xs font-semibold text-gray-900">Cold</div>
                  </button>

                  <button
                    onClick={() => handleThermalModeSwitch('heat')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      manualThermalMode === 'heat'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1" strokeWidth={1.5} />
                    <div className="text-xs font-semibold text-gray-900">Heat</div>
                  </button>

                  <button
                    onClick={() => handleThermalModeSwitch('off')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      manualThermalMode === 'off'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <Wind className="w-5 h-5 text-primary mx-auto mb-1" strokeWidth={1.5} />
                    <div className="text-xs font-semibold text-gray-900">Press</div>
                  </button>
                </div>
              </div>
            )}

            {/* Unified Live Adjust Controls */}
            <div>
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Live Adjust</h3>
              <div className="grid grid-cols-2 gap-3">
                {/* Left Card: Thermal Control */}
                {(sessionState.mode === 'PROGRAM' || manualThermalMode !== 'off') && currentTemp !== undefined && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Thermometer 
                        className={`w-4 h-4 ${
                          sessionState.mode === 'MANUAL' 
                            ? (manualThermalMode === 'cold' ? 'text-blue-500' : 'text-orange-500')
                            : 'text-blue-500'
                        }`} 
                        strokeWidth={1.5} 
                      />
                      <span className="text-xs font-semibold text-gray-700">Temperature</span>
                    </div>
                    <div className={`text-3xl font-bold mb-4 ${
                      sessionState.mode === 'MANUAL'
                        ? (manualThermalMode === 'cold' ? 'text-blue-500' : 'text-orange-500')
                        : 'text-blue-500'
                    }`}>
                      {currentTemp}°C
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const range = getTempRangeForMode();
                          if (currentTemp > range.min) {
                            onUpdateLiveParameter('temperature', currentTemp - 1);
                          }
                        }}
                        className="flex-1 h-11 bg-white hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors text-slate-900 font-bold text-xl border border-gray-200 shadow-sm"
                      >
                        −
                      </button>
                      <button
                        onClick={() => {
                          const range = getTempRangeForMode();
                          if (currentTemp < range.max) {
                            onUpdateLiveParameter('temperature', currentTemp + 1);
                          }
                        }}
                        className="flex-1 h-11 bg-white hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors text-slate-900 font-bold text-xl border border-gray-200 shadow-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Right Card: Compression Control */}
                {currentCompression !== undefined && (
                  <div className="bg-slate-50 rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Wind className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      <span className="text-xs font-semibold text-gray-700">Pressure</span>
                    </div>
                    <div className="text-3xl font-bold text-primary mb-4">
                      {currentCompression === 0 ? 'Off' : `Level ${currentCompression}`}
                    </div>
                    <div className={`grid ${sessionState.mode === 'MANUAL' ? 'grid-cols-5' : 'grid-cols-4'} gap-1`}>
                      {sessionState.mode === 'MANUAL' && (
                        <button
                          onClick={() => onUpdateLiveParameter('compressionLevel', 0)}
                          className={`h-11 rounded border-2 transition-all text-xs font-bold ${
                            currentCompression === 0
                              ? 'border-gray-400 bg-gray-400 text-white'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          Off
                        </button>
                      )}
                      {[1, 2, 3, 4].map((level) => (
                        <button
                          key={level}
                          onClick={() => onUpdateLiveParameter('compressionLevel', level)}
                          className={`h-11 rounded border-2 transition-all text-xs font-bold ${
                            currentCompression === level
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
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions - Side by Side */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
            {sessionState.status === 'running' ? (
              <button
                onClick={onPauseSession}
                className="bg-gray-100 hover:bg-gray-200 text-slate-900 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-gray-300"
              >
                <Pause className="w-4 h-4" strokeWidth={2} />
                Pause
              </button>
            ) : (
              <button
                onClick={onResumeSession}
                className="bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" strokeWidth={2} />
                Resume
              </button>
            )}
            <button
              onClick={() => onStopSession(false)}
              className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold transition-all"
            >
              Stop
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Session summary
  if (completedSession) {
    return (
      <div className="min-h-screen bg-gradient-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Session Complete!</h2>
            <p className="text-sm text-gray-600">Great work on your recovery session</p>
          </div>

          <div className="space-y-2.5">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-0.5">Program</div>
              <div className="text-base font-semibold text-gray-900">{completedSession.program}</div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-0.5">Duration</div>
                <div className="text-xl font-bold text-primary">{completedSession.duration}m</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-0.5">Score</div>
                <div className="text-xl font-bold text-green-600">{completedSession.score}%</div>
              </div>
            </div>

            {completedSession.config && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-600 mb-1.5">Session Details</div>
                <div className="space-y-1 text-sm">
                  {completedSession.config.temperature && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperature:</span>
                      <span className="font-medium text-gray-900">{completedSession.config.temperature}°C</span>
                    </div>
                  )}
                  {completedSession.config.compressionLevel !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Compression:</span>
                      <span className="font-medium text-gray-900">Level {completedSession.config.compressionLevel}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onCloseSummary}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 rounded-lg font-semibold transition-all text-sm"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Main app view
  return (
    <div className="min-h-screen bg-gradient-1 text-foreground pb-20">
      {/* Visitor Welcome Banner */}
      {isVisitorMode && activeTab === 'device' && (
        <div className="bg-gradient-to-r from-primary to-secondary text-white">
          <div className="max-w-md mx-auto p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-2xl">👀</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">Viewing Demo Mode</p>
                  <p className="text-xs opacity-90">Pair a device to unlock full control</p>
                </div>
              </div>
              <button
                onClick={() => setShowConversionModal(true)}
                className="px-4 py-2 bg-white text-primary rounded-lg text-sm font-semibold hover:bg-white/90 transition-all shadow-md flex-shrink-0"
              >
                Pair Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Status Strip - Only show on Device tab and NOT in visitor mode */}
      {activeTab === 'device' && !isVisitorMode && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-md mx-auto p-3">
          {/* Device Info Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img 
                src="https://c.animaapp.com/mjn3exopQqjBGG/img/20250806-1773.png" 
                alt="3Covery Device"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h2 className="text-xs font-medium text-gray-900">3Covery SN001234</h2>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-success">Connected</span>
                </div>
              </div>
            </div>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-gray-600" strokeWidth={1.5} />
            </button>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Water Level */}
            <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
              <div className="flex items-center gap-1 mb-0.5">
                <Droplet className={`w-3 h-3 ${getWaterLevelColor()}`} strokeWidth={1.5} />
                <span className="text-gray-600 font-medium">Water</span>
              </div>
              <div className={`font-semibold ${getWaterLevelColor()}`}>
                {getWaterLevelText()}
              </div>
            </div>

            {/* Current Temperature */}
            <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
              <div className="flex items-center gap-1 mb-0.5">
                <Thermometer className="w-3 h-3 text-primary" strokeWidth={1.5} />
                <span className="text-gray-600 font-medium">Temp</span>
              </div>
              <div className="font-semibold text-gray-900">
                {currentTemp}°C
              </div>
            </div>

            {/* Connected Accessory */}
            <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
              <div className="flex items-center gap-1 mb-0.5">
                <Link2 className={`w-3 h-3 ${connectedAccessories.length > 0 ? 'text-green-500' : 'text-slate-400'}`} strokeWidth={1.5} />
                <span className="text-gray-600 font-medium">Accessory</span>
              </div>
              <div className="flex items-center gap-1">
                {connectedAccessories.length > 0 ? (
                  <>
                    <span className="font-semibold text-gray-900 text-xs">
                      {connectedAccessories[0].name}
                    </span>
                    {connectedAccessories[0].chambers > 1 && (
                      <Signal className="w-3 h-3 text-primary" strokeWidth={1.5} />
                    )}
                  </>
                ) : (
                  <span className="font-semibold text-gray-400 text-xs">--</span>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-3">
        {activeTab === 'device' && (
          <div className="space-y-3">
            {/* Control Mode Toggle */}
            <div className="bg-white rounded-lg p-1 border border-gray-200 flex shadow-sm">
              <button
                onClick={() => setControlMode('preset')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  controlMode === 'preset'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Preset Programs
              </button>
              <button
                onClick={() => setControlMode('manual')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  controlMode === 'manual'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Manual Control
              </button>
            </div>

            {/* Preset Programs */}
            {controlMode === 'preset' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">Recovery Programs</h3>
                  <button
                    onClick={() => onNavigate('create-routine')}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Create Custom Routine"
                  >
                    <Plus className="w-4 h-4 text-primary" strokeWidth={2} />
                  </button>
                </div>

                {/* Tab Switcher */}
                <div className="bg-white rounded-lg p-1 border border-gray-200 flex shadow-sm">
                  <button
                    onClick={() => setProgramTab('official')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      programTab === 'official'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Official
                  </button>
                  <button
                    onClick={() => setProgramTab('custom')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                      programTab === 'custom'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    My Routines
                  </button>
                </div>

                {/* Official Programs List */}
                {programTab === 'official' && (
                  <div className="space-y-2">
                    {officialPrograms.map((program) => (
                      <div
                        key={program.id}
                        className="w-full bg-white rounded-lg p-3 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => onNavigate('program-detail', program)}
                            className="flex-1 text-left"
                          >
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                              {program.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {program.duration} min • {program.description}
                            </p>
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleFavoriteProgram(program)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Save to My Routines"
                            >
                              <Heart className="w-4 h-4 text-gray-400 hover:text-red-500 hover:fill-red-500 transition-colors" strokeWidth={1.5} />
                            </button>
                            <button
                              onClick={() => onNavigate('program-detail', program)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Play className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom Programs List */}
                {programTab === 'custom' && (
                  <div className="space-y-2">
                    {customPrograms.length === 0 ? (
                      <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          No custom routines yet
                        </h4>
                        <p className="text-xs text-gray-500 mb-4">
                          Create your first personalized recovery routine
                        </p>
                        <button
                          onClick={() => onNavigate('create-routine')}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          Create First Routine
                        </button>
                      </div>
                    ) : (
                      customPrograms.map((program) => (
                        <div
                          key={program.id}
                          className="w-full bg-white rounded-lg p-3 border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => onNavigate('program-detail', program)}
                              className="flex-1 text-left"
                            >
                              <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
                                {program.name}
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {program.duration} min • {program.description}
                              </p>
                            </button>
                            <div className="flex items-center gap-1">
                            <button
                              onClick={() => onDeleteCustomProgram(program.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Routine"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" strokeWidth={1.5} />
                            </button>
                              <button
                                onClick={() => onNavigate('program-detail', program)}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Play className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Manual Control */}
            {controlMode === 'manual' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">Manual Control</h3>
                  {isVisitorMode && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full">
                      <Lock className="w-3 h-3 text-gray-500" strokeWidth={2} />
                      <span className="text-xs font-medium text-gray-600">Demo</span>
                    </div>
                  )}
                </div>
                
                {/* Treatment Mode Selection - NO LABEL */}
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setTreatmentMode('cold');
                        setTemperature(10);
                        setDuration(Math.min(duration, 20));
                      }}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        treatmentMode === 'cold'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Thermometer className="w-4 h-4 text-blue-500 mx-auto mb-0.5" strokeWidth={1.5} />
                      <div className="text-xs font-medium text-gray-900">Cold</div>
                    </button>

                    <button
                      onClick={() => {
                        setTreatmentMode('hot');
                        setTemperature(40);
                        setDuration(Math.min(duration, 30));
                      }}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        treatmentMode === 'hot'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-0.5" strokeWidth={1.5} />
                      <div className="text-xs font-medium text-gray-900">Hot</div>
                    </button>

                    <button
                      onClick={() => {
                        setTreatmentMode('compression-only');
                        setDuration(Math.min(duration, 60));
                      }}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        treatmentMode === 'compression-only'
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Wind className="w-4 h-4 text-primary mx-auto mb-0.5" strokeWidth={1.5} />
                      <div className="text-xs font-medium text-gray-900">Compression</div>
                    </button>
                  </div>
                </div>

                {/* Duration Control */}
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      <span className="text-xs font-medium text-gray-700">Duration</span>
                    </div>
                    <span className="text-base font-semibold text-primary">{duration} min</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max={getMaxDuration()}
                    step="5"
                    value={Math.min(duration, getMaxDuration())}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>5 min</span>
                    <span>{getMaxDuration()} min</span>
                  </div>
                </div>

                {/* Temperature Control */}
                {showTemperature && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Thermometer className={`w-4 h-4 ${treatmentMode === 'cold' ? 'text-blue-500' : 'text-orange-500'}`} strokeWidth={1.5} />
                        <span className="text-xs font-medium text-gray-700">Temperature</span>
                      </div>
                      <span className={`text-base font-semibold ${treatmentMode === 'cold' ? 'text-blue-500' : 'text-orange-500'}`}>
                        {temperature}°C
                      </span>
                    </div>
                    <input
                      type="range"
                      min={getTempRange().min}
                      max={getTempRange().max}
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className={`w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer ${
                        treatmentMode === 'cold' ? 'accent-blue-500' : 'accent-orange-500'
                      }`}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{getTempRange().min}°C</span>
                      <span>{getTempRange().max}°C</span>
                    </div>
                  </div>
                )}

                {/* Compression Controls */}
                {showCompression && (
                  <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Wind className="w-4 h-4 text-primary" strokeWidth={1.5} />
                      <span className="text-xs font-medium text-gray-700">Compression</span>
                    </div>

                    {/* Compression Mode with Visual Grouping */}
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1.5">Mode</div>
                      <div className="flex items-center gap-2">
                        {/* Static Mode - Overall */}
                        <button
                          onClick={() => setCompressionMode('overall')}
                          className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all ${
                            compressionMode === 'overall'
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Overall
                        </button>

                        {/* Vertical Divider */}
                        <div className="w-px h-6 bg-gray-300"></div>

                        {/* Dynamic Gradient Modes */}
                        <div className="flex-[2] grid grid-cols-3 gap-1.5">
                          <button
                            onClick={() => setCompressionMode('flow')}
                            className={`py-1.5 px-2 rounded text-xs font-medium transition-all ${
                              compressionMode === 'flow'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Flow
                          </button>
                          <button
                            onClick={() => setCompressionMode('wave')}
                            className={`py-1.5 px-2 rounded text-xs font-medium transition-all ${
                              compressionMode === 'wave'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Wave
                          </button>
                          <button
                            onClick={() => setCompressionMode('custom')}
                            className={`py-1.5 px-2 rounded text-xs font-medium transition-all ${
                              compressionMode === 'custom'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Custom
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Compression Level (0-4) with Dynamic Label Color */}
                    <div>
                      <div className={`text-xs mb-1.5 font-medium ${getCompressionLevelTextColor()}`}>
                        Level: {getCompressionLevelLabel(compressionLevel)}
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[0, 1, 2, 3, 4].map((level) => {
                          const colors = getCompressionLevelColor(level);
                          return (
                            <button
                              key={level}
                              onClick={() => setCompressionLevel(level)}
                              className={`py-2 rounded border-2 transition-all text-xs font-semibold ${
                                compressionLevel === level
                                  ? `${colors.border} ${colors.bg} ${colors.text}`
                                  : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                              }`}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Start Button */}
                <button 
                  onClick={handleStartManualSession}
                  className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-md ${
                    isVisitorMode ? 'relative' : ''
                  }`}
                >
                  {isVisitorMode && (
                    <Lock className="w-4 h-4" strokeWidth={2} />
                  )}
                  {!isVisitorMode && <Play className="w-4 h-4" strokeWidth={2} />}
                  {isVisitorMode ? 'Start (Requires Device)' : 'Start Treatment'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Session History</h2>
                <p className="text-sm text-gray-600 mt-1">Your recovery journey</p>
              </div>
              {isVisitorMode && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
                  <span className="text-xs font-semibold text-primary">📊 Sample Data</span>
                </div>
              )}
            </div>

            {isVisitorMode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Demo Mode:</strong> Showing sample data. Connect your device to track your actual recovery stats.
                </p>
              </div>
            )}

            {displayHistory.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions yet</h3>
                <p className="text-gray-500">Start your first recovery session</p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayHistory.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${record.type === 'program' ? 'bg-primary' : 'bg-green-500'}`}></div>
                        <h4 className="text-sm font-semibold text-gray-900">{record.program}</h4>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                        <span className="text-gray-600">{record.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" strokeWidth={1.5} />
                        <span className="text-gray-600">{record.score}% complete</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'learn' && (
          <LearnContent onNavigate={onNavigate} />
        )}

        {activeTab === 'my' && (
          <div className="space-y-4">
            {/* Compact Header Section */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-bold">★</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-lg font-bold text-gray-900">John Doe</h2>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 rounded-full border border-yellow-200">
                      <span className="text-yellow-600 text-xs">★</span>
                      <span className="text-xs font-semibold text-yellow-700">Pro</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">ID: USER-2024-001</p>
                </div>

                {/* Stats Pill */}
                <div className="flex-shrink-0 px-3 py-1.5 bg-primary/5 rounded-full">
                  <div className="text-xs font-semibold text-primary">12 Sessions</div>
                </div>
              </div>
            </div>

            {/* Account Group */}
            {subPage === 'main' && (
              <>
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Account</h3>
                  </div>
                  
                  <button 
                    onClick={() => setSubPage('account')}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Account Details</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  </button>

                  <button 
                    onClick={() => setSubPage('devices')}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Link2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">My Devices</div>
                        <div className="text-xs text-gray-500">1 device connected</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  </button>

                  <button 
                    onClick={() => setSubPage('preferences')}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">App Preferences</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Support Group */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Support</h3>
                  </div>
                  
                  <button 
                    onClick={() => setSubPage('support')}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-green-600" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Help & Support</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  </button>

                  <button 
                    onClick={() => setSubPage('feedback')}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Send Feedback</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  </button>

                  <button 
                    onClick={() => setSubPage('privacy')}
                    className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-purple-600" strokeWidth={1.5} />
                      </div>
                      <span className="text-sm font-medium text-gray-900">Privacy & Data</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Logout Button */}
                <button className="w-full bg-red-50 hover:bg-red-100 rounded-3xl py-4 transition-colors border border-red-100">
                  <span className="text-sm font-semibold text-red-500">Log Out</span>
                </button>

                {/* Version Info */}
                <div className="text-center py-2">
                  <p className="text-xs text-gray-400 font-mono">v2.1.0 Build 452</p>
                </div>
              </>
            )}

            {/* Sub-pages would go here - keeping them as is */}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around py-2">
          <button
            onClick={() => setActiveTab('device')}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${
              activeTab === 'device' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Home className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs font-medium">Device</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${
              activeTab === 'data' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BarChart3 className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs font-medium">Data</span>
          </button>

          <button
            onClick={() => setActiveTab('learn')}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${
              activeTab === 'learn' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs font-medium">Learn</span>
          </button>

          <button
            onClick={() => setActiveTab('my')}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors ${
              activeTab === 'my' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-xs font-medium">My</span>
          </button>
        </div>
      </nav>

      {/* Conversion Modal */}
      <ConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        onPairDevice={handlePairDevice}
      />

      {/* Global AI Copilot */}
      <GlobalAICopilot 
        currentView={
          sessionState.status === 'running' || sessionState.status === 'paused' 
            ? 'immersive_session' 
            : activeTab === 'device' 
              ? (controlMode === 'manual' ? 'manual' : 'preset')
              : activeTab
        }
        contextData={{
          activeTab,
          controlMode,
          treatmentMode,
          temperature,
          compressionLevel,
          duration,
          waterLevel,
          currentTemp,
          sessionState,
          selectedProgram: null,
          isVisitorMode,
        }}
      />
    </div>
  );
}
