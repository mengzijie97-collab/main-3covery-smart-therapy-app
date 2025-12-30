import { ArrowLeft, ChevronRight } from 'lucide-react';
import TextLink from '../components/TextLink';

interface DeviceListScreenProps {
  onNavigate: (screen: 'login' | 'pairing' | 'scanning' | 'device-list' | 'connected') => void;
}

interface Device {
  id: string;
  name: string;
  serialNumber: string;
}

const mockDevices: Device[] = [
  { id: '1', name: '3Covery', serialNumber: 'SN001234' },
  { id: '2', name: '3Covery', serialNumber: 'SN005678' },
  { id: '3', name: '3Covery', serialNumber: 'SN009012' },
];

export default function DeviceListScreen({ onNavigate }: DeviceListScreenProps) {
  const handleDeviceClick = () => {
    onNavigate('connected');
  };

  return (
    <main className="min-h-screen flex flex-col px-4 py-8">
      <nav className="w-full max-w-md mx-auto mb-8">
        <TextLink 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            onNavigate('pairing');
          }}
        >
          <ArrowLeft className="w-5 h-5 inline mr-2" strokeWidth={1.5} />
          Back
        </TextLink>
      </nav>

      <div className="flex-1 w-full max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-hero">Available Devices</h1>
            <p className="text-gray-300">Select a device to connect</p>
          </div>

          <div className="space-y-3 mt-8">
            {mockDevices.map((device) => (
              <button
                key={device.id}
                onClick={handleDeviceClick}
                className="w-full bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 hover:border-secondary/50 transition-all duration-180 ease-in-out group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <img 
                      src="https://c.animaapp.com/mjnxgqk9obaGxq/img/3covery-prozhu-ji-tou-ming-tu_1.png"
                      alt="3Covery Device"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-medium text-hero">{device.name}</h3>
                    <p className="text-sm text-gray-400 font-mono">{device.serialNumber}</p>
                  </div>

                  <ChevronRight 
                    className="w-5 h-5 text-gray-400 group-hover:text-secondary transition-colors" 
                    strokeWidth={1.5} 
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
