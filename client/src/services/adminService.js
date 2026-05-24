import api from './api.js';

export const adminService = {
  login(credentials) {
    return api.post('/admin/login', credentials);
  },
  logout() {
    return api.post('/admin/logout');
  },
  me() {
    return api.get('/admin/me');
  },
  analytics() {
    return api.get('/admin/analytics');
  },
  posts(params = {}) {
    return api.get('/admin/posts', { params });
  },
  createPost(payload) {
    return api.post('/admin/posts', payload);
  },
  updatePost(id, payload) {
    return api.patch(`/admin/posts/${id}`, payload);
  },
  deletePost(id) {
    return api.delete(`/admin/posts/${id}`);
  },
  uploadMedia(formData) {
    return api.post('/admin/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  comments() {
    return api.get('/admin/comments');
  },
  moderateComment(id, action) {
    return api.patch(`/admin/comments/${id}`, { action });
  },
  moderationOverview() {
    return api.get('/admin/moderation');
  },
  createIdentityAction(payload) {
    return api.post('/admin/moderation/identities', payload);
  },
  removeIdentityAction(id) {
    return api.delete(`/admin/moderation/identities/${id}`);
  }
};
