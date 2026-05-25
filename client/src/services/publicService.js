import api from './api.js';
import { getClientFingerprint, getLocalReaderToken } from '../utils/fingerprint.js';

function fingerprintHeaders() {
  return {
    'x-client-fingerprint': getClientFingerprint(),
    'x-local-reader-token': getLocalReaderToken()
  };
}

export const publicService = {
  home() {
    return api.get('/posts/home');
  },
  posts(params = {}) {
    return api.get('/posts', { params });
  },
  latest() {
    return api.get('/posts/latest');
  },
  trending() {
    return api.get('/posts/trending');
  },
  categories() {
    return api.get('/posts/categories');
  },
  post(slug) {
    return api.get(`/posts/${slug}`);
  },
  suggestions(q) {
    return api.get('/posts/suggestions', { params: { q } });
  },
  like(postId) {
    return api.post(`/posts/${postId}/like`, {}, { headers: fingerprintHeaders() });
  },
  react(postId, reaction) {
    return api.post(`/posts/${postId}/react`, { reaction }, { headers: fingerprintHeaders() });
  },
  view(postId, payload = {}) {
    return api.post(`/posts/${postId}/view`, payload, { headers: fingerprintHeaders() });
  },
  share(postId) {
    return api.post(`/posts/${postId}/share`, {}, { headers: fingerprintHeaders() });
  },
  comments(postId) {
    return api.get(`/comments/${postId}`);
  },
  createComment(payload) {
    return api.post('/comments/create', payload, { headers: fingerprintHeaders() });
  },
  contact(payload) {
    return api.post('/contact', payload);
  }
};
