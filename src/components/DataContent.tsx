import { useState, useMemo } from 'react';
import { BarChart3, Clock, CheckCircle2, ChevronDown, Zap, Thermometer, Wind } from 'lucide-react';
import { SessionRecord } from '../App';

interface DataContentProps {
  displayHistory: SessionRecord[];
  isVisitorMode: boolean;
  onViewDetails: (record: SessionRecord) => void;
}

type TimeFilter = 'all' | 'this-month' | 'last-month' | 'last-3-months';

export default function DataContent({ displayHistory, isVisitorMode, onViewDetails }: DataContentProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('this-month');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterOptions: { value: TimeFilter; label: string }[] = [
    { value: 'this-month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'all', label: 'All Time' },
  ];

  // Filter sessions by time period
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return displayHistory.filter((record) => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.getMonth();
      const recordYear = recordDate.getFullYear();

      switch (timeFilter) {
        case 'this-month':
          return recordMonth === currentMonth && recordYear === currentYear;
        
        case 'last-month':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return recordMonth === lastMonth && recordYear === lastMonthYear;
        
        case 'last-3-months':
          const threeMonthsAgo = new Date(now);
          threeMonthsAgo.setMonth(currentMonth - 3);
          return recordDate >= threeMonthsAgo;
        
        case 'all':
        default:
          return true;
      }
    });
  }, [displayHistory, timeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSessions = filteredSessions.length;
    const totalDuration = filteredSessions.reduce((sum, record) => sum + record.duration, 0);
    
    // Calculate mode-specific durations
    let coldDuration = 0;
    let heatDuration = 0;
    let pressureDuration = 0;
    
    filteredSessions.forEach((record) => {
      const mode = record.config?.treatmentMode;
      if (mode === 'cold') {
        coldDuration += record.duration;
      } else if (mode === 'hot') {
        heatDuration += record.duration;
      } else if (mode === 'compression-only') {
        pressureDuration += record.duration;
      } else {
        // For program sessions or unspecified, distribute evenly or skip
        // You can adjust this logic based on your needs
      }
    });

    return { totalSessions, totalDuration, coldDuration, heatDuration, pressureDuration };
  }, [filteredSessions]);

  const selectedFilterLabel = filterOptions.find(opt => opt.value === timeFilter)?.label || 'This Month';

  return (
    <div className="space-y-4">
      {/* Header */}
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

      {/* Time Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full bg-white rounded-xl p-3 border border-gray-200/50 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-medium text-gray-900">{selectedFilterLabel}</span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} 
            strokeWidth={1.5} 
          />
        </button>

        {/* Dropdown Menu */}
        {isFilterOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsFilterOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200/50 shadow-xl z-20 overflow-hidden">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setTimeFilter(option.value);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                    timeFilter === option.value
                      ? 'bg-primary/5 text-primary font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Sessions */}
        <div className="bg-card-subtle rounded-xl p-3 border border-gray-200/50 shadow-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            <span className="text-xs text-gray-600 font-medium">Sessions</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalSessions}</div>
        </div>

        {/* Total Duration */}
        <div className="bg-card-subtle rounded-xl p-3 border border-gray-200/50 shadow-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" strokeWidth={1.5} />
            <span className="text-xs text-gray-600 font-medium">Duration</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalDuration}<span className="text-sm text-gray-500 ml-0.5">m</span></div>
        </div>
      </div>

      {/* Mode-Specific Duration Breakdown */}
      <div className="bg-card-subtle rounded-xl p-4 border border-gray-200/50 shadow-lg">
        <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Therapy Time by Mode</h4>
        <div className="grid grid-cols-3 gap-4">
          {/* Cold Duration */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <Thermometer className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-gray-600 mb-1">Cold</span>
            <span className="text-lg font-bold text-blue-500">{stats.coldDuration}<span className="text-xs text-gray-500 ml-0.5">m</span></span>
          </div>

          {/* Heat Duration */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
              <Thermometer className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-gray-600 mb-1">Heat</span>
            <span className="text-lg font-bold text-orange-500">{stats.heatDuration}<span className="text-xs text-gray-500 ml-0.5">m</span></span>
          </div>

          {/* Pressure Duration */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Wind className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-gray-600 mb-1">Pressure</span>
            <span className="text-lg font-bold text-primary">{stats.pressureDuration}<span className="text-xs text-gray-500 ml-0.5">m</span></span>
          </div>
        </div>
      </div>

      {/* Session List */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" strokeWidth={1.5} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
          <p className="text-gray-500">
            {timeFilter === 'all' 
              ? 'Start your first recovery session'
              : 'No sessions in this time period'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((record) => (
            <button
              key={record.id}
              onClick={() => onViewDetails(record)}
              className="w-full bg-white rounded-xl p-4 border border-gray-100/50 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${record.type === 'program' ? 'bg-primary' : 'bg-green-500'}`}></div>
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{record.program}</h4>
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
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
