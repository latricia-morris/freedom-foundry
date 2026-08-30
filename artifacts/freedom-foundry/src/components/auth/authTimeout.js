const AUTH_REQUEST_TIMEOUT_MS = 20000;

export function withAuthTimeout(promise, message = 'Authentication is taking too long. Please try again.') {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(message)), AUTH_REQUEST_TIMEOUT_MS);
  });

  return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
    if (timer) window.clearTimeout(timer);
  });
}