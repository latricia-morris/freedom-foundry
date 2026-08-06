import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Mail, Lock } from "lucide-react";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

const EMBER_VIDEO = "https://media.base44.com/videos/public/6a6982f0647238bf2b5d67bf/8d01159f7_rising-golden-embers-on-black-background-2025-12-17-19-25-08-utc.mp4";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", returnTo);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a12]">
      {/* Ember video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        src={EMBER_VIDEO}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/70 via-[#0a0a12]/40 to-[#0a0a12]/80" />

      {/* Top-left branding */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)',
            boxShadow: '0 0 7px rgba(217, 98, 44, 0.45), 0 0 3px rgba(179, 35, 44, 0.7)'
          }}
        >
          <div className="w-[30px] h-[30px] rounded-full bg-[#0f0f1a] flex items-center justify-center">
            <span className="font-heading text-sm font-medium molten-text">TBR</span>
          </div>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-heading text-xl font-medium text-[#f7f2ea] tracking-[0.04em]">FREEDOM FOUNDRY</span>
          <span className="uppercase tracking-[0.25em] text-[#d9c9a3] text-[10px]">BY THE BRAND REVIVALIST</span>
        </div>
      </div>

      {/* Login panel — black liquid glass */}
      <div
        className="relative z-10 w-full max-w-md mx-4"
        style={{
          background: 'rgba(8, 8, 14, 0.72)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '20px',
          border: '1px solid rgba(247, 242, 234, 0.08)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mb-1">Welcome back</h1>
            <p className="text-sm text-[#f7f2ea]/50 tracking-wide">Sign in to your portal</p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-[#f7f2ea] text-sm font-medium hover:bg-white/10 transition-colors mb-6"
          >
            <GoogleIcon className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative mb-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#f7f2ea]/30">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-900/30 border border-red-700/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[#f7f2ea]/50 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f7f2ea]/30" />
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full h-12 pl-11 pr-4 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.45)',
                    border: '1px solid rgba(247,242,234,0.08)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(217,98,44,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(247,242,234,0.08)'}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs uppercase tracking-[0.15em] text-[#f7f2ea]/50">Password</label>
                <Link to={"/forgot-password" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")} className="text-xs text-[#f7f2ea]/40 hover:text-[#f7f2ea]/70 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f7f2ea]/30" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-4 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.45)',
                    border: '1px solid rgba(247,242,234,0.08)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(217,98,44,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(247,242,234,0.08)'}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white text-sm font-semibold tracking-wide disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#f7f2ea]/40 mt-6">
            Don't have an account?{" "}
            <Link
              to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
              className="font-medium text-[#f7f2ea]/70 hover:text-[#f7f2ea] transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}