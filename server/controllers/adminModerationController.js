import AnalyticsEvent from '../models/AnalyticsEvent.js';
import Comment from '../models/Comment.js';
import ModerationIdentity from '../models/ModerationIdentity.js';
import ModerationLog from '../models/ModerationLog.js';
import { AppError } from '../utils/AppError.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isObjectId } from '../utils/query.js';

async function writeLog({ action, targetType, targetValue, reason = '', severity = 'safe', metadata = {} }) {
  return ModerationLog.create({ action, targetType, targetValue, reason, severity, metadata });
}

export const getModerationOverview = asyncHandler(async (_req, res) => {
  const [suspiciousComments, blockedIdentities, logs, spamStats, repeatedFingerprints] =
    await Promise.all([
      Comment.find({
        isDeleted: false,
        $or: [{ moderationLevel: { $ne: 'safe' } }, { isSpam: true }, { toxicityScore: { $gte: 0.35 } }]
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('postId', 'title slug')
        .lean(),
      ModerationIdentity.find().sort({ createdAt: -1 }).limit(100).lean(),
      ModerationLog.find().sort({ createdAt: -1 }).limit(80).lean(),
      Comment.aggregate([
        {
          $group: {
            _id: '$moderationLevel',
            count: { $sum: 1 },
            avgSpam: { $avg: '$spamScore' },
            avgToxicity: { $avg: '$toxicityScore' }
          }
        }
      ]),
      AnalyticsEvent.aggregate([
        { $match: { type: { $in: ['comment', 'like', 'reaction'] } } },
        { $group: { _id: '$fingerprint', count: { $sum: 1 }, ips: { $addToSet: '$ipAddress' } } },
        { $match: { count: { $gte: 5 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ])
    ]);

  sendSuccess(res, {
    data: {
    moderation: {
      suspiciousComments,
      blockedIdentities,
      logs,
      spamStats,
      repeatedFingerprints
    }
    }
  });
});

export const approveComment = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw new AppError('Invalid comment id', 400);
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError('Comment not found', 404);

  comment.isSpam = false;
  comment.isDeleted = false;
  comment.isIpBlocked = false;
  comment.isFingerprintShadowBanned = false;
  comment.moderationLevel = 'safe';
  comment.approvedAt = new Date();
  await comment.save();

  await writeLog({
    action: 'approve_comment',
    targetType: 'comment',
    targetValue: comment._id.toString(),
    severity: 'safe'
  });

  sendSuccess(res, { message: 'Comment approved', data: { comment } });
});

export const createIdentityAction = asyncHandler(async (req, res) => {
  const { type, value, status, reason = 'Admin moderation action' } = req.body;

  if (!['ip', 'fingerprint'].includes(type) || !['blocked', 'shadow_banned'].includes(status) || !value) {
    throw new AppError('Valid type, value, and status are required', 400);
  }

  const identity = await ModerationIdentity.findOneAndUpdate(
    { type, value, status },
    { type, value, status, reason, createdBy: req.admin?._id },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (type === 'ip' && status === 'blocked') {
    await Comment.updateMany({ ipAddress: value }, { isIpBlocked: true, moderationLevel: 'blocked' });
  }

  if (type === 'fingerprint' && status === 'shadow_banned') {
    await Comment.updateMany({ fingerprint: value }, { isFingerprintShadowBanned: true });
  }

  await writeLog({
    action: status,
    targetType: type,
    targetValue: value,
    reason,
    severity: status === 'blocked' ? 'blocked' : 'suspicious'
  });

  sendSuccess(res, {
    statusCode: 201,
    message: 'Moderation identity saved',
    data: { identity }
  });
});

export const removeIdentityAction = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw new AppError('Invalid moderation identity id', 400);
  const identity = await ModerationIdentity.findByIdAndDelete(req.params.id);
  if (!identity) throw new AppError('Moderation identity not found', 404);

  if (identity.type === 'ip') {
    await Comment.updateMany({ ipAddress: identity.value }, { isIpBlocked: false });
  }

  if (identity.type === 'fingerprint') {
    await Comment.updateMany({ fingerprint: identity.value }, { isFingerprintShadowBanned: false });
  }

  await writeLog({
    action: 'remove_identity_action',
    targetType: identity.type,
    targetValue: identity.value,
    severity: 'safe'
  });

  sendSuccess(res, { message: 'Moderation identity removed' });
});
