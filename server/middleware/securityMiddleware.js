import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss';

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return xss(value.trim());
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeValue(nestedValue)])
    );
  }

  return value;
}

// Sanitizes body/query/params payloads before controllers touch them.
export function sanitizeRequest(req, _res, next) {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
}

export const mongoSanitizeMiddleware = mongoSanitize({
  replaceWith: '_'
});
