import { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { sendJoinRequestEmail } from '../../lib/email';
import { Shield, Cpu, UserCheck, Phone, Eye, EyeOff } from 'lucide-react';
import { formatPhoneNumber } from '../../lib/formatPhone';

interface LoginProps {
  onSignUpComplete?: (status: 'active' | 'pending') => void;
}

export function Login({ onSignUpComplete }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [monitoredPersonName, setMonitoredPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    // Sign In flow
    if (!isSignUp) {
      setLoading(true);
      try {
        const { auth } = await import('../../lib/firebase');
        if (email && password) {
          const { signInWithEmailAndPassword } = await import('firebase/auth');
          await signInWithEmailAndPassword(auth, email, password);
        }
      } catch (err: any) {
        handleAuthError(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Sign Up flow — PRD Section 4
    if (!email || !password || !name || !confirmPassword || !serialNumber.trim() || !monitoredPersonName.trim() || !phoneNumber.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (monitoredPersonName.trim().length < 2) {
      setError('Please enter the full name of the monitored person.');
      return;
    }

    const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);

    try {
      const { auth } = await import('../../lib/firebase');
      const { db, ref, getOnce, set, push } = await import('../../lib/db');
      const trimmedSerial = serialNumber.trim();

      // Step 1: Validate serial number against admin-provisioned inventory
      const inventoryRef = ref(db, `admin/inventory/${trimmedSerial}`);
      const inventorySnap = await getOnce(inventoryRef);

      if (!inventorySnap.exists()) {
        setError('Unrecognized serial number. This device has not been provisioned by the administrator. Please verify the serial number on your CareBeacon device.');
        setLoading(false);
        return;
      }

      // Step 2: Check if device record exists (created during provisioning)
      const deviceRef = ref(db, `devices/${trimmedSerial}`);
      const deviceSnap = await getOnce(deviceRef);

      if (!deviceSnap.exists()) {
        setError('Device serial number not recognized. Please check the number and try again.');
        setLoading(false);
        return;
      }

      const deviceData = deviceSnap.val();

      // Step 2: Create the Firebase Auth account
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      await updateProfile(userCredential.user, { displayName: name });

      const now = new Date().toISOString();

      // Step 3: Write user profile to database
      const userRef = ref(db, `users/${uid}`);
      await set(userRef, {
        name: name,
        email: email,
        phone: phoneNumber.trim(),
        role: 'caregiver',
        createdAt: now,
      });

      // Step 4: Check if device already has a family
      if (deviceData.familyId) {
        // Existing family — create a pending join request (PRD step 5)
        const joinRequestsRef = ref(db, `families/${deviceData.familyId}/joinRequests`);
        const newRequestRef = push(joinRequestsRef);
        await set(newRequestRef, {
          uid: uid,
          name: name,
          email: email,
          phone: phoneNumber.trim(),
          status: 'pending',
          createdAt: now,
        });

        // Link user to the family with pending status
        const userFamilyRef = ref(db, `users/${uid}/familyId`);
        await set(userFamilyRef, deviceData.familyId);
        const userStatusRef = ref(db, `users/${uid}/accessStatus`);
        await set(userStatusRef, 'pending');

        // Send free email notification to existing caregivers
        sendJoinRequestEmail(name, trimmedSerial);

        setInfo('A request to join this family has been sent to the existing caregivers for approval. You will gain access once approved.');
        if (onSignUpComplete) onSignUpComplete('pending');
      } else {
        // New family — create family record and grant access immediately (PRD step 4)
        const familiesRef = ref(db, 'families');
        const newFamilyRef = push(familiesRef);
        const familyId = newFamilyRef.key;

        await set(newFamilyRef, {
          monitoredPerson: {
            name: monitoredPersonName.trim(),
          },
          deviceSerialNumber: trimmedSerial,
          caregivers: {
            [uid]: {
              name: name,
              email: email,
              phone: phoneNumber.trim(),
              role: 'primary',
              joinedAt: now,
            },
          },
          createdAt: now,
          status: 'active',
        });

        // Link device to family
        const deviceFamilyRef = ref(db, `devices/${trimmedSerial}/familyId`);
        await set(deviceFamilyRef, familyId);

        // Link user to family
        const userFamilyRef = ref(db, `users/${uid}/familyId`);
        await set(userFamilyRef, familyId);
        const userStatusRef = ref(db, `users/${uid}/accessStatus`);
        await set(userStatusRef, 'active');

        // Push to admin registration review queue (PRD step 4)
        const queueRef = ref(db, 'admin/registrationQueue');
        const newQueueRef = push(queueRef);
        await set(newQueueRef, {
          familyId: familyId,
          caregiverUid: uid,
          caregiverName: name,
          caregiverEmail: email,
          deviceSerialNumber: trimmedSerial,
          monitoredPersonName: monitoredPersonName.trim(),
          createdAt: now,
          status: 'pending_review',
        });

        if (onSignUpComplete) onSignUpComplete('active');
      }
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (err: any) => {
    console.error("Authentication Error:", err);
    let errorMessage = 'An error occurred during authentication. Please try again.';

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
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    setError(errorMessage);
  };
  return (
    <div className="size-full flex flex-col bg-background">
      {/* Top Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center gap-3 px-4 md:px-8 py-4">
          <div className="flex items-center justify-center size-10 bg-primary/10 rounded-xl text-primary">
            <Shield className="size-6" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">CareBeacon</h1>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
        <div className={`w-full transition-all duration-300 ${isSignUp ? 'max-w-2xl' : 'max-w-md'} mt-4 md:mt-8`}>
          {/* Header Text (Optional, keeping it simple for the form) */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isSignUp ? 'Register and link your CareBeacon device.' : 'Sign in to monitor your linked devices.'}
            </p>
          </div>

          {/* Login/Signup Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {/* Toggle Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); setInfo(''); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                !isSignUp
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); setInfo(''); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                isSignUp
                  ? 'bg-card text-foreground shadow-sm border border-border'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          {info && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary text-sm">
              {info}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form Fields container */}
            <div className={isSignUp ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
              
              {/* Column 1 (or only column for sign in) */}
              <div className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                      placeholder="Juan Dela Cruz"
                      required={isSignUp}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                    placeholder="caregiver@example.com"
                    required
                  />
                </div>

                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber || '+63'}
                      onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                      className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                      placeholder="+63 917 123 4567"
                      required={isSignUp}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                
                {isSignUp && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm pr-10"
                        placeholder="••••••••"
                        required={isSignUp}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Column 2 (only for sign up) */}
              {isSignUp && (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold text-primary">Device Registration</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Link your CareBeacon device to activate fall detection and location tracking.
                    </p>

                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        Device Serial Number
                      </label>
                      <input
                        type="text"
                        value={serialNumber}
                        onChange={(e) => setSerialNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm font-mono tracking-wider"
                        placeholder="CB-XXXX-XXXX"
                        required={isSignUp}
                      />
                      <p className="text-[10px] text-muted-foreground">Found on the back of your CareBeacon device.</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <UserCheck className="size-3.5" />
                        Monitored Person's Name
                      </label>
                      <input
                        type="text"
                        value={monitoredPersonName}
                        onChange={(e) => setMonitoredPersonName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                        placeholder="Name of the elderly user"
                        required={isSignUp}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors disabled:opacity-70 disabled:pointer-events-none"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account & Link Device' : 'Access Dashboard')}
            </button>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
}
