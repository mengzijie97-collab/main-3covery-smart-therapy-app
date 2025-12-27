import { X, Lock, Sparkles, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPairDevice: () => void;
}

export default function ConversionModal({ isOpen, onClose, onPairDevice }: ConversionModalProps) {
  const handleBuyDevice = () => {
    // Mock external link
    window.open('https://3covery.com/shop', '_blank');
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
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header with Gradient */}
              <div className="relative bg-gradient-to-br from-primary via-primary to-secondary p-8 text-center">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-white" strokeWidth={2} />
                </button>

                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Lock className="w-10 h-10 text-white" strokeWidth={2} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Unlock Professional Recovery
                </h2>
                <p className="text-white/90 text-sm">
                  Experience the full power of 3Covery
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Features List */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Real-Time Control</h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Adjust temperature and compression during sessions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Track Your Progress</h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Monitor recovery data and session history
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Custom Programs</h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Create personalized recovery routines
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={onPairDevice}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Lock className="w-5 h-5" strokeWidth={2} />
                    I have a device (Pair Now)
                  </button>

                  <button
                    onClick={handleBuyDevice}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" strokeWidth={2} />
                    Buy Device
                  </button>
                </div>

                {/* Footer Note */}
                <p className="text-xs text-center text-gray-500">
                  Continue exploring in demo mode or connect your device for full access
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
