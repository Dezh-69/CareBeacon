import { useState } from 'react';
import { Shield } from 'lucide-react';

export function Login({ onDemoLogin }: { onDemoLogin?: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // DEMO BYPASS: If API key is the dummy one or demo login is requested
    if (import.meta.env.VITE_FIREBASE_API_KEY === "AIzaSyDummyKeyForDemoPurposesOnly123456" || !import.meta.env.VITE_FIREBASE_API_KEY) {
      if (onDemoLogin) {
        onDemoLogin();
        return;
      }
    }

    setLoading(true);
    
    try {
      const { auth } = await import('../../lib/firebase');
      if (isSignUp) {
        if (email && password && name && confirmPassword && password === confirmPassword) {
          const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName: name });
        } else {
          throw new Error('Please fill all fields and ensure passwords match.');
        }
      } else {
        if (email && password) {
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          await signInWithEmailAndPassword(auth, email, password);
        }
      }
    } catch (err: any) {
      console.error("Authentication Error:", err);
      let errorMessage = 'An error occurred during authentication. Please try again.';
      
      // Handle specific Firebase Auth error codes for user-friendly messages
      if (err.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
          case 'auth/user-not-found':
          case 'auth/invalid-credential':
          case 'auth/wrong-password':
            errorMessage = 'Incorrect email or password. Please try again.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists. Try signing in instead.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Your password is too weak. Please use at least 6 characters.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed login attempts. Please try again later.';
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="size-full relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 size-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]"></div>
      
      <div className="relative size-full flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center size-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-2xl shadow-indigo-500/50">
              <Shield className="size-10 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Fall Detection</h1>
            <p className="text-indigo-300">CareBeacon System</p>
          </div>
          
          {/* Login/Signup Card */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-20"></div>
            
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
              {/* Toggle Tabs */}
              <div className="flex gap-2 mb-6 p-1.5 bg-slate-950/50 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    !isSignUp
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    isSignUp
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign Up
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                      placeholder="Juan Dela Cruz"
                      required={isSignUp}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="caregiver@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm text-slate-300">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                      placeholder="••••••••"
                      required={isSignUp}
                    />
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:scale-[1.02] disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Access Dashboard')}
                </button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-slate-800/50">
                <p className="text-xs text-slate-400 text-center">
                  Demo Mode: Enter any credentials to access the system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}