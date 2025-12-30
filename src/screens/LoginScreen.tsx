import { useState, useEffect } from 'react';
import { Mail, Shield, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginScreenProps {
  onNavigate: (screen: 'login' | 'pairing' | 'scanning') => void;
}

type LoginMethod = 'otp' | 'password';

const carouselSlides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80&fit=crop',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80&fit=crop',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80&fit=crop',
  },
];

export default function LoginScreen({ onNavigate }: LoginScreenProps) {
  const { toast } = useToast();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('otp');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nextSlide, setNextSlide] = useState(1);
  
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setNextSlide((currentSlide + 1) % carouselSlides.length);
      
      // After fade-in completes, update current slide
      setTimeout(() => {
        setCurrentSlide((currentSlide + 1) % carouselSlides.length);
      }, 700);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [currentSlide]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleGetCode = () => {
    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setCountdown(60);
    
    toast({
      title: "Code Sent",
      description: "Verification code: 1234 (Demo)",
      duration: 5000,
    });
  };

  const handleOTPLogin = () => {
    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!verificationCode || verificationCode.length < 4) {
      toast({
        title: "Invalid Code",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    const isNewUser = !email.startsWith('user@');
    
    if (isNewUser) {
      toast({
        title: "Welcome!",
        description: "Account created successfully",
      });
    } else {
      toast({
        title: "Welcome Back!",
        description: "Logged in successfully",
      });
    }

    onNavigate('pairing');
  };

  const handlePasswordLogin = () => {
    if (!loginEmail) {
      toast({
        title: "Required Field",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Required Field",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Welcome Back!",
      description: "Logged in successfully",
    });

    onNavigate('pairing');
  };

  const canSubmitOTP = isValidEmail(email) && verificationCode.length >= 4 && agreedToTerms;
  const canSubmitPassword = loginEmail && password && agreedToTerms;

  return (
    <div className="min-h-screen bg-gradient-1 flex flex-col overflow-y-auto">
      {/* Organic Header - 16:9 Landscape with Asymmetric Rounded Bottom */}
      <div className="relative h-64 overflow-hidden rounded-bl-[60px] rounded-br-[20px] flex-shrink-0">
        {/* Stacked Background Images - Current Slide (Base Layer) */}
        <div className="absolute inset-0">
          <img
            src={carouselSlides[currentSlide].image}
            alt="Recovery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-transparent"></div>
        </div>

        {/* Next Slide (Fade In Layer) */}
        {nextSlide !== currentSlide && (
          <div 
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{
              opacity: nextSlide !== currentSlide ? 1 : 0,
            }}
          >
            <img
              src={carouselSlides[nextSlide].image}
              alt="Recovery"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-transparent"></div>
          </div>
        )}

        {/* STABLE LOGO - Outside Carousel Logic */}
        <div className="absolute top-6 left-6 z-20">
          <img 
            src="https://c.animaapp.com/mjnxgqk9obaGxq/img/tu-xing-coolcovery.png"
            alt="CoolCovery"
            className="h-10 brightness-0 invert drop-shadow-lg"
          />
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 right-6 flex gap-2 z-20">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setNextSlide(index);
                setTimeout(() => setCurrentSlide(index), 700);
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === currentSlide
                  ? 'w-8 bg-white'
                  : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form Container - Overlapping with Negative Margin */}
      <div className="flex-1 -mt-12 px-4 pb-8 relative z-30">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-6">
          {/* Subtitle - First Element */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {loginMethod === 'otp' ? 'Sign in or create account' : 'Welcome back'}
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              {loginMethod === 'otp' ? 'Enter your email to continue' : 'Sign in to your account'}
            </p>
          </div>

          {/* OTP Form */}
          {loginMethod === 'otp' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pl-10 pr-4 h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Verification Code
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Shield className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter code"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pl-10 pr-24 h-11 rounded-xl text-sm"
                  />
                  <button
                    onClick={handleGetCode}
                    disabled={!isValidEmail(email) || countdown > 0}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      !isValidEmail(email) || countdown > 0
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-primary bg-primary/10 hover:bg-primary/20'
                    }`}
                  >
                    {countdown > 0 ? `${countdown}s` : 'Get Code'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Password Form */}
          {loginMethod === 'password' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pl-10 pr-4 h-11 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pl-10 pr-12 h-11 rounded-xl text-sm"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Password Reset",
                      description: "Reset link sent to your email",
                    });
                  }}
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          )}

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2.5 mt-4">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline font-medium" onClick={(e) => e.preventDefault()}>
                Privacy Policy
              </a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline font-medium" onClick={(e) => e.preventDefault()}>
                Terms of Service
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <div className="space-y-3 mt-4">
            <button
              onClick={loginMethod === 'otp' ? handleOTPLogin : handlePasswordLogin}
              disabled={loginMethod === 'otp' ? !canSubmitOTP : !canSubmitPassword}
              className={`w-full h-11 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm ${
                (loginMethod === 'otp' ? canSubmitOTP : canSubmitPassword)
                  ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loginMethod === 'otp' ? 'Continue' : 'Sign In'}
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>

            {/* Toggle Login Method */}
            <div className="text-center">
              <button
                onClick={() => {
                  setLoginMethod(loginMethod === 'otp' ? 'password' : 'otp');
                  setEmail('');
                  setVerificationCode('');
                  setLoginEmail('');
                  setPassword('');
                  setCountdown(0);
                }}
                className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
              >
                {loginMethod === 'otp' ? 'Sign in with password' : 'Sign in with verification code'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
