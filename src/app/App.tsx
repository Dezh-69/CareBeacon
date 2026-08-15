import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [demoUser, setDemoUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleLogout = async () => {
    if (demoUser) {
      setDemoUser(null);
      return;
    }
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const handleDemoLogin = () => {
    setDemoUser({ uid: 'demo_user', email: 'demo@example.com', displayName: 'Demo User' });
  };
  
  if (loading) {
    return <div className="size-full flex items-center justify-center bg-slate-950 text-white">Loading...</div>;
  }
  
  return (
    <div className="size-full">
      {(user || demoUser) ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onDemoLogin={handleDemoLogin} />
      )}
    </div>
  );
}
