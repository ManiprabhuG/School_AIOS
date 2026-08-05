'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useCrudStore } from '@/store/crud-store';
import { useUIStore, applyThemeToDOM } from '@/store/ui-store';
import { School, Lock, User as UserIcon, Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  const { loginWithCredentials, setUserSession } = useAuthStore();
  const { theme, companyProfile } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    applyThemeToDOM(theme);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reason') === 'session_expired') {
        setSessionExpiredNotice(true);
      }
    }
  }, [theme]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim() || !password) {
      setErrorMessage('Invalid User ID or Password.');
      return;
    }

    setLoading(true);

    try {
      // Gather client-side persisted store users for seamless authentication
      const clientUsers = useAuthStore.getState().users || [];
      const clientAdmins = useCrudStore.getState().admins || [];
      const clientStaff = useCrudStore.getState().staff || [];

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          rememberMe,
          clientUsers,
          clientAdmins,
          clientStaff,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setUserSession(data.user, data.token);
        setLoading(false);
        router.push('/');
      } else if (data.success) {
        loginWithCredentials(identifier, password, rememberMe);
        setLoading(false);
        router.push('/');
      } else {
        // Fallback to local store validation for client-side created accounts
        const localRes = loginWithCredentials(identifier, password, rememberMe);
        setLoading(false);
        if (localRes.success) {
          router.push('/');
        } else {
          setErrorMessage(data.error || localRes.error || 'Invalid User ID or Password.');
        }
      }
    } catch (err) {
      // Fallback to local store validation
      const res = loginWithCredentials(identifier, password, rememberMe);
      setLoading(false);
      if (res.success) {
        router.push('/');
      } else {
        setErrorMessage(res.error || 'Invalid User ID or Password.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header Branding & Logo */}
        <div className="text-center space-y-2">
          {companyProfile?.schoolLogo ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center mx-auto shadow-xl shadow-blue-500/20 bg-white p-2">
              <img src={companyProfile.schoolLogo} alt="School Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/30">
              <School className="w-9 h-9 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {companyProfile?.schoolName || 'ABS School Management ERP'}
          </h1>
          <p className="text-xs text-slate-400 font-medium">Enterprise Authentication Portal</p>
        </div>

        {/* Session Expired Alert Message */}
        {sessionExpiredNotice && (
          <div className="p-3 bg-amber-950/80 border border-amber-800/80 rounded-2xl text-xs text-amber-300 font-medium flex items-center gap-2.5 animate-in fade-in shadow-sm">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>🔒 Security Alert: Session expired due to 10 minutes of inactivity. Please log in again.</span>
          </div>
        )}

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-2xl text-xs text-rose-300 font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          {/* User ID / Email */}
          <div>
            <label className="font-bold text-slate-300 block mb-1.5">User ID or Email Address</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-3 py-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-600"
                placeholder="Enter User ID or Email"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-bold text-slate-300">Password</label>
              <Link href="/forgot-password" className="text-sky-400 hover:underline font-semibold text-[11px]">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white pl-10 pr-10 py-3 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-600"
                placeholder="Enter Security Password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 font-medium select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500"
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating User...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="pt-4 border-t border-slate-800/80 text-center text-slate-500 text-[11px] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-bit Encrypted SSL Role-Based Authentication</span>
        </div>
      </div>
    </div>
  );
}
