import ModerationIdentity from '../models/ModerationIdentity.js';

const spamKeywords = ['free money', 'click here', 'buy now', 'crypto profit', 'telegram me'];
const toxicKeywords = ['hate', 'kill', 'stupid', 'idiot', 'trash', 'die'];
const hateKeywords = ['terrorist', 'nazi'];

export function analyzeComment(message) {
  const lowered = message.toLowerCase();
  const reasons = [];

  const linkCount = (message.match(/https?:\/\//gi) || []).length;
  const emojiCount = (message.match(/[\u{1F300}-\u{1FAFF}]/gu) || []).length;
  const repeatedCharacters = /(.)\1{6,}/.test(message);
  const spamHits = spamKeywords.filter((keyword) => lowered.includes(keyword));
  const toxicHits = toxicKeywords.filter((keyword) => lowered.includes(keyword));
  const hateHits = hateKeywords.filter((keyword) => lowered.includes(keyword));

  let spamScore = 0;
  let toxicityScore = 0;

  if (linkCount > 0) {
    spamScore += Math.min(0.55, linkCount * 0.22);
    reasons.push('suspicious_link');
  }

  if (emojiCount > 10) {
    spamScore += 0.25;
    reasons.push('emoji_spam');
  }

  if (repeatedCharacters) {
    spamScore += 0.24;
    reasons.push('repeated_characters');
  }

  if (spamHits.length) {
    spamScore += spamHits.length * 0.25;
    reasons.push('spam_keywords');
  }

  if (toxicHits.length) {
    toxicityScore += toxicHits.length * 0.24;
    reasons.push('toxic_language');
  }

  if (hateHits.length) {
    toxicityScore += hateHits.length * 0.4;
    reasons.push('hate_content');
  }

  spamScore = Math.min(1, spamScore);
  toxicityScore = Math.min(1, toxicityScore);

  let moderationLevel = 'safe';
  if (spamScore >= 0.8 || toxicityScore >= 0.8) moderationLevel = 'blocked';
  else if (spamScore >= 0.45 || toxicityScore >= 0.35 || reasons.length) moderationLevel = 'suspicious';

  return {
    spamScore,
    toxicityScore,
    moderationLevel,
    moderationReasons: reasons
  };
}

export async function getIdentityStatus({ ipAddress, fingerprint }) {
  const identities = await ModerationIdentity.find({
    $or: [
      { type: 'ip', value: ipAddress },
      { type: 'fingerprint', value: fingerprint }
    ]
  });

  return {
    isIpBlocked: identities.some((item) => item.type === 'ip' && item.status === 'blocked'),
    isFingerprintShadowBanned: identities.some(
      (item) => item.type === 'fingerprint' && item.status === 'shadow_banned'
    )
  };
}
