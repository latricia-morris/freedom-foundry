import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

const EMBER_VIDEO = "https://media.base44.com/videos/public/6a6982f0647238bf2b5d67bf/8d01159f7_rising-golden-embers-on-black-background-2025-12-17-19-25-08-utc.mp4";

const inputStyle = {
  background: 'rgba(0,0,0,0.45)',
  border: '1px solid rgba(247,242,234,0.08)',
  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.4)',
};

function GlassInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f7f2ea]/30" />}
      <input
        {...props}
        className={`w-full h-12 ${Icon ? 'pl-11' : 'pl-4'} pr-4 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-all`}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'rgba(217,98,44,0.4)'}
        onBlur={e => e.target.style.borderColor = 'rgba(247,242,234,0.08)'}
      />
    </div>
  );
}

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) { setError("First and last name are required"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password, first_name: firstName, last_name: lastName });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) {
        base44.auth.setToken(result.access_token);
      }
      // Save optional profile fields
      try {
        await base44.auth.updateMe({ first_name: firstName, last_name: lastName });
        if (businessName || website) {
          await base44.entities.UserProfile.create({
            user_id: result?.user?.id || '',
            first_name: firstName,
            last_name: lastName,
            business_name: businessName,
            website: website,
            account_type: 'free'
          });
        }
      } catch (_) {}
      window.location.href = safeReturnTo();
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Code sent", description: "Check your email for the new code." });
    } catch (err) {
      setError(err.message || "Failed to resend code");
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider("google", safeReturnTo());
  };

  const panelStyle = {
    background: 'rgba(8, 8, 14, 0.72)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    borderRadius: '20px',
    border: '1px solid rgba(247, 242, 234, 0.08)',
    boxShadow: '0 8px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
  };

  if (showOtp) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a12]">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" src={EMBER_VIDEO} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/70 via-[#0a0a12]/40 to-[#0a0a12]/80" />
        <div className="relative z-10 w-full max-w-md mx-4" style={panelStyle}>
          <div className="p-8 sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mb-1">Verify your email</h1>
              <p className="text-sm text-[#f7f2ea]/50">We sent a code to {email}</p>
            </div>
            {error && <div className="mb-5 p-3 rounded-xl bg-red-900/30 border border-red-700/30 text-red-300 text-sm">{error}</div>}
            <div className="flex justify-center mb-6">
              <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || otpCode.length < 6}
              className="w-full h-12 rounded-xl text-white text-sm font-semibold tracking-wide disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : "Verify"}
            </button>
            <p className="text-center text-sm text-[#f7f2ea]/40 mt-4">
              Didn't receive the code?{" "}
              <button onClick={handleResend} className="text-[#f7f2ea]/70 hover:text-[#f7f2ea] font-medium transition-colors">Resend</button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a12]">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" src={EMBER_VIDEO} />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/70 via-[#0a0a12]/40 to-[#0a0a12]/80" />

      {/* Top-left branding */}
      <div className="absolute top-6 left-6 flex items-center gap-3 z-20">
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)', boxShadow: '0 0 7px rgba(217, 98, 44, 0.45)' }}>
          <div className="w-[30px] h-[30px] rounded-full bg-[#0f0f1a] flex items-center justify-center">
            <span className="font-heading text-sm font-medium molten-text">TBR</span>
          </div>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-heading text-xl font-medium text-[#f7f2ea] tracking-[0.04em]">FREEDOM FOUNDRY</span>
          <span className="uppercase tracking-[0.25em] text-[#d9c9a3] text-[10px]">BY THE BRAND REVIVALIST</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 my-8" style={panelStyle}>
        <div className="p-8 sm:p-10">
          <div className="mb-7 text-center">
            <h1 className="font-heading text-3xl font-light text-[#f7f2ea] mb-1">Create your account</h1>
            <p className="text-sm text-[#f7f2ea]/50">Join Freedom Foundry</p>
          </div>

          <button onClick={handleGoogle} className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 text-[#f7f2ea] text-sm font-medium hover:bg-white/10 transition-colors mb-6">
            <GoogleIcon className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative mb-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#f7f2ea]/30">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {error && <div className="mb-5 p-3 rounded-xl bg-red-900/30 border border-red-700/30 text-red-300 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-[#f7f2ea]/50 mb-2">First Name <span className="text-red-400">*</span></label>
                <GlassInput icon={User} type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First" required autoFocus />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.15em] text-[#f7f2ea]/50 mb-2">Last Name <span className="text-red-400">*</span></label>
                <GlassInput type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last" required />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[#f7f2ea]/50 mb-2">Email <span className="text-red-400">*</span></label>
              <GlassInput icon={Mail} type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[#f7f2ea]/50 mb-2">Business Name <span className="text-[#f7f2ea]/25">(optional)</span></label>
              <GlassInput type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your business or brand" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[#f7f2ea]/50 mb-2">Website <span className="text-[#f7f2ea]/25">(optional)</span></label>
              <GlassInput type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[#f7f2ea]/50 mb-2">Password <span className="text-red-400">*</span></label>
              <GlassInput icon={Lock} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-[#f7f2ea]/50 mb-2">Confirm Password <span className="text-red-400">*</span></label>
              <GlassInput icon={Lock} type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white text-sm font-semibold tracking-wide disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              style={{ background: 'linear-gradient(131deg, #b3232c, #d9622c, #f0d9b5)' }}
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-[#f7f2ea]/40 mt-6">
            Already have an account?{" "}
            <Link to={"/login" + (safeReturnTo() !== "/" ? "?returnTo=" + encodeURIComponent(safeReturnTo()) : "")} className="font-medium text-[#f7f2ea]/70 hover:text-[#f7f2ea] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}