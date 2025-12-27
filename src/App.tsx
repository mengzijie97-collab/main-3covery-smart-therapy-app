import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginScreen from './screens/LoginScreen';
import DevicePairingScreen from './screens/DevicePairingScreen';
import ScanningScreen from './screens/ScanningScreen';
import DeviceListScreen from './screens/DeviceListScreen';
import ConnectedScreen from './screens/ConnectedScreen';
import MainAppScreen from './screens/MainAppScreen';
import ProgramDetailScreen from './screens/ProgramDetailScreen';
import CreateRoutineScreen from './screens/CreateRoutineScreen';
import ArticleDetailScreen from './screens/ArticleDetailScreen';
import { Toaster } from '@/components/ui/toaster';

type Screen = 'login' | 'pairing' | 'scanning' | 'device-list' | 'connected' | 'main-app' | 'program-detail' | 'create-routine' | 'article-detail';

export interface Program {
  id: string;
  name: string;
  description: string;
  duration: number;
  segments: string;
}

export interface SessionRecord {
  id: string;
  date: Date;
  program: string;
  duration: number;
  score: number;
  type: 'manual' | 'program';
  config?: {
    temperature?: number;
    compressionLevel?: number;
    compressionMode?: string;
    treatmentMode?: string;
  };
}

export interface ProgramSegment {
  id: string;
  name: string;
  duration: number;
  temperature?: number;
  compressionLevel?: number;
  compressionMode?: string;
  type: 'hot' | 'cold' | 'pressure';
}

export interface SessionState {
  status: 'idle' | 'running' | 'paused';
  mode: 'MANUAL' | 'PROGRAM';
  config: {
    programId?: string;
    programName?: string;
    duration: number;
    temperature?: number;
    compressionLevel?: number;
    compressionMode?: string;
    treatmentMode?: string;
    segments?: ProgramSegment[];
  };
  startTime?: Date;
  totalDuration: number;
  timeLeft: number;
  currentSegmentIndex?: number;
  liveOverrides: {
    temperature?: number;
    compressionLevel?: number;
  };
}

// Static official programs (constant, never changes)
const officialPrograms: Program[] = [
  {
    id: 'official-1',
    name: 'Contrast Recovery (冷热交替)',
    description: 'Warm Up → Deep Cool → Flush',
    duration: 25,
    segments: '3 segments',
  },
  {
    id: 'official-2',
    name: 'Deep Cold Therapy',
    description: '10°C Continuous',
    duration: 15,
    segments: '1 segment',
  },
  {
    id: 'official-3',
    name: 'Warm Recovery',
    description: '40°C Gentle Heat',
    duration: 20,
    segments: '1 segment',
  },
];

const initialHistory: SessionRecord[] = [
  {
    id: '1',
    date: new Date(Date.now() - 86400000),
    program: 'Contrast Recovery',
    duration: 25,
    score: 100,
    type: 'program',
  },
  {
    id: '2',
    date: new Date(Date.now() - 172800000),
    program: 'Manual Session',
    duration: 15,
    score: 85,
    type: 'manual',
  },
];

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isVisitorMode, setIsVisitorMode] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [customPrograms, setCustomPrograms] = useState<Program[]>([]);
  const [history, setHistory] = useState<SessionRecord[]>(initialHistory);
  const [sessionState, setSessionState] = useState<SessionState>({
    status: 'idle',
    mode: 'MANUAL',
    config: {
      duration: 15,
    },
    totalDuration: 15,
    timeLeft: 15,
    liveOverrides: {},
  });
  const [completedSession, setCompletedSession] = useState<SessionRecord | null>(null);

  const handleNavigate = (screen: Screen, program?: Program) => {
    setCurrentScreen(screen);
    if (program) {
      setSelectedProgram(program);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnterVisitorMode = () => {
    setIsVisitorMode(true);
    setCurrentScreen('main-app');
  };

  const handleExitVisitorMode = () => {
    setIsVisitorMode(false);
    setCurrentScreen('pairing');
  };

  const handleSaveRoutine = (newProgram: Program) => {
    setCustomPrograms(prev => [...prev, newProgram]);
  };

  const handleDeleteCustomProgram = (id: string) => {
    setCustomPrograms(prev => prev.filter(p => p.id !== id));
  };

  const handleCloneOfficialProgram = (program: Program) => {
    const clonedProgram: Program = {
      ...program,
      id: `copy_${Date.now()}`,
      name: `(Copy) ${program.name}`,
    };
    setCustomPrograms(prev => [...prev, clonedProgram]);
  };

  const handleStartSession = (type: 'MANUAL' | 'PROGRAM', data: any) => {
    const newSessionState: SessionState = {
      status: 'running',
      mode: type,
      config: {
        programId: data.programId,
        programName: data.programName || 'Manual Session',
        duration: data.duration,
        temperature: data.temperature,
        compressionLevel: data.compressionLevel,
        compressionMode: data.compressionMode,
        treatmentMode: data.treatmentMode,
        segments: data.segments,
      },
      startTime: new Date(),
      totalDuration: data.duration,
      timeLeft: data.duration * 60,
      currentSegmentIndex: type === 'PROGRAM' ? 0 : undefined,
      liveOverrides: {},
    };
    setSessionState(newSessionState);
  };

  const handleStopSession = (isComplete: boolean) => {
    const actualDuration = Math.round((sessionState.totalDuration * 60 - sessionState.timeLeft) / 60);
    const completionRate = actualDuration > 0 ? (actualDuration / sessionState.totalDuration) * 100 : 0;
    const score = isComplete ? 100 : Math.round(completionRate);

    const newRecord: SessionRecord = {
      id: `session_${Date.now()}`,
      date: new Date(),
      program: sessionState.config.programName || 'Manual Session',
      duration: actualDuration,
      score: score,
      type: sessionState.mode === 'MANUAL' ? 'manual' : 'program',
      config: {
        temperature: sessionState.liveOverrides.temperature || sessionState.config.temperature,
        compressionLevel: sessionState.liveOverrides.compressionLevel || sessionState.config.compressionLevel,
        compressionMode: sessionState.config.compressionMode,
        treatmentMode: sessionState.config.treatmentMode,
      },
    };

    setHistory(prev => [newRecord, ...prev]);
    setCompletedSession(newRecord);
    setSessionState({
      status: 'idle',
      mode: 'MANUAL',
      config: { duration: 15 },
      totalDuration: 15,
      timeLeft: 15,
      liveOverrides: {},
    });
  };

  const handlePauseSession = () => {
    setSessionState(prev => ({ ...prev, status: 'paused' }));
  };

  const handleResumeSession = () => {
    setSessionState(prev => ({ ...prev, status: 'running' }));
  };

  const handleUpdateLiveParameter = (param: 'temperature' | 'compressionLevel', value: number) => {
    setSessionState(prev => ({
      ...prev,
      liveOverrides: {
        ...prev.liveOverrides,
        [param]: value,
      },
    }));
  };

  const handleUpdateSessionTime = (newTimeLeft: number) => {
    setSessionState(prev => {
      // Check if we've transitioned to a new segment in program mode
      if (prev.mode === 'PROGRAM' && prev.config.segments) {
        const segments = prev.config.segments;
        let elapsedTime = prev.totalDuration * 60 - newTimeLeft;
        let currentSegmentIndex = 0;
        let segmentStartTime = 0;
        
        for (let i = 0; i < segments.length; i++) {
          const segmentDuration = segments[i].duration * 60;
          if (elapsedTime < segmentStartTime + segmentDuration) {
            currentSegmentIndex = i;
            break;
          }
          segmentStartTime += segmentDuration;
        }
        
        // If segment changed, reset live overrides to new segment defaults
        if (currentSegmentIndex !== prev.currentSegmentIndex) {
          const newSegment = segments[currentSegmentIndex];
          return {
            ...prev,
            timeLeft: newTimeLeft,
            currentSegmentIndex,
            liveOverrides: {
              temperature: newSegment.temperature,
              compressionLevel: newSegment.compressionLevel,
            },
          };
        }
      }
      
      return { ...prev, timeLeft: newTimeLeft };
    });
  };

  const handleCloseSummary = () => {
    setCompletedSession(null);
  };

  return (
    <div className="min-h-screen bg-gradient-1 text-foreground">
      <Toaster />
      <AnimatePresence mode="wait">
        {currentScreen === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <LoginScreen onNavigate={handleNavigate} />
          </motion.div>
        )}
        {currentScreen === 'pairing' && (
          <motion.div
            key="pairing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <DevicePairingScreen 
              onNavigate={handleNavigate}
              onEnterVisitorMode={handleEnterVisitorMode}
            />
          </motion.div>
        )}
        {currentScreen === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ScanningScreen onNavigate={handleNavigate} />
          </motion.div>
        )}
        {currentScreen === 'device-list' && (
          <motion.div
            key="device-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <DeviceListScreen onNavigate={handleNavigate} />
          </motion.div>
        )}
        {currentScreen === 'connected' && (
          <motion.div
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ConnectedScreen onNavigate={handleNavigate} />
          </motion.div>
        )}
        {currentScreen === 'main-app' && (
          <motion.div
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <MainAppScreen 
              onNavigate={handleNavigate}
              officialPrograms={officialPrograms}
              customPrograms={customPrograms}
              onDeleteCustomProgram={handleDeleteCustomProgram}
              onCloneOfficialProgram={handleCloneOfficialProgram}
              sessionState={sessionState}
              onStartSession={handleStartSession}
              onStopSession={handleStopSession}
              onPauseSession={handlePauseSession}
              onResumeSession={handleResumeSession}
              onUpdateLiveParameter={handleUpdateLiveParameter}
              onUpdateSessionTime={handleUpdateSessionTime}
              history={history}
              completedSession={completedSession}
              onCloseSummary={handleCloseSummary}
              isVisitorMode={isVisitorMode}
              onExitVisitorMode={handleExitVisitorMode}
            />
          </motion.div>
        )}
        {currentScreen === 'program-detail' && (
          <motion.div
            key="program-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ProgramDetailScreen 
              onNavigate={handleNavigate}
              program={selectedProgram}
              onStartProgram={handleStartSession}
              isVisitorMode={isVisitorMode}
            />
          </motion.div>
        )}
        {currentScreen === 'create-routine' && (
          <motion.div
            key="create-routine"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <CreateRoutineScreen 
              onNavigate={handleNavigate}
              onSaveRoutine={handleSaveRoutine}
            />
          </motion.div>
        )}
        {currentScreen === 'article-detail' && (
          <motion.div
            key="article-detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ArticleDetailScreen onNavigate={handleNavigate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
