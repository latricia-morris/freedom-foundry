import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignIn } from '@clerk/react';
import { Apple, KeyRound, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';

function clerkErrorMessage(error, fallback) {
  return error?.longMessage || error?.errors?.[0]?.longMessage || error?.message || fallback;
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#4285F4" d="M21.35 12.23c0-.72-.06-1.25-.2-1.81H12v3.45h5.37c-.11.86-.73 2.16-2.1 3.03l-.02.12 3.05 2.31.21.02c1.92-1.73 3.04-4.28 3.04-7.12Z" />
      <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.85 6.45-2.31l-3.07-2.45c-.82.56-1.92.95-3.38.95-2.58 0-4.77-1.68-5.55-4.01l-.12.01-3.17 2.4-.04.11A9.73 9.73 0 0 0 12 21.5Z" />
      <path fill="#FBBC05" d="M6.45 13.68A5.75 5.75 0 0 1 6.14 12c0-.58.11-1.14.3-1.68v-.12l-3.22-2.44-.1.04A9.44 9.44 0 0 0 2 12c0 1.51.37 2.94 1.12 4.2l3.33-2.52Z" />
      <path fill="#EA4335" d="M12 6.3c1.84 0 3.08.78 3.79 1.44l2.77-2.65C16.83 3.5 14.63 2.5 12 2.5a9.73 9.73 0 0 0-8.88 5.3l3.32 2.56C7.24 7.98 9.42 6.3 12 6.3Z" />
    </svg>
  );
}

const panelClassName = [
  'w-full rounded-2xl border border-white/10',
  'bg-black/60 px-6 py-8 shadow-[0_24px_90px_rgba(0,0,0,0.55)]',
  'backdrop-blur-xl sm:px-10 sm:py-10',
].join(' ');

const inputClassName = [
  'h-12 w-full rounded-xl border border-white/[0.12] bg-black/40 px-11 pr-4 text-[#f7f2ea]',
  'outline-none transition placeholder:text-white/30 focus:border-[#d9622c]/70 focus:ring-2 focus:ring-[#d9622c]/20',
].join(' ');

export default function FreedomSignInForm({ basePath }) {
  const { signIn, fetchStatus } = useSignIn();
  const [mode, setMode] = useState('sign-in');
  const [resetStep, setResetStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const isSubmitting = fetchStatus === 'fetching';
  const dashboardUrl = `${basePath}/dashboard`;
  const callbackUrl = `${basePath}/sign-in/sso-callback`;

  function resetForm() {
    setMode('sign-in');
    setResetStep('email');
    setPassword('');
    setConfirmPassword('');
    setCode('');
    setError('');
  }

  async function finishSignIn() {
    const result = await signIn.finalize();
    if (result.error) throw result.error;
    window.location.assign(dashboardUrl);
  }

  async function handlePasswordSignIn(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email address and password to continue.');
      return;
    }

    try {
      const result = await signIn.password({
        emailAddress: email.trim(),
        password,
      });

      if (result.error) throw result.error;
      if (signIn.status !== 'complete') {
        setError('This account requires an additional verification step. Please use the recovery option if you need help signing in.');
        return;
      }

      await finishSignIn();
    } catch (signInError) {
      setError(clerkErrorMessage(signInError, 'We could not sign you in. Please check your details and try again.'));
    }
  }

  async function handleOAuth(strategy) {
    setError('');
    try {
      const result = await signIn.sso({
        strategy,
        redirectUrl: dashboardUrl,
        redirectCallbackUrl: callbackUrl,
      });
      if (result.error) throw result.error;
    } catch (signInError) {
      setError(clerkErrorMessage(signInError, 'We could not start that sign-in option. Please try again.'));
    }
  }

  async function sendRecoveryCode(event) {
    event.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Enter the email address for your Freedom Foundry account.');
      return;
    }

    try {
      const init = await signIn.create({ identifier: email.trim() });
      if (init.error) throw init.error;

      const result = await signIn.resetPasswordEmailCode.sendCode();
      if (result.error) throw result.error;
      setResetStep('verify');
    } catch (resetError) {
      setError(clerkErrorMessage(resetError, 'We could not send a recovery code. Please check your email address and try again.'));
    }
  }

  async function resetPassword(event) {
    event.preventDefault();
    setError('');
    if (!code.trim() || !password) {
      setError('Enter the recovery code and a new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Your new passwords do not match.');
      return;
    }

    try {
      const verification = await signIn.resetPasswordEmailCode.verifyCode({ code: code.trim() });
      if (verification.error) throw verification.error;
      if (signIn.status !== 'needs_new_password') {
        setError('That recovery code could not be verified. Please request a new one and try again.');
        return;
      }

      const result = await signIn.resetPasswordEmailCode.submitPassword({ password });
      if (result.error) throw result.error;
      if (signIn.status !== 'complete') {
        setError('Your password was updated, but we could not finish signing you in. Please return to sign in.');
        return;
      }

      await finishSignIn();
    } catch (resetError) {
      setError(clerkErrorMessage(resetError, 'We could not reset your password. Please try again.'));
    }
  }

  if (mode === 'recovery') {
    const verifying = resetStep === 'verify';
    return (
      <section className={panelClassName} aria-labelledby="recovery-title">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#d9622c]/30 bg-[#d9622c]/10 text-[#f0d9b5]">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 id="recovery-title" className="font-heading text-4xl font-light text-[#f7f2ea]">Reset your password</h1>
          <p className="mt-2 text-sm leading-6 text-white/55">
            {verifying ? `Enter the recovery code sent to ${email}.` : 'We’ll email you a code to create a new password.'}
          </p>
        </div>

        <form onSubmit={verifying ? resetPassword : sendRecoveryCode} className="space-y-5">
          {!verifying && (
            <label className="block">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-white/55">Email address</span>
              <span className="relative block">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d9c9a3]/70" />
                <input className={inputClassName} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              </span>
            </label>
          )}

          {verifying && (
            <>
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-white/55">Recovery code</span>
                <input className={`${inputClassName} px-4 tracking-[0.35em]`} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="••••••" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-white/55">New password</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d9c9a3]/70" />
                  <input className={inputClassName} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a new password" />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-white/55">Confirm password</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d9c9a3]/70" />
                  <input className={inputClassName} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm your new password" />
                </span>
              </label>
            </>
          )}

          {error && <p role="alert" className="rounded-xl border border-red-500/25 bg-red-950/45 px-4 py-3 text-sm text-red-100">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9f1f28] via-[#d9622c] to-[#e6c695] font-semibold tracking-wide text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70">
            {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {verifying ? 'Update password' : 'Send recovery code'}
          </button>
        </form>

        <button type="button" onClick={resetForm} className="mt-6 w-full text-sm text-[#f0d9b5] transition hover:text-white">
          ← Back to sign in
        </button>
      </section>
    );
  }

  return (
    <section className={panelClassName} aria-labelledby="sign-in-title">
      <header className="mb-7 text-center">
        <img src={`${basePath}/forge-logo.png`} alt="" className="mx-auto mb-4 h-14 w-14 rounded-2xl object-cover shadow-[0_0_22px_rgba(217,98,44,0.36)]" />
        <h1 id="sign-in-title" className="font-heading text-4xl font-light tracking-wide text-[#f7f2ea]">Welcome back</h1>
        <p className="mt-2 text-sm text-white/55">Sign in to your Freedom Foundry portal</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => handleOAuth('oauth_google')} disabled={isSubmitting} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] text-sm font-medium text-[#f7f2ea] transition hover:bg-white/[0.12] disabled:cursor-wait disabled:opacity-70">
          <GoogleMark /> Google
        </button>
        <button type="button" onClick={() => handleOAuth('oauth_apple')} disabled={isSubmitting} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] text-sm font-medium text-[#f7f2ea] transition hover:bg-white/[0.12] disabled:cursor-wait disabled:opacity-70">
          <Apple className="h-5 w-5" fill="currentColor" /> Apple
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-white/35">
        <span className="h-px flex-1 bg-white/10" /> or continue with email <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handlePasswordSignIn} className="space-y-5">
        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-white/55">Email address</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d9c9a3]/70" />
            <input className={inputClassName} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-white/55">
            Password
            <button type="button" onClick={() => { setMode('recovery'); setError(''); }} className="normal-case tracking-normal text-[#f0d9b5] transition hover:text-white">Forgot password?</button>
          </span>
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d9c9a3]/70" />
            <input className={inputClassName} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" />
          </span>
        </label>

        {error && <p role="alert" className="rounded-xl border border-red-500/25 bg-red-950/45 px-4 py-3 text-sm text-red-100">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9f1f28] via-[#d9622c] to-[#e6c695] font-semibold tracking-wide text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70">
          {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-white/55">
        New to Freedom Foundry?{' '}
        <Link to={`${basePath}/sign-up`} className="font-medium text-[#f0d9b5] transition hover:text-white">Create your account</Link>
      </p>
    </section>
  );
}