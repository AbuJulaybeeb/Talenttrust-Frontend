import { safeStorage } from './safeStorage';

const ATTEMPTS_KEY = 'login_throttle_attempts';
const COOLDOWN_KEY = 'login_throttle_cooldown';

const BASE_BACKOFF_MS = 5_000;
const BACKOFF_FACTOR = 5;
const MAX_BACKOFF_MS = 300_000;

export function getBackoffDuration(attempts: number): number {
  if (attempts <= 1) return 0;
  const exponent = attempts - 2;
  const duration = BASE_BACKOFF_MS * Math.pow(BACKOFF_FACTOR, exponent);
  return Math.min(duration, MAX_BACKOFF_MS);
}

export function getStoredAttempts(): number {
  const val = safeStorage.getItem(ATTEMPTS_KEY);
  if (val === null) return 0;
  const parsed = parseInt(val, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function getStoredCooldownUntil(): number {
  const val = safeStorage.getItem(COOLDOWN_KEY);
  if (val === null) return 0;
  const parsed = parseInt(val, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function getRemainingCooldownMs(): number {
  const cooldownUntil = getStoredCooldownUntil();
  if (cooldownUntil === 0) return 0;
  const remaining = cooldownUntil - Date.now();
  return Math.max(0, remaining);
}

export function recordAttempt(): { attempts: number; cooldownUntil: number } {
  const currentAttempts = getStoredAttempts();
  const attempts = currentAttempts + 1;
  const durationMs = getBackoffDuration(attempts);
  const cooldownUntil = durationMs > 0 ? Date.now() + durationMs : 0;

  safeStorage.setItem(ATTEMPTS_KEY, String(attempts));
  if (cooldownUntil > 0) {
    safeStorage.setItem(COOLDOWN_KEY, String(cooldownUntil));
  }

  return { attempts, cooldownUntil };
}

export function resetThrottle(): void {
  safeStorage.removeItem(ATTEMPTS_KEY);
  safeStorage.removeItem(COOLDOWN_KEY);
}
