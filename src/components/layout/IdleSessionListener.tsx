'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useCrudStore } from '@/store/crud-store';
import { Clock, ShieldAlert, LogOut } from 'lucide-react';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const WARNING_THRESHOLD_MS = 9 * 60 * 1000; // Show warning after 9 minutes (60 seconds countdown)

export default function IdleSessionListener() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { logAudit } = useCrudStore();

  const lastActivityRef = useRef<number>(Date.now());
  const [showWarning, setShowWarning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);

  // Helper to reset activity timer
  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Track user activity events across the DOM
    const activityEvents = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
      'app-user-activity',
    ];

    const handleUserActivity = () => {
      resetTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Interval checker running every second to check inactivity duration
    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActivityRef.current;

      if (idleTime >= IDLE_TIMEOUT_MS) {
        // Log Session Expiry Audit Event
        try {
          logAudit({
            userId: user?.id || 'usr-session',
            userName: user?.name || 'User',
            userRole: user?.role || 'Guest',
            action: 'SESSION_EXPIRED_TIMEOUT',
            module: 'Security',
            recordId: user?.id || 'session',
            details: `User session automatically terminated due to 10 minutes of complete inactivity.`,
          });
        } catch (e) {
          // Fallback if logAudit error
        }

        // Execute session expiry logout
        logout();
        clearInterval(interval);
        router.push('/login?reason=session_expired');
      } else if (idleTime >= WARNING_THRESHOLD_MS) {
        const remaining = Math.ceil((IDLE_TIMEOUT_MS - idleTime) / 1000);
        setShowWarning(true);
        setSecondsRemaining(Math.max(1, remaining));
      } else {
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, logout, router, user, showWarning]);

  if (!isAuthenticated || !showWarning) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900 border-2 border-amber-500/80 text-white rounded-3xl p-4 shadow-2xl max-w-sm flex items-start gap-3 backdrop-blur-md">
        <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <Clock className="w-5 h-5 animate-pulse" />
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-400 text-sm">Session Timeout Warning</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/30 font-black text-amber-300 font-mono text-[11px]">
              {secondsRemaining}s
            </span>
          </div>

          <p className="text-slate-300 text-[11px]">
            No activity detected for 9 minutes. Your session will expire in{' '}
            <strong className="text-amber-300">{secondsRemaining} seconds</strong> due to inactivity security policy.
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={resetTimer}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-[11px] shadow-sm transition-all active:scale-95"
            >
              Stay Logged In
            </button>

            <button
              onClick={() => {
                logout();
                router.push('/login?reason=session_expired');
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] flex items-center gap-1 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
