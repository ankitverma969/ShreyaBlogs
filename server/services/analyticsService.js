import AnalyticsEvent from '../models/AnalyticsEvent.js';
import { getBrowserInfo, getClientIp, getFingerprint, getLocalToken } from '../utils/requestMeta.js';

export function trackEvent(req, { postId = null, type, reaction = '', readingTimeSeconds = 0, metadata = {} }) {
  return AnalyticsEvent.create({
    postId,
    type,
    reaction,
    ipAddress: getClientIp(req),
    fingerprint: getFingerprint(req),
    localToken: getLocalToken(req),
    userAgent: getBrowserInfo(req),
    readingTimeSeconds,
    metadata
  });
}
