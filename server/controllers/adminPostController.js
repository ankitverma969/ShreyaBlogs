import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Post from '../models/Post.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { escapeRegex, normalizeSearch, toPositiveInt } from '../utils/query.js';
import { slugify } from '../utils/slugify.js';
import {
  assertOneOf,
  assertRequired,
  normalizeCategory,
  normalizeLanguage,
  normalizeNumber,
  normalizeReactions,
  normalizeTags,
  parseMedia
} from '../utils/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, '..', 'uploads');

function fileToMedia(file) {
  const isVideo = file.mimetype === 'video/mp4';

  return {
    url: `/uploads/${file.filename}`,
    type: isVideo ? 'video' : 'image',
    alt: file.originalname
  };
}

export const uploadMedia = asyncHandler(async (req, res) => {
  const files = req.files || {};
  const uploaded = {};

  if (files.coverImage?.[0]) {
    uploaded.coverImage = `/uploads/${files.coverImage[0].filename}`;
  }

  uploaded.media = [...(files.images || []), ...(files.video || [])].map(fileToMedia);

  sendSuccess(res, {
    statusCode: 201,
    message: 'Media uploaded',
    data: { uploaded }
  });
});

export const listPosts = asyncHandler(async (req, res) => {
  const { search = '', category = 'All', status = 'all', language = 'all' } = req.query;
  const page = toPositiveInt(req.query.page, 1, 500);
  const limit = toPositiveInt(req.query.limit, 12, 50);
  const skip = (page - 1) * limit;
  const filter = {};
  const normalizedSearch = normalizeSearch(search);

  if (normalizedSearch) filter.$text = { $search: normalizedSearch };
  if (category !== 'All') filter.category = normalizeCategory(category);
  if (status !== 'all') filter.status = status;
  if (language !== 'all') filter.language = normalizeLanguage(language);

  const [posts, total] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Post.countDocuments(filter)
  ]);

  sendSuccess(res, {
    data: { posts, pagination: getPagination({ page, limit, total }) }
  });
});

export const createPost = asyncHandler(async (req, res) => {
  const { title, content, category, coverImage = '', status = 'draft', language = 'hindi' } = req.body;

  assertRequired(title, 'Title is required');
  assertRequired(content, 'Content is required');
  assertRequired(category, 'Category is required');
  assertOneOf(status, ['draft', 'published', 'unpublished'], 'Invalid status');

  const baseSlug = slugify(title);
  const existingCount = await Post.countDocuments({ slug: new RegExp(`^${escapeRegex(baseSlug)}(?:-\\d+)?$`) });
  const slug = existingCount ? `${baseSlug}-${existingCount + 1}` : baseSlug;

  const post = await Post.create({
    title,
    slug,
    content,
    language: normalizeLanguage(language),
    category: normalizeCategory(category),
    tags: normalizeTags(req.body.tags),
    coverImage,
    media: parseMedia(req.body.media),
    status,
    isFeatured: Boolean(req.body.isFeatured),
    homepageSection: req.body.homepageSection || 'default',
    publishedAt: status === 'published' ? new Date() : null
  });

  sendSuccess(res, {
    statusCode: 201,
    message: status === 'published' ? 'Post published' : 'Draft saved',
    data: { post }
  });
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  if (req.body.status !== undefined) assertOneOf(req.body.status, ['draft', 'published', 'unpublished'], 'Invalid status');
  if (req.body.homepageSection !== undefined) {
    assertOneOf(req.body.homepageSection, ['default', 'hero', 'featured', 'latest'], 'Invalid homepage section');
  }

  ['title', 'content', 'coverImage', 'status', 'homepageSection'].forEach((field) => {
    if (req.body[field] !== undefined) post[field] = req.body[field];
  });

  if (req.body.language !== undefined) post.language = normalizeLanguage(req.body.language);
  if (req.body.category !== undefined) post.category = normalizeCategory(req.body.category);
  if (req.body.tags !== undefined) post.tags = normalizeTags(req.body.tags);
  if (req.body.media !== undefined) post.media = parseMedia(req.body.media);
  if (req.body.isFeatured !== undefined) post.isFeatured = Boolean(req.body.isFeatured);
  if (req.body.likes !== undefined) post.likes = normalizeNumber(req.body.likes, post.likes);
  if (req.body.views !== undefined) post.views = normalizeNumber(req.body.views, post.views);
  if (req.body.shares !== undefined) post.shares = normalizeNumber(req.body.shares, post.shares);
  if (req.body.reactions !== undefined) post.reactions = normalizeReactions(req.body.reactions);
  if (post.status === 'published' && !post.publishedAt) post.publishedAt = new Date();

  await post.save();

  sendSuccess(res, {
    message: 'Post updated',
    data: { post }
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  [post.coverImage, ...post.media.map((item) => item.url)].filter(Boolean).forEach((url) => {
    const fileName = path.basename(url);
    const localPath = path.resolve(uploadRoot, fileName);
    if (!localPath.startsWith(uploadRoot)) return;
    if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
  });

  const io = req.app.get('io');
  if (io) {
    io.emit('postDeleted', req.params.id);
  }

  sendSuccess(res, { message: 'Post deleted' });
});
