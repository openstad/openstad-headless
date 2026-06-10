/**
 * Helpers for retrying a database operation when MySQL reports a transaction
 * deadlock (ER_LOCK_DEADLOCK / errno 1213). Extracted so the retry logic can be
 * unit-tested independently of the vote route that uses it.
 */

const isDeadlockError = (err) => {
  const code = err?.parent?.code || err?.original?.code || err?.code;
  const errno = err?.parent?.errno || err?.original?.errno || err?.errno;
  return code === 'ER_LOCK_DEADLOCK' || errno === 1213;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withDeadlockRetry = async (fn, maxAttempts = 3) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (isDeadlockError(err) && attempt < maxAttempts) {
        const code = err?.parent?.code || err?.original?.code || err?.code;
        const errno = err?.parent?.errno || err?.original?.errno || err?.errno;
        console.warn('vote deadlock retry', {
          attempt,
          maxAttempts,
          code,
          errno,
        });
        await wait(20 * attempt);
        continue;
      }
      throw err;
    }
  }
};

module.exports = { isDeadlockError, wait, withDeadlockRetry };
