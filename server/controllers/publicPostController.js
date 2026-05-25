import mongoose from 'mongoose';
import Post from '../models/Post.js';
import PublicInteraction from '../models/PublicInteraction.js';
import { trackEvent } from '../services/analyticsService.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex, isObjectId, normalizeSearch, toPositiveInt } from '../utils/query.js';
import { getBrowserInfo, getClientIp, getFingerprint } from '../utils/requestMeta.js';
import { getTrendingScore } from '../utils/trending.js';

const allowedReactions = ['loved', 'emotional', 'beautiful', 'painful', 'powerful'];

function publicFilter() {
  return { status: 'published' };
}

function buildSearchFilter(query) {
  const filter = publicFilter();
  const search = normalizeSearch(query.search);

  if (query.category && query.category !== 'All') filter.category = query.category;
  if (query.tag) filter.tags = normalizeSearch(query.tag, 40);
  if (query.language && query.language !== 'all') filter.language = query.language;
  if (search) filter.$text = { $search: search };

  return filter;
}

export const getPosts = asyncHandler(async (req, res) => {
  const page = toPositiveInt(req.query.page, 1, 500);
  const limit = toPositiveInt(req.query.limit, 9, 18);
  const skip = (page - 1) * limit;
  const sortMode = req.query.sort || 'latest';
  const filter = buildSearchFilter(req.query);
  const sort = sortMode === 'trending' ? { views: -1, likes: -1, shares: -1, createdAt: -1 } : { publishedAt: -1, createdAt: -1 };

  const [posts, total] = await Promise.all([
    Post.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter)
  ]);

  sendSuccess(res, {
    data: { posts, pagination: getPagination({ page, limit, total }) }
  });
});

export const getPostBySlug = asyncHandler(async (req, res) => {
  const post = await Post.findOne({ slug: normalizeSearch(req.params.slug, 180), ...publicFilter() }).lean();

  if (!post) {
    throw new AppError('Writing not found', 404);
  }

  let suggestedPosts = await Post.find({
    ...publicFilter(),
    _id: { $ne: post._id },
    category: post.category
  }).sort({ publishedAt: -1, createdAt: -1 }).select('slug title category language').limit(3).lean();

  if (suggestedPosts.length < 3) {
    const morePosts = await Post.find({
      ...publicFilter(),
      _id: { $ne: post._id, $nin: suggestedPosts.map(p => p._id) }
    }).sort({ publishedAt: -1, createdAt: -1 }).select('slug title category language').limit(3 - suggestedPosts.length).lean();
    suggestedPosts = [...suggestedPosts, ...morePosts];
  }

  sendSuccess(res, { data: { post, suggestedPosts } });
});

export const getTrendingPosts = asyncHandler(async (_req, res) => {
  const posts = await Post.find(publicFilter()).sort({ views: -1, likes: -1, shares: -1 }).limit(48).lean();
  const trending = posts
    .map((post) => ({ post, score: getTrendingScore(post) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 9)
    .map((item) => item.post);

  sendSuccess(res, { data: { posts: trending } });
});

export const getLatestPosts = asyncHandler(async (_req, res) => {
  const posts = await Post.find(publicFilter()).sort({ publishedAt: -1, createdAt: -1 }).limit(9).lean();
  sendSuccess(res, { data: { posts } });
});

async function createInteraction({ postId, type, reaction, req, cooldownMinutes = 0 }) {
  const ipAddress = getClientIp(req);
  const fingerprint = getFingerprint(req);
  const recentQuery = {
    postId,
    type,
    fingerprint
  };

  if (cooldownMinutes) {
    recentQuery.createdAt = { $gte: new Date(Date.now() - cooldownMinutes * 60 * 1000) };
  }

  const existing = await PublicInteraction.findOne(recentQuery);

  if (existing) {
    return { created: false };
  }

  await PublicInteraction.create({
    postId,
    type,
    reaction,
    ipAddress,
    fingerprint,
    userAgent: getBrowserInfo(req)
  });

  await trackEvent(req, { postId, type, reaction });

  return { created: true };
}

export const likePost = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw new AppError('Invalid writing id', 400);
  const post = await Post.findById(req.params.id);
  if (!post || post.status !== 'published') throw new AppError('Writing not found', 404);

  const ipAddress = getClientIp(req);
  const ipCooldownMinutes = Number(process.env.LIKE_IP_COOLDOWN_MINUTES) || 10;
  const recentIpLike = await PublicInteraction.findOne({
    postId: post._id,
    type: 'like',
    ipAddress,
    createdAt: { $gte: new Date(Date.now() - ipCooldownMinutes * 60 * 1000) }
  });

  if (recentIpLike) {
    sendSuccess(res, {
      data: {
        counted: false,
        likes: post.likes,
        message: 'You already liked this writing'
      }
    });
    return;
  }

  const interaction = await createInteraction({ postId: post._id, type: 'like', req });

  if (interaction.created) {
    post.likes += 1;
    await post.save();
  }

  sendSuccess(res, {
    data: {
    counted: interaction.created,
    likes: post.likes,
    message: interaction.created ? 'Like counted' : 'You already liked this writing'
    }
  });
});

export const reactToPost = asyncHandler(async (req, res) => {
  const { reaction } = req.body;

  if (!allowedReactions.includes(reaction)) {
    throw new AppError('Invalid reaction type', 400);
  }

  if (!isObjectId(req.params.id)) throw new AppError('Invalid writing id', 400);
  const post = await Post.findById(req.params.id);
  if (!post || post.status !== 'published') throw new AppError('Writing not found', 404);

  const interaction = await createInteraction({ postId: post._id, type: 'reaction', reaction, req });

  if (interaction.created) {
    post.reactions[reaction] = (post.reactions[reaction] || 0) + 1;
    await post.save();
  }

  sendSuccess(res, {
    data: {
    counted: interaction.created,
    reactions: post.reactions,
    message: interaction.created ? 'Reaction saved' : 'You already reacted to this writing'
    }
  });
});

export const viewPost = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw new AppError('Invalid writing id', 400);
  const postId = new mongoose.Types.ObjectId(req.params.id);
  const readingTimeSeconds = Math.max(0, Number(req.body.readingTimeSeconds) || 0);
  const interaction = await createInteraction({
    postId,
    type: 'view',
    req,
    cooldownMinutes: Number(process.env.VIEW_COOLDOWN_MINUTES) || 60
  });

  if (interaction.created) {
    await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });
  } else if (readingTimeSeconds > 0) {
    await trackEvent(req, { postId, type: 'read_complete', readingTimeSeconds });
  }

  sendSuccess(res, { data: { counted: interaction.created } });
});

export const sharePost = asyncHandler(async (req, res) => {
  if (!isObjectId(req.params.id)) throw new AppError('Invalid writing id', 400);
  const post = await Post.findById(req.params.id);
  if (!post || post.status !== 'published') throw new AppError('Writing not found', 404);

  post.shares += 1;
  await post.save();
  await trackEvent(req, { postId: post._id, type: 'share' });

  sendSuccess(res, { data: { shares: post.shares } });
});

export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const search = normalizeSearch(req.query.q, 50);

  if (search.length < 2) {
    sendSuccess(res, { data: { suggestions: [] } });
    return;
  }

  const pattern = new RegExp(escapeRegex(search), 'i');
  const posts = await Post.find({
    ...publicFilter(),
    $or: [
      { title: pattern },
      { tags: pattern },
      { category: pattern },
      { content: pattern }
    ]
  })
    .select('title slug category tags language')
    .limit(8)
    .lean();

  sendSuccess(res, { data: { suggestions: posts } });
});

export const getPublicStats = asyncHandler(async (_req, res) => {
  const [featured, trending, latest, categories, hindiFeatured, hindiTrending] = await Promise.all([
    Post.findOne({ ...publicFilter(), isFeatured: true }).sort({ publishedAt: -1, createdAt: -1 }).lean(),
    Post.find(publicFilter()).sort({ views: -1, likes: -1, shares: -1 }).limit(48).lean(),
    Post.find(publicFilter()).sort({ publishedAt: -1, createdAt: -1 }).limit(6).lean(),
    Post.aggregate([
      { $match: publicFilter() },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Post.findOne({ ...publicFilter(), language: 'hindi' }).sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 }).lean(),
    Post.find({ ...publicFilter(), language: { $in: ['hindi', 'mixed'] } }).sort({ views: -1, likes: -1, shares: -1 }).limit(24).lean()
  ]);

  sendSuccess(res, {
    data: {
    featured: featured || latest[0] || null,
    trending: trending
      .map((post) => ({ post, score: getTrendingScore(post) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => item.post),
    latest,
    categories,
    hindiFeatured,
    hindiTrending: hindiTrending
      .map((post) => ({ post, score: getTrendingScore(post) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((item) => item.post)
    }
  });
});

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Post.aggregate([
    { $match: publicFilter() },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  sendSuccess(res, {
    data: {
      categories: categories.map((item) => ({ name: item._id, count: item.count }))
    }
  });
});
