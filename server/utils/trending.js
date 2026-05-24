export function getTrendingScore(post) {
  const ageHours = Math.max(1, (Date.now() - new Date(post.createdAt).getTime()) / 36e5);
  const reactionScore = Object.values(post.reactions || {}).reduce((sum, count) => sum + count, 0);

  return (post.views * 0.35 + post.likes * 2 + post.shares * 1.5 + reactionScore * 2.4) / ageHours ** 0.45;
}
