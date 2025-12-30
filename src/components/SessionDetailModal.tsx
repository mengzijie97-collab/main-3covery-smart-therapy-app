import { X, Calendar, Clock, Thermometer, Wind, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SessionRecord } from '../App';

interface SessionDetailModalProps {
  isOpen: boolean;
  session: SessionRecord | null;
  onClose: () => void;
}

export default function SessionDetailModal({ isOpen, session, onClose }: SessionDetailModalProps) {
  if (!session) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generate timeline phases from session data
  const getSessionPhases = () => {
    const phases = [];
    const config = session.config;

    if (session.type === 'program') {
      // For program sessions, we don't have segment data in SessionRecord
      // So we create a single phase representing the program
      phases.push({
        id: 'program-phase',
        title: session.program,
        icon: 'zap',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
        settings: [
          config?.temperature ? `${config.temperature}°C` : null,
          config?.compressionMode ? config.compressionMode.charAt(0).toUpperCase() + config.compressionMode.slice(1) : null,
          config?.compressionLevel !== undefined ? `Level ${config.compressionLevel}` : null,
        ].filter(Boolean).join(' | '),
        duration: `${session.duration}:00`,
      });
    } else {
      // Manual Session: Show continuous mode used
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
          duration: `${session.duration}:00`,
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
          duration: `${session.duration}:00`,
        });
      }
    }

    return phases;
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
      case 'zap':
        return <Zap className="w-4 h-4" strokeWidth={2} />;
      default:
        return <Zap className="w-4 h-4" strokeWidth={2} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-lg font-bold text-gray-900">Session Details</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Session Type Badge */}
                <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    session.type === 'program' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {session.type === 'program' ? 'Program Session' : 'Manual Session'}
                  </div>
                </div>

                {/* Program Name */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {session.program}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" strokeWidth={1.5} />
                    <span>{formatDate(session.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                    <span>{formatTime(session.date)}</span>
                  </div>
                </div>

                {/* Duration Metric */}
                <div className="bg-card-subtle rounded-xl p-4 border border-gray-200/50 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs font-medium text-gray-600">Total Duration</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{session.duration}<span className="text-sm text-gray-500 ml-1">min</span></div>
                </div>

                {/* Session Recap - Vertical Timeline */}
                {phases.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Session Recap</h4>
                    
                    <div className="relative bg-gray-50 rounded-lg p-4">
                      {/* Vertical Timeline Line */}
                      {phases.length > 1 && (
                        <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gray-300"></div>
                      )}

                      {/* Phase Items */}
                      <div className="space-y-3">
                        {phases.map((phase) => (
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
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6">
                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
