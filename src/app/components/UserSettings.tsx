import { useState } from 'react';
import { User, Mail, Lock, Phone, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { db, ref, update } from '../../lib/db';
import {
  updatePassword,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

export function UserSettings() {
  // Email
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Phone
  const [newPhone, setNewPhone] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneMsg, setPhoneMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const user = auth.currentUser;

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail.trim()) return;
    setEmailLoading(true);
    setEmailMsg(null);
    try {
      await updateEmail(user, newEmail.trim());
      // Also update in database
      await update(ref(db, `users/${user.uid}`), { email: newEmail.trim() });
      setEmailMsg({ type: 'success', text: 'Email updated successfully.' });
      setNewEmail('');
    } catch (err: any) {
      const msg = err.code === 'auth/requires-recent-login'
        ? 'This action requires re-authentication. Please sign out and sign in again.'
        : err.message || 'Failed to update email.';
      setEmailMsg({ type: 'error', text: msg });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPhone.trim()) return;
    setPhoneLoading(true);
    setPhoneMsg(null);
    try {
      await update(ref(db, `users/${user.uid}`), { phone: newPhone.trim() });
      setPhoneMsg({ type: 'success', text: 'Phone number updated successfully.' });
      setNewPhone('');
    } catch (err: any) {
      setPhoneMsg({ type: 'error', text: err.message || 'Failed to update phone number.' });
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg(null);
    try {
      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.code === 'auth/wrong-password'
        ? 'Current password is incorrect.'
        : err.code === 'auth/requires-recent-login'
        ? 'This action requires re-authentication. Please sign out and sign in again.'
        : err.message || 'Failed to update password.';
      setPasswordMsg({ type: 'error', text: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

  const Feedback = ({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) => {
    if (!msg) return null;
    return (
      <div className={`flex items-start gap-2.5 p-3 rounded-xl text-sm border ${
        msg.type === 'success'
          ? 'bg-success/10 text-success border-success/20'
          : 'bg-destructive/10 text-destructive border-destructive/20'
      }`}>
        {msg.type === 'success'
          ? <CheckCircle className="size-4 mt-0.5 flex-shrink-0" />
          : <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />}
        {msg.text}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1 text-foreground">Account Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your email, phone number, and password</p>
      </div>

      {/* Account Info */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <User className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Account Info</h3>
            <p className="text-xs text-muted-foreground">Your current account details</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-muted border border-border rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm font-medium text-foreground truncate">{user?.email || '—'}</p>
          </div>
          <div className="p-4 bg-muted border border-border rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Display Name</p>
            <p className="text-sm font-medium text-foreground">{user?.displayName || user?.email?.split('@')[0] || '—'}</p>
          </div>
        </div>
      </div>

      {/* Update Email */}
      <form onSubmit={handleUpdateEmail} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Mail className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Change Email</h3>
            <p className="text-xs text-muted-foreground">Update your login email address</p>
          </div>
        </div>

        <Feedback msg={emailMsg} />

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">New Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="new-email@example.com"
              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={emailLoading || !newEmail.trim()}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {emailLoading ? 'Updating...' : 'Update Email'}
          </button>
        </div>
      </form>

      {/* Update Phone */}
      <form onSubmit={handleUpdatePhone} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Phone className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Change Phone Number</h3>
            <p className="text-xs text-muted-foreground">Update your contact phone number</p>
          </div>
        </div>

        <Feedback msg={phoneMsg} />

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">New Phone Number</label>
            <input
              type="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="+63 917 123 4567"
              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={phoneLoading || !newPhone.trim()}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {phoneLoading ? 'Updating...' : 'Update Phone Number'}
          </button>
        </div>
      </form>

      {/* Update Password */}
      <form onSubmit={handleUpdatePassword} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Lock className="size-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Change Password</h3>
            <p className="text-xs text-muted-foreground">Secure your account with a new password</p>
          </div>
        </div>

        <Feedback msg={passwordMsg} />

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 pr-10 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2.5 pr-10 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 bg-input-background border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition text-sm"
              required
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
}
