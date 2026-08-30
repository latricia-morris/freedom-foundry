import { useEffect, useRef, useState } from 'react';

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() || '';
const mode = import.meta.env.VITE_RECAPTCHA_MODE?.trim().toLowerCase() === 'v3' ? 'v3' : 'checkbox';
const RECAPTCHA_TIMEOUT_MS = 12000;
const scriptPromises = new Map();

function withRecaptchaTimeout(promise, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(message)), RECAPTCHA_TIMEOUT_MS);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
    if (timer) window.clearTimeout(timer);
  });
}

function loadRecaptcha() {
  if (typeof window === 'undefined') return Promise.reject(new Error('reCAPTCHA requires a browser.'));
  if (window.grecaptcha) return Promise.resolve(window.grecaptcha);
  if (scriptPromises.has(mode)) return scriptPromises.get(mode);

  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = mode === 'v3'
    ? `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`
    : 'https://www.google.com/recaptcha/api.js?render=explicit';

  const promise = new Promise((resolve, reject) => {
    script.onload = () => window.grecaptcha ? resolve(window.grecaptcha) : reject(new Error('reCAPTCHA did not load.'));
    script.onerror = () => reject(new Error('reCAPTCHA could not load.'));
  });
  scriptPromises.set(mode, promise);
  promise.catch(() => {
    if (scriptPromises.get(mode) === promise) scriptPromises.delete(mode);
  });
  document.head.appendChild(script);
  return promise;
}

function waitForRecaptchaReady(grecaptcha) {
  return new Promise((resolve, reject) => {
    if (typeof grecaptcha?.ready !== 'function') {
      reject(new Error('reCAPTCHA did not finish initializing.'));
      return;
    }
    grecaptcha.ready(() => resolve(grecaptcha));
  });
}

export default function RecaptchaWidget({ action, resetToken = 0, onChange, onExpired, onError }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const challengeRef = useRef(() => {});
  const callbacksRef = useRef({ onChange, onExpired, onError });
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryToken, setRetryToken] = useState(0);

  callbacksRef.current = { onChange, onExpired, onError };

  function handleToken(token) {
    setIsVerified(Boolean(token));
    if (token) setErrorMessage('');
    callbacksRef.current.onChange?.(token);
  }

  function handleExpired() {
    setIsVerified(false);
    setErrorMessage('Human verification expired. Please complete it again.');
    callbacksRef.current.onExpired?.();
    callbacksRef.current.onChange?.('');
  }

  function handleError(message) {
    setIsVerified(false);
    setErrorMessage(message);
    callbacksRef.current.onError?.(message);
    callbacksRef.current.onChange?.('');
  }

  function retry() {
    setErrorMessage('');
    setIsVerified(false);
    callbacksRef.current.onChange?.('');
    setRetryToken((value) => value + 1);
  }

  useEffect(() => {
    let active = true;
    let refreshTimer;

    if (!siteKey) {
      handleError('Human verification is not configured yet.');
      return () => {
        active = false;
      };
    }

    withRecaptchaTimeout(loadRecaptcha(), 'Human verification could not load. Check that this site is allowed for the reCAPTCHA key.')
      .then((grecaptcha) => withRecaptchaTimeout(waitForRecaptchaReady(grecaptcha), 'Human verification did not finish loading. Please try again.'))
      .then((grecaptcha) => {
        if (!active) return;

        if (mode === 'v3') {
          challengeRef.current = () => {
            grecaptcha.ready(() => {
              if (!active) return;
              withRecaptchaTimeout(grecaptcha.execute(siteKey, { action }), 'Human verification timed out. Please try again.')
                .then((token) => {
                  if (active && token) handleToken(token);
                  else if (active) handleError('Human verification could not be completed. Please try again.');
                })
                .catch((executeError) => handleError(
                  executeError?.message?.toLowerCase().includes('timed out')
                    ? executeError.message
                    : 'Human verification could not be completed. Check that this domain is allowed for the reCAPTCHA key, then try again.',
                ));
            });
          };
          challengeRef.current();
          refreshTimer = window.setInterval(challengeRef.current, 90000);
          return;
        }

        if (!containerRef.current) return;
        widgetIdRef.current = grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          size: 'normal',
          callback: handleToken,
          'expired-callback': handleExpired,
          'error-callback': () => handleError('The verification service rejected this page. Check that this site is allowed for the reCAPTCHA key.'),
        });
      })
      .catch((loadError) => {
        if (!active) return;
        const lowerMessage = loadError?.message?.toLowerCase() || '';
        const detail = lowerMessage.includes('invalid key')
          ? 'The reCAPTCHA site key is not valid for this page. Check its Google domain and mode settings.'
          : lowerMessage.includes('timed out')
            ? loadError.message
            : 'Human verification could not load. Check that this domain is allowed for the reCAPTCHA key, then try again.';
        handleError(detail);
      });

    return () => {
      active = false;
      if (refreshTimer) window.clearInterval(refreshTimer);
      challengeRef.current = () => {};
    };
  }, [action, retryToken]);

  useEffect(() => {
    if (resetToken <= 0) return;
    setIsVerified(false);
    if (mode === 'v3') {
      challengeRef.current();
      return;
    }
    if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
      window.grecaptcha.reset(widgetIdRef.current);
    }
  }, [resetToken]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className={mode === 'v3' ? 'min-h-6 text-xs text-white/45' : 'min-h-[78px] overflow-hidden rounded-lg'}
        aria-label="Human verification"
      >
        {errorMessage
          ? <span role="alert" className="text-red-200">{errorMessage}</span>
          : mode === 'v3' && <span role="status" aria-live="polite">{isVerified ? 'Human verification ready.' : 'Verifying you’re human…'}</span>}
      </div>
      {errorMessage && <button type="button" onClick={retry} className="text-xs text-[#f0d9b5] underline underline-offset-4 hover:text-white">Try human verification again</button>}
      <p className="text-[11px] leading-5 text-white/40">
        This helps protect Freedom Foundry from automated abuse.
      </p>
    </div>
  );
}