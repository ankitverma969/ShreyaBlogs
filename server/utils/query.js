export function toPositiveInt(value, fallback, max = 100) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

export function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeSearch(value = '', maxLength = 80) {
  return String(value).trim().slice(0, maxLength);
}

export function isObjectId(value) {
  return /^[a-f\d]{24}$/i.test(String(value));
}
