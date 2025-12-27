import { Waves } from 'lucide-react';

export default function LogoHeader() {
  return (
    <header className="text-center space-y-3">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-2 flex items-center justify-center">
          <Waves className="w-8 h-8 text-white" strokeWidth={2} />
        </div>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-hero">3Covery</h1>
        <p className="text-sm text-navbar mt-1">Smart Contrast Therapy</p>
      </div>
    </header>
  );
}
