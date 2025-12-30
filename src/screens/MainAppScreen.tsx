import { useState, useEffect } from 'react';
import { Home, BarChart3, BookOpen, User, Settings, Droplet, Thermometer, Wind, Clock, Play, Zap, Activity, Shirt, Square, Link2, Signal, Plus, Heart, Trash2, Pause, X, CheckCircle2, ChevronRight, Shield, ArrowLeft, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Program, SessionState, SessionRecord, ProgramSegment } from '../App';
import LearnContent from '../components/LearnContent';
import GlobalAICopilot from '../components/GlobalAICopilot';
import ConversionModal from '../components/ConversionModal';
import DataContent from '../components/DataContent';
import SessionDetailModal from '../components/SessionDetailModal';

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
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [selectedSessionRecord, setSelectedSessionRecord] = useState<SessionRecord | null>(null);
  const [liveAdjustExpanded, setLiveAdjustExpanded] = useState(true);

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
    // Get current segment for program mode
    const currentSegment = sessionState.mode === 'PROGRAM' && sessionState.config.segments && sessionState.currentSegmentIndex !== undefined
      ? sessionState.config.segments[sessionState.currentSegmentIndex]
      : null;

    // Determine current mode based on session type
    const currentMode = sessionState.mode === 'MANUAL' 
      ? manualThermalMode 
      : (currentSegment?.type === 'hot' ? 'heat' : currentSegment?.type === 'cold' ? 'cold' : 'off');

    // Get current values with proper fallbacks
    const currentTemp = sessionState.liveOverrides.temperature ?? currentSegment?.temperature ?? sessionState.config.temperature ?? 22;
    const currentCompression = sessionState.liveOverrides.compressionLevel ?? currentSegment?.compressionLevel ?? sessionState.config.compressionLevel ?? 0;
    const currentCompressionMode = sessionState.config.compressionMode ?? currentSegment?.compressionMode ?? 'wave';

    // Determine what controls to show
    const showTempControl = currentMode === 'cold' || currentMode === 'heat';
    const showPressureControl = true; // Always show pressure control

    const getSegmentColor = (type: string) => {
      switch (type) {
        case 'hot': return 'border-orange-500 bg-orange-50';
        case 'cold': return 'border-blue-500 bg-blue-50';
        case 'pressure': return 'border-primary/20 bg-primary/5';
        default: return 'border-gray-500 bg-gray-50';
      }
    };

    const getSegmentIcon = (type: string) => {
      switch (type) {
        case 'hot': return <Thermometer className="w-4 h-4 text-orange-500" strokeWidth={1.5} />;
        case 'cold': return <Thermometer className="w-4 h-4 text-blue-500" strokeWidth={1.5} />;
        case 'pressure': return <Wind className="w-4 h-4 text-primary" strokeWidth={1.5} />;
        default: return <Zap className="w-4 h-4 text-gray-500" strokeWidth={1.5} />;
      }
    };

    const getSegmentTitle = (type: string) => {
      switch (type) {
        case 'hot': return 'Heat';
        case 'cold': return 'Cold';
        case 'pressure': return 'Pressure';
        default: return 'Unknown';
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
      if (currentMode === 'cold') {
        return { min: 5, max: 15 };
      } else if (currentMode === 'heat') {
        return { min: 35, max: 42 };
      }
      return { min: 5, max: 42 };
    };

    return (
      <div className="min-h-screen bg-gradient-1 text-slate-900 flex flex-col">
        {/* Compact Header */}
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 shadow-sm">
          <div className="max-w-md mx-auto">
            {/* Session Info Row */}
            <div className="flex items-center justify-between mb-2">
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

            {/* GLOBAL STATUS BAR - Matches Manual Session exactly */}
            <div className="flex items-center gap-3 text-xs pt-2 border-t border-gray-100">
              {/* Water Level */}
              <div className="flex items-center gap-1">
                <Droplet className={`w-3.5 h-3.5 ${getWaterLevelColor()}`} strokeWidth={1.5} />
                <span className="text-gray-600 font-medium">{getWaterLevelText()}</span>
              </div>

              {/* Divider */}
              <div className="w-px h-3 bg-gray-300"></div>

              {/* Accessory */}
              <div className="flex items-center gap-1">
                {connectedAccessories.length > 0 ? (
                  <>
                    {getAccessoryIcon(connectedAccessories[0].icon)}
                    <span className="text-gray-600 font-medium">{connectedAccessories[0].name}</span>
                  </>
                ) : (
                  <span className="text-gray-400 font-medium">No Accessory</span>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-3 bg-gray-300"></div>

              {/* Current Temperature - Real-time reading */}
              <div className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-blue-500" strokeWidth={1.5} />
                <span className="text-gray-600 font-medium">{currentTemp}°C</span>
              </div>

              {/* Divider */}
              <div className="w-px h-3 bg-gray-300"></div>

              {/* Compression - Real-time reading in mmHg */}
              <div className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                <span className="text-gray-600 font-medium">{currentCompression * 25} mmHg</span>
              </div>
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
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {sessionState.config.segments.map((segment, index) => {
                    const isActive = index === sessionState.currentSegmentIndex;
                    const isPast = index < (sessionState.currentSegmentIndex || 0);
                    
                    return (
                      <div
                        key={segment.id}
                        className={`flex-shrink-0 rounded-xl border-2 p-3 transition-all shadow-sm w-40 ${
                          isActive
                            ? `${getSegmentColor(segment.type)} shadow-md border-2`
                            : isPast
                            ? 'border-gray-200 bg-gray-50 opacity-50'
                            : 'border-gray-200 bg-white opacity-70'
                        }`}
                      >
                        {/* Header: Step X : Mode */}
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                          {getSegmentIcon(segment.type)}
                          <span className="text-xs font-semibold text-gray-900">
                            Step {index + 1} : {getSegmentTitle(segment.type)}
                          </span>
                        </div>

                        {/* Body: Settings Grid */}
                        <div className="space-y-1.5 text-xs">
                          {/* Duration */}
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-semibold text-gray-900">{segment.duration} min</span>
                          </div>

                          {/* Temperature (if applicable) */}
                          {segment.temperature !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Target Temp</span>
                              <span className="font-semibold text-gray-900">{segment.temperature}°C</span>
                            </div>
                          )}

                          {/* Pressure Level (if applicable) */}
                          {segment.compressionLevel !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Pressure</span>
                              <span className="font-semibold text-gray-900">Level {segment.compressionLevel}</span>
                            </div>
                          )}
                        </div>

                        {/* Active Indicator */}
                        {isActive && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                segment.type === 'hot' ? 'bg-orange-500' : 
                                segment.type === 'cold' ? 'bg-blue-500' : 
                                'bg-primary'
                              } animate-pulse`}></div>
                              <span className="text-xs font-medium text-gray-700">Active</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LIVE ADJUST PANEL - Refactored with Collapse */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Live Adjust</h3>
                <button
                  onClick={() => setLiveAdjustExpanded(!liveAdjustExpanded)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {liveAdjustExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" strokeWidth={2} />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" strokeWidth={2} />
                  )}
                </button>
              </div>

              {liveAdjustExpanded && (
                <div className="space-y-3">
                  {/* Scenario A: Manual Session - Show Mode Switcher */}
                  {sessionState.mode === 'MANUAL' && (
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleThermalModeSwitch('cold')}
                        className={`p-3 rounded-xl border-2 transition-all shadow-sm ${
                          manualThermalMode === 'cold'
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <Thermometer className="w-5 h-5 text-blue-500 mx-auto mb-1" strokeWidth={1.5} />
                        <div className="text-xs font-semibold text-gray-900">Cold</div>
                      </button>

                      <button
                        onClick={() => handleThermalModeSwitch('heat')}
                        className={`p-3 rounded-xl border-2 transition-all shadow-sm ${
                          manualThermalMode === 'heat'
                            ? 'border-orange-500 bg-orange-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1" strokeWidth={1.5} />
                        <div className="text-xs font-semibold text-gray-900">Heat</div>
                      </button>

                      <button
                        onClick={() => handleThermalModeSwitch('off')}
                        className={`p-3 rounded-xl border-2 transition-all shadow-sm ${
                          manualThermalMode === 'off'
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <Wind className="w-5 h-5 text-primary mx-auto mb-1" strokeWidth={1.5} />
                        <div className="text-xs font-semibold text-gray-900">Press</div>
                      </button>
                    </div>
                  )}

                  {/* Control Cards - Context Aware */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Temperature Card - Show if mode is cold/heat OR force render if undefined */}
                    {(showTempControl || currentMode === undefined) && (
                      <div className="bg-card-subtle rounded-xl p-4 border border-gray-200/50 shadow-lg">
                        <div className="flex items-center gap-1.5 mb-3">
                          <Thermometer 
                            className={`w-4 h-4 ${
                              currentMode === 'cold' ? 'text-blue-500' : 
                              currentMode === 'heat' ? 'text-orange-500' : 
                              'text-gray-500'
                            }`} 
                            strokeWidth={1.5} 
                          />
                          <span className="text-xs font-semibold text-gray-700">Temperature</span>
                        </div>
                        <div className={`text-3xl font-bold mb-4 ${
                          currentMode === 'cold' ? 'text-blue-500' : 
                          currentMode === 'heat' ? 'text-orange-500' : 
                          'text-gray-500'
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
                            className="flex-1 h-11 bg-button-secondary hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors text-slate-900 font-bold text-xl border border-gray-200/50 shadow-sm hover:shadow-md"
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
                            className="flex-1 h-11 bg-button-secondary hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors text-slate-900 font-bold text-xl border border-gray-200/50 shadow-sm hover:shadow-md"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pressure Card - Always show OR force render if undefined */}
                    {(showPressureControl || currentMode === undefined) && (
                      <div className="bg-card-subtle rounded-xl p-4 border border-gray-200/50 shadow-lg">
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
                              className={`h-11 rounded-lg border-2 transition-all text-xs font-bold shadow-sm hover:shadow-md ${
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
                              className={`h-11 rounded-lg border-2 transition-all text-xs font-bold shadow-sm hover:shadow-md ${
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
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions - Side by Side */}
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-200/50 p-4 shadow-lg">
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
            {sessionState.status === 'running' ? (
              <button
                onClick={onPauseSession}
                className="bg-button-secondary hover:bg-gray-200 text-slate-900 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-gray-300/50 shadow-md hover:shadow-lg"
              >
                <Pause className="w-4 h-4" strokeWidth={2} />
                Pause
              </button>
            ) : (
              <button
                onClick={onResumeSession}
                className="bg-button-primary hover:opacity-90 text-primary-foreground py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Play className="w-4 h-4" strokeWidth={2} />
                Resume
              </button>
            )}
            <button
              onClick={() => onStopSession(false)}
              className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <X className="w-4 h-4" strokeWidth={2} />
              Stop Therapy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Session Recap (Summary)
  if (completedSession) {
    // Determine phases based on session type
    const getSessionPhases = () => {
      if (completedSession.type === 'program' && sessionState.config.segments) {
        // Program Session: Show original steps
        return sessionState.config.segments.map((segment, index) => ({
          id: segment.id,
          title: `Step ${index + 1}: ${segment.type === 'hot' ? 'Heat' : segment.type === 'cold' ? 'Cold' : 'Pressure'}`,
          icon: segment.type === 'hot' ? 'fire' : segment.type === 'cold' ? 'snowflake' : 'wind',
          color: segment.type === 'hot' ? 'text-orange-500' : segment.type === 'cold' ? 'text-blue-500' : 'text-primary',
          bgColor: segment.type === 'hot' ? 'bg-orange-100' : segment.type === 'cold' ? 'bg-blue-100' : 'bg-primary/10',
          settings: [
            segment.temperature ? `${segment.temperature}°C` : null,
            segment.compressionMode ? segment.compressionMode.charAt(0).toUpperCase() + segment.compressionMode.slice(1) : null,
            segment.compressionLevel !== undefined ? `Level ${segment.compressionLevel}` : null,
          ].filter(Boolean).join(' | '),
          duration: `${segment.duration}:00`,
        }));
      } else {
        // Manual Session: Show continuous mode used
        const phases = [];
        const config = completedSession.config;
        
        if (config?.treatmentMode === 'cold' || config?.treatmentMode === 'hot') {
          phases.push({
            id: 'thermal',
            title: config.treatmentMode === 'cold' ? 'Cold' : 'Heat',
            icon: config.treatmentMode === 'cold' ? 'snowflake' : 'fire',
            color: config.treatmentMode === 'cold' ? 'text-blue-500' : 'text-orange-500',
            bgColor: config.treatmentMode === 'cold' ? 'bg-blue-100' : 'bg-orange-100',
            settings: [
              config.temperature ? `${config.temperature}°C` : null,
              config.compressionMode ? config.compressionMode.charAt(0).toUpperCase() + config.compressionMode.slice(1) : null,
              config.compressionLevel !== undefined ? `Level ${config.compressionLevel}` : null,
            ].filter(Boolean).join(' | '),
            duration: `${completedSession.duration}:00`,
          });
        } else if (config?.treatmentMode === 'compression-only') {
          phases.push({
            id: 'pressure',
            title: 'Pressure',
            icon: 'wind',
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            settings: [
              config.compressionMode ? config.compressionMode.charAt(0).toUpperCase() + config.compressionMode.slice(1) : null,
              config.compressionLevel !== undefined ? `Level ${config.compressionLevel}` : null,
            ].filter(Boolean).join(' | '),
            duration: `${completedSession.duration}:00`,
          });
        }
        
        return phases;
      }
    };

    const phases = getSessionPhases();

    const getPhaseIcon = (iconType: string) => {
      switch (iconType) {
        case 'fire':
          return <Thermometer className="w-4 h-4" strokeWidth={2} />;
        case 'snowflake':
          return <Thermometer className="w-4 h-4" strokeWidth={2} />;
        case 'wind':
          return <Wind className="w-4 h-4" strokeWidth={2} />;
        default:
          return <Zap className="w-4 h-4" strokeWidth={2} />;
      }
    };

    return (
      <div className="min-h-screen bg-gradient-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
          {/* Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Session Complete!</h2>
            <p className="text-sm text-gray-600">Great work on your recovery session</p>
          </div>

          {/* Program Name & Duration */}
          <div className="space-y-2.5">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-0.5">Program</div>
              <div className="text-base font-semibold text-gray-900">{completedSession.program}</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-0.5">Total Duration</div>
              <div className="text-xl font-bold text-primary">{completedSession.duration} min</div>
            </div>
          </div>

          {/* Session Recap - Vertical Timeline */}
          {phases.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Session Recap</div>
              
              <div className="relative">
                {/* Vertical Timeline Line */}
                {phases.length > 1 && (
                  <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-300"></div>
                )}

                {/* Phase Items */}
                <div className="space-y-3">
                  {phases.map((phase, index) => (
                    <div key={phase.id} className="relative flex items-start gap-3">
                      {/* Icon Pillar */}
                      <div className={`relative z-10 w-8 h-8 rounded-full ${phase.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <div className={phase.color}>
                          {getPhaseIcon(phase.icon)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">{phase.title}</h4>
                          <span className="text-sm font-bold text-primary tabular-nums">{phase.duration}</span>
                        </div>
                        {phase.settings && (
                          <p className="text-xs text-gray-600">{phase.settings}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Done Button */}
          <button
            onClick={onCloseSummary}
            className="w-full bg-button-primary hover:opacity-90 text-primary-foreground py-2.5 rounded-lg font-semibold transition-all text-sm shadow-md"
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
        <div className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
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
                className="px-4 py-2 bg-white text-primary rounded-lg text-sm font-semibold hover:bg-white/95 transition-all shadow-lg hover:shadow-xl flex-shrink-0"
              >
                Pair Device
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Status Strip - Only show on Device tab and NOT in visitor mode */}
      {activeTab === 'device' && !isVisitorMode && (
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="max-w-md mx-auto p-3">
          {/* Device Info Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img 
                src="https://c.animaapp.com/mjnxgqk9obaGxq/img/3covery-prozhu-ji-tou-ming-tu_1.png"
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

            {/* Device Status Bar - Horizontal Layout */}
            <div className="flex items-center gap-3 text-xs pt-2 border-t border-gray-100">
              {/* Water Level */}
              <div className="flex items-center gap-1">
                <Droplet className={`w-3.5 h-3.5 ${getWaterLevelColor()}`} strokeWidth={1.5} />
                <span className="text-gray-600 font-medium">{getWaterLevelText()}</span>
              </div>

              {/* Divider */}
              <div className="w-px h-3 bg-gray-300"></div>

              {/* Accessory */}
              <div className="flex items-center gap-1">
                {connectedAccessories.length > 0 ? (
                  <>
                    {getAccessoryIcon(connectedAccessories[0].icon)}
                    <span className="text-gray-600 font-medium">{connectedAccessories[0].name}</span>
                  </>
                ) : (
                  <span className="text-gray-400 font-medium">No Accessory</span>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-3 bg-gray-300"></div>

              {/* Current Temperature */}
              <div className="flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-blue-500" strokeWidth={1.5} />
                <span className="text-gray-600 font-medium">{currentTemp}°C</span>
              </div>

              {/* Divider */}
              <div className="w-px h-3 bg-gray-300"></div>

              {/* Compression Mode & Level */}
              <div className="flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
                <span className="text-gray-600 font-medium">{compressionLevel * 25} mmHg</span>
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
            <div className="bg-white rounded-xl p-1.5 border border-gray-100/50 flex shadow-lg">
              <button
                onClick={() => setControlMode('preset')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  controlMode === 'preset'
                    ? 'bg-button-primary text-primary-foreground shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Program
              </button>
              <button
                onClick={() => setControlMode('manual')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  controlMode === 'manual'
                    ? 'bg-button-primary text-primary-foreground shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Manual Control
              </button>
            </div>

            {/* Preset Programs */}
            {controlMode === 'preset' && (
              <div className="space-y-2">
                {/* Header Row: Tab Switcher + Add Button */}
                <div className="flex items-center gap-2">
                  {/* Tab Switcher */}
                  <div className="flex-1 bg-white rounded-xl p-1.5 border border-gray-100/50 flex shadow-lg">
                  <button
                    onClick={() => setProgramTab('official')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      programTab === 'official'
                        ? 'bg-button-primary text-primary-foreground shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Official
                  </button>
                    <button
                      onClick={() => setProgramTab('custom')}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        programTab === 'custom'
                          ? 'bg-button-primary text-primary-foreground shadow-md'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      My Program
                    </button>
                  </div>

                  {/* Add Button */}
                  <button
                    onClick={() => onNavigate('create-routine')}
                    className="p-2.5 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-primary rounded-xl transition-all shadow-lg hover:shadow-xl"
                    title="Create Custom Routine"
                  >
                    <Plus className="w-5 h-5 text-primary" strokeWidth={2} />
                  </button>
                </div>

                {/* Official Programs List */}
                {programTab === 'official' && (
                  <div className="space-y-2">
                    {officialPrograms.map((program) => (
                      <div
                        key={program.id}
                        className="w-full bg-white rounded-xl p-3 border border-gray-100/50 hover:border-primary/30 hover:shadow-lg transition-all group"
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
                      <div className="bg-white rounded-xl p-8 border border-gray-100/50 shadow-lg text-center">
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
                          className="bg-button-primary hover:opacity-90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                        >
                          Create First Routine
                        </button>
                      </div>
                    ) : (
                      customPrograms.map((program) => (
                        <div
                          key={program.id}
                          className="w-full bg-white rounded-xl p-3 border border-gray-100/50 hover:border-primary/30 hover:shadow-lg transition-all group"
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
                <div className="bg-white rounded-xl p-3 border border-gray-100/50 shadow-lg">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setTreatmentMode('cold');
                        setTemperature(10);
                        setDuration(Math.min(duration, 20));
                      }}
                      className={`p-2 rounded-lg border-2 transition-all shadow-sm ${
                        treatmentMode === 'cold'
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
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
                      className={`p-2 rounded-lg border-2 transition-all shadow-sm ${
                        treatmentMode === 'hot'
                          ? 'border-orange-500 bg-orange-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
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
                      className={`p-2 rounded-lg border-2 transition-all shadow-sm ${
                        treatmentMode === 'compression-only'
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <Wind className="w-4 h-4 text-primary mx-auto mb-0.5" strokeWidth={1.5} />
                      <div className="text-xs font-medium text-gray-900">Compression</div>
                    </button>
                  </div>
                </div>

                {/* Temperature Control - MOVED TO TOP */}
                {showTemperature && (
                  <div className="bg-white rounded-xl p-3 border border-gray-100/50 shadow-lg">
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
                  <div className="bg-white rounded-xl p-3 border border-gray-100/50 shadow-lg">
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
                          className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all shadow-sm ${
                            compressionMode === 'overall'
                              ? 'bg-primary text-white shadow-md'
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
                            className={`py-1.5 px-2 rounded text-xs font-medium transition-all shadow-sm ${
                              compressionMode === 'flow'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Flow
                          </button>
                          <button
                            onClick={() => setCompressionMode('wave')}
                            className={`py-1.5 px-2 rounded text-xs font-medium transition-all shadow-sm ${
                              compressionMode === 'wave'
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Wave
                          </button>
                          <button
                            onClick={() => setCompressionMode('custom')}
                            className={`py-1.5 px-2 rounded text-xs font-medium transition-all shadow-sm ${
                              compressionMode === 'custom'
                                ? 'bg-primary text-white shadow-md'
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
                              className={`py-2 rounded border-2 transition-all text-xs font-semibold shadow-sm hover:shadow-md ${
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

                {/* Duration Control */}
                <div className="bg-white rounded-xl p-3 border border-gray-100/50 shadow-lg">
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

                {/* Add bottom padding to prevent content from being hidden behind fixed button */}
                <div className="h-20"></div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <DataContent 
            displayHistory={displayHistory}
            isVisitorMode={isVisitorMode}
            onViewDetails={(record) => setSelectedSessionRecord(record)}
          />
        )}

        {activeTab === 'learn' && (
          <LearnContent onNavigate={onNavigate} />
        )}

        {activeTab === 'my' && (
          <div className="space-y-4">
            {/* Compact Header Section */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100/50">
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

            {/* Main Menu */}
            {subPage === 'main' && (
              <>
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden">
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
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100/50 overflow-hidden">
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
                <button 
                  onClick={() => onNavigate('login')}
                  className="w-full bg-red-50 hover:bg-red-100 rounded-3xl py-4 transition-colors border border-red-100"
                >
                  <span className="text-sm font-semibold text-red-500">Log Out</span>
                </button>

                {/* Version Info */}
                <div className="text-center py-2">
                  <p className="text-xs text-gray-400 font-mono">v2.1.0 Build 452</p>
                </div>
              </>
            )}

            {/* Account Details Sub-page */}
            {subPage === 'account' && (
              <div className="space-y-4">
                <button
                  onClick={() => setSubPage('main')}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Back</span>
                </button>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Account Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Email</label>
                      <input
                        type="email"
                        value="john.doe@example.com"
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Member Since</label>
                      <input
                        type="text"
                        value="January 2024"
                        disabled
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition-all shadow-md">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* My Devices Sub-page */}
            {subPage === 'devices' && (
              <div className="space-y-4">
                <button
                  onClick={() => setSubPage('main')}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Back</span>
                </button>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">My Devices</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src="https://c.animaapp.com/mjnxgqk9obaGxq/img/3covery-prozhu-ji-tou-ming-tu_1.png"
                          alt="3Covery Device"
                          className="w-12 h-12 object-contain"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900">3Covery Pro</h4>
                          <p className="text-xs text-gray-500 font-mono">SN001234</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                          <span className="text-xs font-medium text-success">Connected</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white rounded-lg p-2">
                          <span className="text-gray-600">Firmware</span>
                          <p className="font-semibold text-gray-900 mt-0.5">v2.1.0</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <span className="text-gray-600">Last Sync</span>
                          <p className="font-semibold text-gray-900 mt-0.5">Just now</p>
                        </div>
                      </div>
                    </div>

                    <button className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-3 rounded-lg font-semibold transition-all">
                      + Add New Device
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* App Preferences Sub-page */}
            {subPage === 'preferences' && (
              <div className="space-y-4">
                <button
                  onClick={() => setSubPage('main')}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Back</span>
                </button>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">App Preferences</h3>
                  
                  <div className="space-y-4">
                    {/* Temperature Unit */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Temperature Unit</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Display preference</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setTemperatureUnit('C')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            temperatureUnit === 'C'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          °C
                        </button>
                        <button
                          onClick={() => setTemperatureUnit('F')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            temperatureUnit === 'F'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          °F
                        </button>
                      </div>
                    </div>

                    {/* Language */}
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Language</h4>
                        <p className="text-xs text-gray-500 mt-0.5">App language</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setLanguage('en')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            language === 'en'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          English
                        </button>
                        <button
                          onClick={() => setLanguage('zh')}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            language === 'zh'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          中文
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help & Support Sub-page */}
            {subPage === 'support' && (
              <div className="space-y-4">
                <button
                  onClick={() => setSubPage('main')}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Back</span>
                </button>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Help & Support</h3>
                  
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <h4 className="text-sm font-semibold text-gray-900">Getting Started Guide</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Learn the basics</p>
                    </button>

                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <h4 className="text-sm font-semibold text-gray-900">FAQs</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Common questions answered</p>
                    </button>

                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <h4 className="text-sm font-semibold text-gray-900">Contact Support</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Get help from our team</p>
                    </button>

                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <h4 className="text-sm font-semibold text-gray-900">Video Tutorials</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Watch how-to videos</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Send Feedback Sub-page */}
            {subPage === 'feedback' && (
              <div className="space-y-4">
                <button
                  onClick={() => setSubPage('main')}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Back</span>
                </button>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Send Feedback</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Feedback Type</label>
                      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option>Bug Report</option>
                        <option>Feature Request</option>
                        <option>General Feedback</option>
                        <option>Compliment</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Your Message</label>
                      <textarea
                        rows={6}
                        placeholder="Tell us what you think..."
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      />
                    </div>

                    <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition-all shadow-md">
                      Submit Feedback
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Data Sub-page */}
            {subPage === 'privacy' && (
              <div className="space-y-4">
                <button
                  onClick={() => setSubPage('main')}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Back</span>
                </button>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Privacy & Data</h3>
                  
                  <div className="space-y-4">
                    <div className="pb-4 border-b border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Data Collection</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        We collect session data to help you track your recovery progress. All data is encrypted and stored securely.
                      </p>
                    </div>

                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <h4 className="text-sm font-semibold text-gray-900">Privacy Policy</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Read our full policy</p>
                    </button>

                    <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                      <h4 className="text-sm font-semibold text-gray-900">Terms of Service</h4>
                      <p className="text-xs text-gray-500 mt-0.5">View terms and conditions</p>
                    </button>


                    <button className="w-full text-left px-4 py-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200">
                      <h4 className="text-sm font-semibold text-red-600">Delete My Account</h4>
                      <p className="text-xs text-red-500 mt-0.5">Permanently remove all data</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Start Button - Only show in Manual Control mode */}
      {activeTab === 'device' && controlMode === 'manual' && (
        <div className="fixed bottom-[72px] left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-2xl z-40">
          <div className="max-w-md mx-auto px-4 py-3">
            <button 
              onClick={handleStartManualSession}
              className={`w-full bg-button-primary hover:opacity-90 text-primary-foreground py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl ${
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
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-2xl z-50">
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

      {/* Session Detail Modal */}
      <SessionDetailModal
        isOpen={!!selectedSessionRecord}
        session={selectedSessionRecord}
        onClose={() => setSelectedSessionRecord(null)}
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
