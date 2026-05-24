import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fingerprintPromise;

export async function getClientFingerprintAsync() {
  const storageKey = 'poetic_client_fingerprint';
  const existing = localStorage.getItem(storageKey);

  if (existing) return existing;

  if (!fingerprintPromise) {
    fingerprintPromise = FingerprintJS.load()
      .then((agent) => agent.get())
      .then((result) => result.visitorId)
      .catch(() => crypto.randomUUID());
  }

  const visitorId = await fingerprintPromise;
  localStorage.setItem(storageKey, visitorId);
  return visitorId;
}

export function getClientFingerprint() {
  const storageKey = 'poetic_client_fingerprint';
  const existing = localStorage.getItem(storageKey);

  if (existing) return existing;

  const value = crypto.randomUUID();

  localStorage.setItem(storageKey, value);
  return value;
}

export function getLocalReaderToken() {
  const storageKey = 'poetic_local_reader_token';
  const existing = localStorage.getItem(storageKey);
  if (existing) return existing;

  const token = crypto.randomUUID();
  localStorage.setItem(storageKey, token);
  return token;
}
