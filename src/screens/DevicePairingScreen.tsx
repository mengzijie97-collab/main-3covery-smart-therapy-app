import { ArrowLeft, Bluetooth } from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import TextLink from '../components/TextLink';
import BluetoothIcon from '../components/BluetoothIcon';

interface DevicePairingScreenProps {
  onNavigate: (screen: 'login' | 'pairing' | 'scanning' | 'device-list' | 'connected' | 'main-app') => void;
  onEnterVisitorMode?: () => void;
}

export default function DevicePairingScreen({ onNavigate, onEnterVisitorMode }: DevicePairingScreenProps) {
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
          <BluetoothIcon />

          <div className="space-y-4">
            <h1 className="text-3xl font-semibold text-hero">Welcome to 3Covery!</h1>
            <p className="text-lg text-gray-300 max-w-sm mx-auto">
              No device found. Experience personalized recovery by pairing your device via Bluetooth.
            </p>
          </div>

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
