import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getDashboardAnalytics = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totalPosts, totalComments, totals, trendingPost, latestComments, recentUploads, eventStats, dailyVisitors, reactionAnalytics, topPosts] =
    await Promise.all([
      Post.countDocuments(),
      Comment.countDocuments({ isDeleted: false }),
      Post.aggregate([
        {
          $group: {
            _id: null,
            views: { $sum: '$views' },
            likes: { $sum: '$likes' }
          }
        }
      ]),
      Post.findOne().sort({ views: -1 }).lean(),
      Comment.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5).populate('postId', 'title').lean(),
      Post.find().sort({ createdAt: -1 }).limit(5).lean(),
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$fingerprint' },
            avgReadingTime: { $avg: '$readingTimeSeconds' }
          }
        }
      ]),
      AnalyticsEvent.aggregate([
        { $match: { createdAt: { $gte: since }, type: 'view' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            visitors: { $addToSet: '$fingerprint' },
            views: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      AnalyticsEvent.aggregate([
        { $match: { type: 'reaction', createdAt: { $gte: since } } },
        { $group: { _id: '$reaction', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Post.find().sort({ views: -1, likes: -1, shares: -1 }).limit(10).lean()
    ]);

  const viewStats = eventStats.find((item) => item._id === 'view');
  const bounceStats = eventStats.find((item) => item._id === 'bounce');
  const uniqueVisitorCount = viewStats?.uniqueVisitors?.length || 0;
  const totalTrackedViews = viewStats?.count || 0;

  sendSuccess(res, {
    data: {
    analytics: {
      totalPosts,
      totalComments,
      totalViews: totals[0]?.views || 0,
      totalLikes: totals[0]?.likes || 0,
      uniqueVisitors: uniqueVisitorCount,
      averageReadingTime: Math.round(viewStats?.avgReadingTime || 0),
      bounceRate: totalTrackedViews ? Math.round(((bounceStats?.count || 0) / totalTrackedViews) * 100) : 0,
      returningVisitors: Math.max(0, totalTrackedViews - uniqueVisitorCount),
      trendingPost,
      latestComments,
      recentUploads,
      eventStats,
      dailyVisitors: dailyVisitors.map((item) => ({
        label: item._id,
        value: item.visitors.length,
        views: item.views
      })),
      reactionAnalytics,
      topPosts,
      visitors: dailyVisitors.map((item) => ({
        label: item._id,
        value: item.visitors.length,
        views: item.views
      }))
    }
    }
  });
});
