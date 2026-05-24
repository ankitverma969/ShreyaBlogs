import Comment from '../models/Comment.js';
import ModerationIdentity from '../models/ModerationIdentity.js';
import ModerationLog from '../models/ModerationLog.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isObjectId, toPositiveInt } from '../utils/query.js';

export const listComments = asyncHandler(async (req, res) => {
  const page = toPositiveInt(req.query.page, 1, 500);
  const limit = toPositiveInt(req.query.limit, 50, 100);
  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    Comment.find({ isDeleted: false })
      .populate('postId', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments({ isDeleted: false })
  ]);

  sendSuccess(res, {
    data: { comments, pagination: getPagination({ page, limit, total }) }
  });
});

export const moderateComment = asyncHandler(async (req, res) => {
  const { action } = req.body;
  if (!isObjectId(req.params.id)) throw new AppError('Invalid comment id', 400);
  if (!['delete', 'spam', 'approve', 'blockIp', 'shadowBan'].includes(action)) {
    throw new AppError('Invalid moderation action', 400);
  }

  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  if (action === 'delete') comment.isDeleted = true;
  if (action === 'spam') comment.isSpam = true;
  if (action === 'approve') {
    comment.isSpam = false;
    comment.isDeleted = false;
    comment.moderationLevel = 'safe';
    comment.approvedAt = new Date();
  }
  if (action === 'blockIp') {
    comment.isIpBlocked = true;
    comment.moderationLevel = 'blocked';
    await ModerationIdentity.findOneAndUpdate(
      { type: 'ip', value: comment.ipAddress, status: 'blocked' },
      { type: 'ip', value: comment.ipAddress, status: 'blocked', reason: 'Blocked from comment moderation' },
      { upsert: true, new: true }
    );
  }
  if (action === 'shadowBan') {
    comment.isFingerprintShadowBanned = true;
    await ModerationIdentity.findOneAndUpdate(
      { type: 'fingerprint', value: comment.fingerprint, status: 'shadow_banned' },
      {
        type: 'fingerprint',
        value: comment.fingerprint,
        status: 'shadow_banned',
        reason: 'Shadow banned from comment moderation'
      },
      { upsert: true, new: true }
    );
  }

  await comment.save();
  await ModerationLog.create({
    action,
    targetType: 'comment',
    targetValue: comment._id.toString(),
    severity: comment.moderationLevel,
    metadata: {
      ipAddress: comment.ipAddress,
      fingerprint: comment.fingerprint
    }
  });

  sendSuccess(res, {
    message: 'Comment moderated',
    data: { comment }
  });
});
