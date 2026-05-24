import { AppError } from './AppError.js';

export function assertRequired(value, message) {
  if (value === undefined || value === null || String(value).trim() === '') {
    throw new AppError(message, 400);
  }
}

export function assertOneOf(value, allowed, message) {
  if (!allowed.includes(value)) {
    throw new AppError(message, 400);
  }
}

export function normalizeTags(tags) {
  const normalized = Array.isArray(tags)
    ? tags
    : typeof tags === 'string'
      ? tags.split(',')
      : [];

  return [...new Set(normalized.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 12);
}

export function normalizeCategory(category) {
  return String(category || '').trim().slice(0, 80);
}

export function normalizeLanguage(language) {
  return ['english', 'hindi', 'mixed'].includes(language) ? language : 'hindi';
}

export function normalizeNumber(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.floor(number));
}

export function normalizeReactions(reactions = {}) {
  return {
    loved: normalizeNumber(reactions.loved),
    emotional: normalizeNumber(reactions.emotional),
    beautiful: normalizeNumber(reactions.beautiful),
    painful: normalizeNumber(reactions.painful),
    powerful: normalizeNumber(reactions.powerful)
  };
}

export function parseMedia(media) {
  if (!media) return [];
  if (Array.isArray(media)) return media;

  try {
    const parsed = JSON.parse(media);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    throw new AppError('Media payload must be valid JSON', 400);
  }
}
