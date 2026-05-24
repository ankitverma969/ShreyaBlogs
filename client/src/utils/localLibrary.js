function readList(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list.slice(0, 30)));
}

function readMap(key) {
  return JSON.parse(localStorage.getItem(key) || '{}');
}

function writeMap(key, map) {
  localStorage.setItem(key, JSON.stringify(map));
}

export function addRecentlyRead(post) {
  const next = [
    { ...post, lastReadAt: new Date().toISOString() },
    ...readList('recently_read_posts').filter((item) => item.slug !== post.slug)
  ];
  writeList('recently_read_posts', next);
}

export function toggleBookmark(post) {
  const current = readList('bookmarked_posts');
  const exists = current.some((item) => item.slug === post.slug);
  const next = exists ? current.filter((item) => item.slug !== post.slug) : [post, ...current];
  writeList('bookmarked_posts', next);
  return !exists;
}

export function isBookmarked(slug) {
  return readList('bookmarked_posts').some((item) => item.slug === slug);
}

export function saveReaction(postId, reaction) {
  localStorage.setItem(`reaction_${postId}`, reaction);
}

export function getSavedReaction(postId) {
  return localStorage.getItem(`reaction_${postId}`);
}

export function getLikedPosts() {
  return readMap('likedPosts');
}

export function hasLikedPost(postId) {
  return Boolean(getLikedPosts()[postId] || localStorage.getItem(`liked_${postId}`));
}

export function saveLikedPost(postId) {
  // Duplicate prevention is intentionally local-first: the UI stays liked immediately,
  // while the API still validates with fingerprint/IP so refreshes and other devices remain protected.
  writeMap('likedPosts', {
    ...getLikedPosts(),
    [postId]: true
  });
}

export function getBookmarks() {
  return readList('bookmarked_posts');
}

export function getReadingHistory() {
  return readList('recently_read_posts');
}
