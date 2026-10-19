import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/theme';

export default function ThemePreferencePrompt() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const { applyTheme } = useTheme();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('ff-theme-prompt') === 'later';
    } catch {
      return false;
    }
  });

  if (isLoadingAuth || !isAuthenticated || dismissed) return null;
  if (user?.theme_preference) return null;
  let chosen = false;
  try {
    chosen = localStorage.getItem('freedom-foundry-theme-set') === '1';
  } catch {
    chosen = false;
  }
  if (chosen) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem('ff-theme-prompt', 'later');
    } catch {
      // Storage unavailable; just close for this render.
    }
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="dashboard-card w-full max-w-md rounded-2xl p-8 text-center">
        <h2 className="font-heading text-2xl font-light text-foreground">How should the foundry feel?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick your default look. You can change it anytime in Settings.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => applyTheme('light')}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-[#eff2f5] p-6 transition-transform hover:scale-[1.02]"
          >
            <Sun className="h-6 w-6 text-[#9f1f28]" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-[#1c222b]">Light</span>
          </button>
          <button
            type="button"
            onClick={() => applyTheme('dark')}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-[#101114] p-6 transition-transform hover:scale-[1.02]"
          >
            <Moon className="h-6 w-6 text-[#d9622c]" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-[#f5f5f5]">Dark</span>
          </button>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="mt-5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Decide later
        </button>
      </div>
    </div>
  );
}