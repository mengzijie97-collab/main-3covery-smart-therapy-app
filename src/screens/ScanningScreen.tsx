import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import TextLink from '../components/TextLink';
import BluetoothIcon from '../components/BluetoothIcon';
import ProgressDots from '../components/ProgressDots';
import PrimaryButton from '../components/PrimaryButton';

interface ScanningScreenProps {
  onNavigate: (screen: 'login' | 'pairing' | 'scanning' | 'device-list' | 'connected') => void;
}

export default function ScanningScreen({ onNavigate }: ScanningScreenProps) {
  const [showNoDevices, setShowNoDevices] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      onNavigate('device-list');
    }, 3000);

    return () => clearTimeout(timer);
  }, [onNavigate]);

  const handleTryAgain = () => {
    setShowNoDevices(false);
    setTimeout(() => {
      setShowNoDevices(true);
    }, 5000);
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
          <BluetoothIcon animate />

          {!showNoDevices ? (
            <>
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold text-hero">Scanning…</h1>
                <p className="text-lg text-gray-300">Looking for nearby devices</p>
              </div>

              <ProgressDots />
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold text-hero">No Devices Found</h1>
                <p className="text-lg text-gray-300 max-w-sm mx-auto">
                  Make sure your device is powered on and in pairing mode.
                </p>
              </div>

              <div className="pt-4">
                <PrimaryButton onClick={handleTryAgain} fullWidth>
                  Try Again
                </PrimaryButton>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
