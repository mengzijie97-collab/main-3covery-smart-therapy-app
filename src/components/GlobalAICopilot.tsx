import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GlobalAICopilotProps {
  currentView: string;
  contextData: any;
}

export default function GlobalAICopilot({ currentView, contextData }: GlobalAICopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Don't render during active session
  if (currentView === 'immersive_session') {
    return null;
  }

  const scrollToBottom = () => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      // Silently handle scroll errors
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  const generateContextualResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const systemContext = `User is currently on ${currentView} screen. Data: ${JSON.stringify(contextData)}`;

    // Context-aware responses based on current view
    if (currentView === 'dashboard' || currentView === 'device') {
      if (lowerMessage.includes('how') || lowerMessage.includes('start') || lowerMessage.includes('use')) {
        return "To start a therapy session, you can either:\n\n1. **Choose a Preset Program**: Tap 'Preset Programs' and select from our official recovery programs like 'Contrast Recovery' or 'Deep Cold Therapy'.\n\n2. **Manual Control**: Switch to 'Manual Control' to customize your own session with specific temperature, compression, and duration settings.\n\nWould you like help choosing the right program for your needs?";
      }
      if (lowerMessage.includes('program') || lowerMessage.includes('routine')) {
        return "I can help you understand our programs:\n\n• **Contrast Recovery**: Alternates hot and cold therapy to boost circulation\n• **Deep Cold Therapy**: Focused cold treatment for inflammation\n• **Warm Recovery**: Gentle heat therapy for muscle relaxation\n\nYou can also create custom routines by tapping the '+' icon. What type of recovery are you looking for?";
      }
      if (lowerMessage.includes('water') || lowerMessage.includes('level')) {
        return `Your current water level is ${contextData?.waterLevel || 'normal'}. For optimal performance:\n\n• Keep water level between MIN and MAX marks\n• Refill when indicator shows LOW\n• Use distilled or filtered water\n• Clean tank weekly\n\nNeed help with maintenance?`;
      }
    }

    if (currentView === 'manual') {
      if (lowerMessage.includes('temperature') || lowerMessage.includes('temp') || lowerMessage.includes('cold') || lowerMessage.includes('hot')) {
        const temp = contextData?.temperature || 'not set';
        return `You're in Manual Mode. Current temperature is set to ${temp}°C.\n\n**Temperature Guidelines:**\n• Cold therapy: 5-15°C (reduces inflammation)\n• Heat therapy: 35-42°C (relaxes muscles)\n\nAdjust using the slider to find your comfort zone. Start conservative and adjust as needed!`;
      }
      if (lowerMessage.includes('compression') || lowerMessage.includes('pressure')) {
        const level = contextData?.compressionLevel || 'not set';
        return `Current compression level: ${level}\n\n**Compression Levels:**\n• Level 0: Off\n• Level 1-2: Light (recovery/relaxation)\n• Level 3-4: Strong (deep tissue work)\n\n**Modes:**\n• Overall: Uniform pressure\n• Flow: Sequential gradient\n• Wave: Rhythmic pulsing\n\nWhat intensity feels right for you?`;
      }
      if (lowerMessage.includes('duration') || lowerMessage.includes('time') || lowerMessage.includes('long')) {
        return `**Recommended Session Durations:**\n\n• Cold therapy: 10-20 minutes\n• Heat therapy: 15-30 minutes\n• Compression only: 20-60 minutes\n\nListen to your body! Start with shorter sessions and gradually increase as you adapt.`;
      }
    }

    if (currentView === 'program_detail') {
      const programName = contextData?.name || 'this program';
      return `You're viewing "${programName}".\n\nThis program includes multiple segments designed for optimal recovery. Each segment has specific temperature and compression settings.\n\n**Tips:**\n• Review the timeline to see what to expect\n• You can adjust parameters during the session\n• Save to favorites for quick access\n\nReady to start? Tap the 'Start Program' button!`;
    }

    if (currentView === 'data') {
      return `Your session history shows your recovery journey!\n\n**Insights:**\n• Track completion rates to stay motivated\n• Notice patterns in your recovery routine\n• Compare different programs' effectiveness\n\nConsistent recovery leads to better performance. Keep it up!`;
    }

    if (currentView === 'learn') {
      return `The Learn section has science-backed articles and guides:\n\n• **Science**: Understanding the 'why' behind therapy\n• **Recovery**: Best practices and protocols\n• **Device**: Setup and maintenance guides\n\nKnowledge is power! What would you like to learn about?`;
    }

    // General helpful responses
    if (lowerMessage.includes('help') || lowerMessage.includes('what')) {
      return `I'm your 3Covery AI assistant! I can help you with:\n\n• Choosing the right therapy program\n• Understanding temperature and compression settings\n• Troubleshooting device issues\n• Learning about recovery science\n• Creating custom routines\n\nWhat would you like to know?`;
    }

    if (lowerMessage.includes('pain') || lowerMessage.includes('sore') || lowerMessage.includes('injury')) {
      return `For pain and soreness:\n\n**Acute (recent injury):**\n• Use cold therapy (10-15°C)\n• 15-20 minute sessions\n• Reduces inflammation\n\n**Chronic (ongoing soreness):**\n• Try contrast therapy\n• Alternates hot and cold\n• Improves circulation\n\n⚠️ **Important**: If pain is severe or persistent, consult a healthcare professional.`;
    }

    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! I'm here whenever you need guidance. Happy recovering! 💪";
    }

    // Default contextual response
    return `I'm analyzing your current view (${currentView}). ${systemContext}\n\nI can help you with:\n• Understanding your current settings\n• Choosing the right therapy\n• Optimizing your recovery routine\n\nWhat specific question do you have?`;
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = generateContextualResponse(inputText);
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getViewDisplayName = (view: string): string => {
    const viewNames: Record<string, string> = {
      'dashboard': 'Device Dashboard',
      'device': 'Device Dashboard',
      'manual': 'Manual Control',
      'preset': 'Program Selection',
      'program_detail': 'Program Details',
      'data': 'Session History',
      'learn': 'Learning Center',
      'my': 'Profile Settings',
    };
    return viewNames[view] || view;
  };

  return (
    <>
      {/* Floating Trigger Button (FAB) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[100px] right-5 z-50 px-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full shadow-lg hover:shadow-xl transition-all group"
            style={{
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary group-hover:text-secondary transition-colors" strokeWidth={2} />
              <span className="text-sm font-semibold text-gray-900">AI Help</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-50"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
              style={{ height: '60vh', maxHeight: '600px' }}
            >
              {/* Header */}
              <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">3Covery AI</h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
                  </button>
                </div>
                
                {/* Context Chip */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs font-medium text-primary">
                    Analyzing: {getViewDisplayName(currentView)}
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: 'calc(60vh - 180px)', maxHeight: '420px' }}>
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <MessageCircle className="w-8 h-8 text-primary" strokeWidth={1.5} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Hi! I'm your AI assistant
                    </h4>
                    <p className="text-sm text-gray-600 max-w-xs mx-auto">
                      I can help you understand your therapy options, optimize settings, and answer questions about recovery.
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-2.5">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    rows={1}
                    className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    style={{ maxHeight: '100px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className={`p-2.5 rounded-full transition-all ${
                      inputText.trim()
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
