import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Verification State
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    let timer: number;
    if (step === 2 && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    // Simulate API call to send verification code
    setTimeout(() => {
      if (!email.includes('@')) {
        setError("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }

      // Generate a real 6-digit code for verification
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(newCode);
      
      // LOG TO CONSOLE FOR DEVELOPMENT (Crucial for user to test without a backend)
      console.log(`%c[JanSamadhan] Verification Code for ${email}: ${newCode}`, 'background: #7c3aed; color: #fff; padding: 5px; border-radius: 4px; font-weight: bold;');
      
      setIsLoading(false);
      setSuccess("VERIFICATION CODE SENT TO YOUR EMAIL.");
      setStep(2);
    }, 1500);
  };

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[a-z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const validatePassword = (pass: string) => {
    return getPasswordStrength(pass) === 100;
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verify the code matches the generated one
    if (code !== generatedCode) {
      setError("Invalid verification code. Please check your email (or console for dev).");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setError("Password must include uppercase, lowercase, numbers, and symbols.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (timeLeft <= 0) {
      setError("Verification code has expired. Please resend.");
      return;
    }

    setIsLoading(true);
    // Simulate hashing and updating password
    setTimeout(() => {
      setIsLoading(false);
      setSuccess("PASSWORD RESET SUCCESSFULLY. REDIRECTING...");
      setTimeout(() => navigate('/login'), 2000);
    }, 1500);
  };

  const handleResend = () => {
    if (resendCount >= 3) {
      setError("Maximum resend attempts reached.");
      return;
    }
    setResendCount(prev => prev + 1);
    setTimeLeft(300);
    
    // Generate new code
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(newCode);
    console.log(`%c[JanSamadhan] New Verification Code for ${email}: ${newCode}`, 'background: #7c3aed; color: #fff; padding: 5px; border-radius: 4px; font-weight: bold;');
    
    setSuccess("VERIFICATION CODE SENT TO YOUR EMAIL.");
    setError(null);
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-6 no-scrollbar">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          
          {/* Success Banner matching reference */}
          {success && step === 2 && (
            <div className="mx-6 mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center space-x-3 text-emerald-600 animate-in slide-in-from-top-4 duration-300">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="text-[10px] font-black uppercase tracking-widest">{success}</p>
            </div>
          )}

          <div className="p-10 space-y-8">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Link to="/login" className="inline-flex items-center space-x-2 text-slate-400 hover:text-slate-600 transition-colors mb-4 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Login</span>
                  </Link>
                  <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password?</h1>
                  <p className="text-slate-500 text-sm font-medium">Enter your registered email address to receive a verification code.</p>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3 text-rose-600 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed uppercase tracking-tight">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSendCode} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com" 
                        className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-[#0f172a] text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start space-x-3 text-rose-600 animate-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed uppercase tracking-tight">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Code</label>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Expires in {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                    <input 
                      type="text" 
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit code" 
                      className="w-full h-14 pl-12 pr-4 bg-white border-2 border-indigo-500 rounded-2xl outline-none transition-all font-bold tracking-[0.4em] text-center text-slate-400 placeholder:tracking-normal placeholder:font-medium"
                      required
                    />
                  </div>
                  <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 flex items-center justify-center space-x-2">
                    <AlertCircle className="w-3 h-3 text-indigo-400" />
                    <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Check console for the code</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full h-14 pl-12 pr-12 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="px-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Strength</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${strength >= 100 ? 'text-emerald-500' : strength >= 50 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {strength >= 100 ? 'Secure' : strength >= 50 ? 'Medium' : 'Weak'}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${strength >= 100 ? 'w-full bg-emerald-500' : strength >= 50 ? 'w-2/3 bg-amber-500' : 'w-1/3 bg-rose-400'}`}
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-6 pt-4">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-[#0f172a] text-white font-black rounded-2xl hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Verify & Reset Password</span>}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={handleResend}
                    disabled={timeLeft > 240 || resendCount >= 3}
                    className="text-center text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] hover:text-indigo-600 disabled:opacity-30 transition-all"
                  >
                    Resend Code
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Need help? <a href="#" className="text-indigo-600 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};