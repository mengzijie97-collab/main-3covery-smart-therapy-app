import { Check } from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton';

interface ConnectedScreenProps {
  onNavigate: (screen: 'login' | 'pairing' | 'scanning' | 'device-list' | 'connected' | 'main-app') => void;
}

export default function ConnectedScreen({ onNavigate }: ConnectedScreenProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center border-2 border-success/40">
            <Check className="w-12 h-12 text-success" strokeWidth={2} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-hero">Successfully Connected!</h1>
          <p className="text-lg text-gray-300 max-w-sm mx-auto">
            Your device is now paired and ready to use.
          </p>
        </div>

        <div className="space-y-6 pt-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <img 
                src="https://c.animaapp.com/mjn3exopQqjBGG/img/20250806-1773.png" 
                alt="3Covery Device"
                className="w-20 h-20 object-contain"
              />
              <div className="text-left">
                <h3 className="text-xl font-medium text-hero">3Covery</h3>
                <p className="text-sm text-gray-400 font-mono">SN001234</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-success">Connected</span>
                </div>
              </div>
            </div>
          </div>

          <PrimaryButton onClick={() => onNavigate('main-app')} fullWidth>
            Start Session
          </PrimaryButton>
        </div>
      </div>
    </main>
  );
}
