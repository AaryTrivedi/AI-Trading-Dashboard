export interface RetryOptions {
  attempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  shouldRetry?: (error: unknown) => boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryWithBackoff<T>(
  task: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      const retryAllowed = options.shouldRetry == null || options.shouldRetry(error);
      if (!retryAllowed || attempt === options.attempts) break;

      const exponential = options.baseDelayMs * 2 ** (attempt - 1);
      const jitter = Math.floor(Math.random() * options.baseDelayMs);
      const delayMs = Math.min(options.maxDelayMs, exponential + jitter);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer != null) clearTimeout(timer);
  }
}
