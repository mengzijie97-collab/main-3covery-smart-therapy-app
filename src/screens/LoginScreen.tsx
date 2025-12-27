import { useState, useEffect } from 'react';
import LogoHeader from '../components/LogoHeader';
import FormCard from '../components/FormCard';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import TextLink from '../components/TextLink';
import { Smartphone, Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LoginScreenProps {
  onNavigate: (screen: 'login' | 'pairing' | 'scanning') => void;
}

type LoginMethod = 'otp' | 'password';

export default function LoginScreen({ onNavigate }: LoginScreenProps) {
  const { toast } = useToast();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('otp');
  
  // OTP mode states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);
  
  // Password mode states
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Common states
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Validate phone number (simple validation)
  const isValidPhone = (phone: string) => {
    return phone.length >= 10 && /^\d+$/.test(phone);
  };

  const handleGetCode = () => {
    if (!isValidPhone(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    // Mock: Send verification code
    setIsCodeSent(true);
    setCountdown(60);
    
    toast({
      title: "Code Sent",
      description: "Verification code: 1234 (Demo)",
      duration: 5000,
    });
  };

  const handleOTPLogin = () => {
    if (!isValidPhone(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
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

    // Mock: Check if user exists (simulate with phone number check)
    const isNewUser = !phoneNumber.startsWith('138'); // Mock logic: 138xxx = existing user
    
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

    // Navigate to pairing screen
    onNavigate('pairing');
  };

  const handlePasswordLogin = () => {
    if (!emailOrPhone) {
      toast({
        title: "Required Field",
        description: "Please enter your email or phone",
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

  const canSubmitOTP = isValidPhone(phoneNumber) && verificationCode.length >= 4 && agreedToTerms;
  const canSubmitPassword = emailOrPhone && password && agreedToTerms;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        <LogoHeader />
        
        <FormCard>
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-semibold text-hero">Welcome</h1>
              <p className="text-gray-300">
                {loginMethod === 'otp' ? 'Sign in or create account' : 'Sign in to continue'}
              </p>
            </div>

            {/* OTP Login Mode */}
            {loginMethod === 'otp' && (
              <div className="space-y-4">
                <InputField
                  label="Phone Number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your phone number"
                  icon={<Smartphone className="w-5 h-5" strokeWidth={1.5} />}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Shield className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter verification code"
                      className="w-full bg-white/5 border-gray-600 text-foreground placeholder:text-gray-500 focus:border-secondary focus:ring-2 focus:ring-secondary/50 transition-all duration-180 pl-10 pr-24 h-9 rounded-md border px-3 py-1 text-base shadow-sm"
                    />
                    <button
                      onClick={handleGetCode}
                      disabled={!isValidPhone(phoneNumber) || countdown > 0}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium rounded transition-all ${
                        !isValidPhone(phoneNumber) || countdown > 0
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-secondary hover:text-secondary/80'
                      }`}
                    >
                      {countdown > 0 ? `Resend (${countdown}s)` : 'Get Code'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Password Login Mode */}
            {loginMethod === 'password' && (
              <div className="space-y-4">
                <InputField
                  label="Email or Phone"
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter your email or phone"
                  icon={<Mail className="w-5 h-5" strokeWidth={1.5} />}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-white/5 border-gray-600 text-foreground placeholder:text-gray-500 focus:border-secondary focus:ring-2 focus:ring-secondary/50 transition-all duration-180 pl-10 pr-10 h-9 rounded-md border px-3 py-1 text-base shadow-sm"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                      ) : (
                        <Eye className="w-5 h-5" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <TextLink href="#" onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Password Reset",
                      description: "Password reset link sent to your email",
                    });
                  }}>
                    Forgot Password?
                  </TextLink>
                </div>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-white/5 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-gray-300 leading-relaxed cursor-pointer">
                I agree to the{' '}
                <a href="#" className="text-secondary hover:underline" onClick={(e) => e.preventDefault()}>
                  Privacy Policy
                </a>
                {' '}and{' '}
                <a href="#" className="text-secondary hover:underline" onClick={(e) => e.preventDefault()}>
                  User Agreement
                </a>
              </label>
            </div>

            {/* Main Action Button */}
            <div className="space-y-4">
              <PrimaryButton 
                onClick={loginMethod === 'otp' ? handleOTPLogin : handlePasswordLogin}
                fullWidth
                disabled={loginMethod === 'otp' ? !canSubmitOTP : !canSubmitPassword}
                className={!agreedToTerms || (loginMethod === 'otp' ? !canSubmitOTP : !canSubmitPassword) ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {loginMethod === 'otp' ? 'Log In / Sign Up' : 'Log In'}
              </PrimaryButton>

              {/* Toggle Login Method */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setLoginMethod(loginMethod === 'otp' ? 'password' : 'otp');
                    // Reset form fields when switching
                    setPhoneNumber('');
                    setVerificationCode('');
                    setEmailOrPhone('');
                    setPassword('');
                    setCountdown(0);
                    setIsCodeSent(false);
                  }}
                  className="text-sm text-secondary hover:text-secondary/80 transition-colors underline-offset-4 hover:underline"
                >
                  {loginMethod === 'otp' ? 'Password Login' : 'Verification Code Login'}
                </button>
              </div>
            </div>
          </div>
        </FormCard>

        <footer className="text-center">
          <p className="text-sm text-gray-400 font-mono">v2.1.0 Build 452</p>
        </footer>
      </div>
    </main>
  );
}
