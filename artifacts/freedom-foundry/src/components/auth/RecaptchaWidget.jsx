import { useEffect, useRef } from 'react';

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() || '';
const mode = import.meta.env.VITE_RECAPTCHA_MODE?.trim().toLowerCase() === 'v3' ? 'v3' : 'checkbox';
const scriptPromises = new Map();

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
  document.head.appendChild(script);
  return promise;
}

export default function RecaptchaWidget({ action, resetToken = 0, onChange, onExpired, onError }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const challengeRef = useRef(() => {});
  const callbacksRef = useRef({ onChange, onExpired, onError });

  callbacksRef.current = { onChange, onExpired, onError };

  useEffect(() => {
    let active = true;

    if (!siteKey) {
      callbacksRef.current.onError?.('Human verification is not configured yet.');
      return () => {
        active = false;
      };
    }

    loadRecaptcha()
      .then((grecaptcha) => {
        if (!active) return;

        if (mode === 'v3') {
          challengeRef.current = () => {
            grecaptcha.ready(() => {
              if (!active) return;
              grecaptcha.execute(siteKey, { action })
                .then((token) => {
                  if (active && token) callbacksRef.current.onChange?.(token);
                  else if (active) callbacksRef.current.onError?.('Human verification could not be completed. Please try again.');
                })
                .catch(() => callbacksRef.current.onError?.('Human verification could not be completed. Please try again.'));
            });
          };
          challengeRef.current();
          return;
        }

        if (!containerRef.current) return;
        widgetIdRef.current = grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          size: 'normal',
          callback: (token) => callbacksRef.current.onChange?.(token),
          'expired-callback': () => {
            callbacksRef.current.onExpired?.();
            callbacksRef.current.onChange?.('');
          },
          'error-callback': () => {
            callbacksRef.current.onError?.('Human verification could not be completed. Please try again.');
            callbacksRef.current.onChange?.('');
          },
        });
      })
      .catch(() => {
        if (active) callbacksRef.current.onError?.('Human verification could not load. Check your connection and try again.');
      });

    return () => {
      active = false;
      challengeRef.current = () => {};
    };
  }, [action]);

  useEffect(() => {
    if (resetToken <= 0) return;
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
        {mode === 'v3' && <span role="status" aria-live="polite">Verifying you’re human…</span>}
      </div>
      <p className="text-[11px] leading-5 text-white/40">
        This helps protect Freedom Foundry from automated abuse.
      </p>
    </div>
  );
}