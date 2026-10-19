import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'freedom-foundry-theme';
const SET_KEY = 'freedom-foundry-theme-set';

function readStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function hasChosen() {
  try {
    return localStorage.getItem(SET_KEY) === '1';
  } catch {
    return false;
  }
}

export function ThemeProvider({ children }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [theme, setTheme] = useState(() => (readStoredTheme() === 'light' ? 'light' : 'dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', theme === 'light');
    if (hasChosen()) {
      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // A private browsing context may not expose localStorage.
      }
    }
  }, [theme]);

  // Adopt a preference saved on another device once auth is known,
  // but never override a choice already made in this browser.
  useEffect(() => {
    if (isLoadingAuth || !isAuthenticated || !user) return;
    if (readStoredTheme() || hasChosen()) return;
    if (user.theme_preference === 'light' || user.theme_preference === 'dark') {
      setTheme(user.theme_preference);
    }
  }, [isLoadingAuth, isAuthenticated, user]);

  const applyTheme = (next) => {
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
      localStorage.setItem(SET_KEY, '1');
    } catch {
      // Storage unavailable; the session theme still applies.
    }
    if (isAuthenticated) {
      base44.auth.updateMe({ theme_preference: next }).catch(() => {});
    }
  };

  const value = useMemo(() => ({
    theme,
    lightMode: theme === 'light',
    toggleTheme: () => applyTheme(theme === 'light' ? 'dark' : 'light'),
    applyTheme,
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}