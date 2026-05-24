export function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export function getBrowserInfo(req) {
  return req.headers['user-agent'] || 'Unknown browser';
}

export function getFingerprint(req) {
  return req.headers['x-client-fingerprint'] || req.body?.fingerprint || 'anonymous-browser';
}

export function getLocalToken(req) {
  return req.headers['x-local-reader-token'] || req.body?.localToken || '';
}

export function getApproxLocation(req) {
  return {
    city: req.headers['x-vercel-ip-city'] || req.headers['cf-ipcity'] || '',
    region: req.headers['x-vercel-ip-country-region'] || req.headers['cf-region'] || '',
    country: req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || ''
  };
}
