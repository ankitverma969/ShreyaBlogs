import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import PublicInteraction from '../models/PublicInteraction.js';
import { trackEvent } from '../services/analyticsService.js';
import { analyzeComment, getIdentityStatus } from '../services/moderationService.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isObjectId, toPositiveInt } from '../utils/query.js';
import { getApproxLocation, getBrowserInfo, getClientIp, getFingerprint } from '../utils/requestMeta.js';

function sendPublicComment(comment) {
  return {
    _id: comment._id,
    postId: comment.postId,
    username: comment.username,
    message: comment.message,
    createdAt: comment.createdAt
  };
}

export const createComment = asyncHandler(async (req, res) => {
  const { postId, username = '~ Anonymous', message } = req.body;

  if (!postId || !isObjectId(postId) || !message) {
    throw new AppError('Comment message is required', 400);
  }

  if (message.length < 2 || message.length > 1200) {
    throw new AppError('Comment must be between 2 and 1200 characters', 400);
  }

  const post = await Post.findById(postId);
  if (!post || post.status !== 'published') throw new AppError('Writing not found', 404);

  const ipAddress = getClientIp(req);
  const fingerprint = getFingerprint(req);
  const identityStatus = await getIdentityStatus({ ipAddress, fingerprint });
  const cooldownMinutes = Number(process.env.COMMENT_COOLDOWN_MINUTES) || 3;
  const recentComment = await PublicInteraction.findOne({
    postId,
    type: 'comment',
    fingerprint,
    createdAt: { $gte: new Date(Date.now() - cooldownMinutes * 60 * 1000) }
  });

  if (recentComment) {
    throw new AppError('Please wait a little before leaving another comment', 429);
  }

  if (identityStatus.isIpBlocked) {
    throw new AppError('Comments are currently unavailable', 403);
  }

  await PublicInteraction.create({
    postId,
    type: 'comment',
    ipAddress,
    fingerprint,
    userAgent: getBrowserInfo(req)
  });

  await trackEvent(req, { postId, type: 'comment' });

  const moderation = analyzeComment(message);
  const isShadowBanned = identityStatus.isFingerprintShadowBanned || moderation.moderationLevel === 'blocked';

  const comment = await Comment.create({
    postId,
    username: username?.trim() || '~ Anonymous',
    message,
    ipAddress,
    location: getApproxLocation(req),
    fingerprint,
    browserInfo: getBrowserInfo(req),
    isSpam: moderation.spamScore >= 0.8,
    isFingerprintShadowBanned: isShadowBanned,
    spamScore: moderation.spamScore,
    toxicityScore: moderation.toxicityScore,
    moderationLevel: moderation.moderationLevel,
    moderationReasons: moderation.moderationReasons
  });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Comment added',
    data: { comment: sendPublicComment(comment) }
  });
});

export const getComments = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.postId)) throw new AppError('Invalid writing id', 400);
  const fingerprint = getFingerprint(req);
  const limit = toPositiveInt(req.query.limit, 50, 80);
  const comments = await Comment.find({
    postId: req.params.postId,
    isDeleted: false,
    isIpBlocked: false,
    $or: [
      { isSpam: false, isFingerprintShadowBanned: false, moderationLevel: { $ne: 'blocked' } },
      { fingerprint }
    ]
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  sendSuccess(res, { data: { comments: comments.map(sendPublicComment) } });
});
