import { ArrowLeft, Bluetooth, Power, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import TextLink from '../components/TextLink';

interface DevicePairingScreenProps {
  onNavigate: (screen: 'login' | 'pairing' | 'scanning' | 'device-list' | 'connected' | 'main-app') => void;
  onEnterVisitorMode?: () => void;
}

interface GuideStep {
  id: number;
  icon: React.ReactNode;
  text: string;
}

const guideSteps: GuideStep[] = [
  {
    id: 1,
    icon: <Power className="w-12 h-12 text-primary" strokeWidth={1.5} />,
    text: '1. Press the Power button to turn on device.',
  },
  {
    id: 2,
    icon: <Bluetooth className="w-12 h-12 text-primary" strokeWidth={1.5} />,
    text: '2. Ensure Device Bluetooth and phone bluetooth is enabled.',
  },
  {
    id: 3,
    icon: <Smartphone className="w-12 h-12 text-primary" strokeWidth={1.5} />,
    text: '3. Keep your phone near the device.',
  },
];

export default function DevicePairingScreen({ onNavigate, onEnterVisitorMode }: DevicePairingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-rotate steps every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % guideSteps.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const handlePairDevice = () => {
    onNavigate('scanning');
  };

  return (
    <main className="min-h-screen flex flex-col px-4 py-8">
      <nav className="w-full max-w-md mx-auto mb-8">
        <TextLink 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            onNavigate('login');
          }}
        >
          <ArrowLeft className="w-5 h-5 inline mr-2" strokeWidth={1.5} />
          Back to Login
        </TextLink>
      </nav>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Connection Helper Carousel */}
          <div className="bg-slate-50 rounded-2xl p-8 border border-gray-200 shadow-sm" style={{ height: '280px' }}>
            <div className="flex flex-col items-center justify-center h-full">
              {/* Animated Icon */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="mb-6"
                >
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    {guideSteps[currentStep].icon}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Animated Text */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={`text-${currentStep}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="text-base font-medium text-slate-700 leading-relaxed max-w-xs"
                >
                  {guideSteps[currentStep].text}
                </motion.p>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex gap-2 mt-8">
                {guideSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <p className="text-lg text-gray-300 max-w-sm mx-auto">
              No device found. Experience personalized recovery by pairing your device via Bluetooth.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 pt-4">
            <PrimaryButton onClick={handlePairDevice} fullWidth>
              <Bluetooth className="w-5 h-5 mr-2" strokeWidth={1.5} />
              Pair New Device
            </PrimaryButton>

            <SecondaryButton 
              onClick={() => {
                if (onEnterVisitorMode) {
                  onEnterVisitorMode();
                }
              }} 
              fullWidth
            >
              Just looking around? Explore App
            </SecondaryButton>
          </div>
        </div>
      </div>
    </main>
  );
}
