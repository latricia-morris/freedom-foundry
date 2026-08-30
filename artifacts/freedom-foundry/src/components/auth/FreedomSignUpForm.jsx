import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSignUp } from '@clerk/react';
import { Apple, LoaderCircle, LockKeyhole, Mail, UserRound } from 'lucide-react';
import apiClient from '@/api/client';
import RecaptchaWidget from './RecaptchaWidget';
import { withAuthTimeout } from './authTimeout';

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

export default function FreedomSignUpForm({ basePath }) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [step, setStep] = useState('details');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaResetToken, setCaptchaResetToken] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const captchaErrorRef = useRef('');

  const dashboardUrl = `${basePath}/dashboard`;
  const callbackUrl = `${basePath}/sign-up/sso-callback`;

  function handleCaptchaChange(token) {
    setCaptchaToken(token || '');
    if (token) {
      captchaErrorRef.current = '';
      setError('');
    }
  }

  function handleCaptchaExpired() {
    setCaptchaToken('');
    captchaErrorRef.current = 'Human verification expired. Please complete it again.';
    setError(captchaErrorRef.current);
  }

  function handleCaptchaError(message) {
    setCaptchaToken('');
    captchaErrorRef.current = message;
    setError(message);
  }

  async function verifyHuman(purpose) {
    if (!captchaToken) {
      setError(captchaErrorRef.current || 'Complete the human verification to continue.');
      return false;
    }

    try {
      await apiClient.auth.verifyCaptcha(captchaToken, purpose);
      setCaptchaToken('');
      setCaptchaResetToken((value) => value + 1);
      captchaErrorRef.current = '';
      return true;
    } catch (verificationError) {
      setCaptchaToken('');
      setCaptchaResetToken((value) => value + 1);
      setError(verificationError.message || 'Human verification failed. Please try again.');
      return false;
    }
  }

  async function finishSignUp(result) {
    if (result.status !== 'complete' || !result.createdSessionId) return false;
    await setActive({ session: result.createdSessionId });
    window.location.assign(dashboardUrl);
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!isLoaded) return;
    if (!email.trim() || !password) {
      setError('Enter your email address and password to continue.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
       if (!await withAuthTimeout(verifyHuman('sign-up'), 'Human verification timed out. Please try again.')) return;

       const result = await withAuthTimeout(signUp.create({
        emailAddress: email.trim(),
        password,
        ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
        ...(lastName.trim() ? { lastName: lastName.trim() } : {}),
       }), 'Account creation timed out. Please try again.');

      if (await finishSignUp(result)) return;

      if (result.unverifiedFields?.includes('email_address') || result.verifications?.emailAddress?.status === 'unverified') {
         await withAuthTimeout(signUp.prepareEmailAddressVerification({ strategy: 'email_code' }), 'The verification email took too long to send. Please try again.');
        setStep('verify');
        return;
      }

      setError('A few more account details are required. Please try again.');
    } catch (signUpError) {
      setError(clerkErrorMessage(signUpError, 'We could not create your account. Please check your details and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyEmail(event) {
    event.preventDefault();
    setError('');
    if (!code.trim()) {
      setError('Enter the verification code sent to your email.');
      return;
    }

    setIsSubmitting(true);
    try {
       const result = await withAuthTimeout(signUp.attemptEmailAddressVerification({ code: code.trim() }), 'Email verification timed out. Please try again.');
      if (await finishSignUp(result)) return;
      setError('That code was not accepted. Please request a new code and try again.');
    } catch (verificationError) {
      setError(clerkErrorMessage(verificationError, 'We could not verify that code. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    setError('');
    setIsResending(true);
    try {
       await withAuthTimeout(signUp.prepareEmailAddressVerification({ strategy: 'email_code' }), 'The verification email took too long to send. Please try again.');
    } catch (resendError) {
      setError(clerkErrorMessage(resendError, 'We could not send another code. Please try again.'));
    } finally {
      setIsResending(false);
    }
  }

  async function handleOAuth(strategy) {
    setError('');
    if (!isLoaded) return;
    setIsSubmitting(true);
    try {
       if (!await withAuthTimeout(verifyHuman('sign-up'), 'Human verification timed out. Please try again.')) return;
       await withAuthTimeout(signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: dashboardUrl,
        actionCompleteRedirectUrl: callbackUrl,
       }), 'The sign-in provider took too long to respond. Please try again.');
    } catch (oauthError) {
      setError(clerkErrorMessage(oauthError, 'We could not start that sign-up option. Please try again.'));
      setIsSubmitting(false);
    }
  }

  if (step === 'verify') {
    return (
      <section className={panelClassName} aria-labelledby="verify-sign-up-title">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#d9622c]/30 bg-[#d9622c]/10 text-[#f0d9b5]">
            <Mail className="h-5 w-5" />
          </div>
          <h1 id="verify-sign-up-title" className="font-heading text-4xl font-light text-[#f7f2ea]">Check your email</h1>
          <p className="mt-2 text-sm leading-6 text-white/55">Enter the verification code sent to {email}.</p>
        </div>

        <form onSubmit={verifyEmail} className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-white/55">Verification code</span>
            <input
              className={`${inputClassName} px-4 tracking-[0.35em]`}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="••••••"
              autoFocus
            />
          </label>
          {error && <p role="alert" className="rounded-xl border border-red-500/25 bg-red-950/45 px-4 py-3 text-sm text-red-100">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9f1f28] via-[#d9622c] to-[#e6c695] font-semibold tracking-wide text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70">
            {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Verify email
          </button>
        </form>

        <button type="button" onClick={resendCode} disabled={isResending} className="mt-5 w-full text-sm text-[#f0d9b5] transition hover:text-white disabled:opacity-60">
          {isResending ? 'Sending another code…' : 'Resend code'}
        </button>
        <Link to={`${basePath}/sign-in`} className="mt-4 block text-center text-sm text-white/55 transition hover:text-white">← Back to sign in</Link>
      </section>
    );
  }

  return (
    <section className={panelClassName} aria-labelledby="sign-up-title">
      <header className="mb-7 text-center">
        <img src={`${basePath}/forge-logo.png`} alt="" className="mx-auto mb-4 h-14 w-14 rounded-2xl object-cover shadow-[0_0_22px_rgba(217,98,44,0.36)]" />
        <h1 id="sign-up-title" className="font-heading text-4xl font-light tracking-wide text-[#f7f2ea]">Create your account</h1>
        <p className="mt-2 text-sm text-white/55">Join the Freedom Foundry portal</p>
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
        <span className="h-px flex-1 bg-white/10" /> or use email <span className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-white/55">First name</span>
            <span className="relative block">
              <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d9c9a3]/70" />
              <input className={inputClassName} type="text" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First" />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-white/55">Last name</span>
            <input className={`${inputClassName} px-4`} type="text" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last" />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-white/55">Email address</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d9c9a3]/70" />
            <input className={inputClassName} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-white/55">Password</span>
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d9c9a3]/70" />
            <input className={inputClassName} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" />
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] uppercase tracking-[0.16em] text-white/55">Confirm password</span>
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d9c9a3]/70" />
            <input className={inputClassName} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm your password" />
          </span>
        </label>

        <RecaptchaWidget
          action="sign_up"
          resetToken={captchaResetToken}
          onChange={handleCaptchaChange}
          onExpired={handleCaptchaExpired}
          onError={handleCaptchaError}
        />

        {error && <p role="alert" className="rounded-xl border border-red-500/25 bg-red-950/45 px-4 py-3 text-sm text-red-100">{error}</p>}

        <button type="submit" disabled={isSubmitting || !isLoaded} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#9f1f28] via-[#d9622c] to-[#e6c695] font-semibold tracking-wide text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70">
          {isSubmitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-white/55">
        Already have an account?{' '}
        <Link to={`${basePath}/sign-in`} className="font-medium text-[#f0d9b5] transition hover:text-white">Sign in</Link>
      </p>
    </section>
  );
}