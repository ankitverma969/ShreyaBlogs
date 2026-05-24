export function cachePublic(seconds = 60) {
  return function setCacheHeader(_req, res, next) {
    res.set('Cache-Control', `public, max-age=${seconds}, stale-while-revalidate=${seconds * 2}`);
    next();
  };
}

export function noStore(_req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}
