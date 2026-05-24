import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { publicService } from '../services/publicService.js';
import { formatCompactNumber } from '../utils/formatters.js';
import { hasLikedPost, saveLikedPost } from '../utils/localLibrary.js';

function LikeButton({ postId, initialCount = 0, size = 'compact', onLiked }) {
  const [liked, setLiked] = useState(() => Boolean(postId && hasLikedPost(postId)));
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [burstKey, setBurstKey] = useState(0);

  const label = useMemo(() => `${formatCompactNumber(count)} Likes`, [count]);

  useEffect(() => {
    setCount(initialCount);
    setLiked(Boolean(postId && hasLikedPost(postId)));
  }, [initialCount, postId]);

  const like = useCallback(async () => {
    if (!postId || loading || liked) return;

    setLiked(true);
    setLoading(true);
    setCount((current) => current + 1);
    setBurstKey((current) => current + 1);
    saveLikedPost(postId);

    try {
      const { data } = await publicService.like(postId);
      setCount(data.likes);
      onLiked?.({ likes: data.likes, counted: data.counted });
    } catch (error) {
      const alreadyCounted = error.response?.status === 409 || error.response?.status === 429;
      if (!alreadyCounted) {
        setLiked(false);
        setCount((current) => Math.max(0, current - 1));
      }
    } finally {
      setLoading(false);
    }
  }, [liked, loading, onLiked, postId]);

  return (
    <motion.button
      type="button"
      className={`like-button like-button-${size} ${liked ? 'is-liked' : ''}`}
      onClick={like}
      disabled={!postId || loading || liked}
      aria-pressed={liked}
      aria-label={liked ? `Liked. ${label}` : `Like this writing. ${label}`}
      whileHover={{ y: liked ? 0 : -2 }}
      whileTap={{ scale: 0.94 }}
    >
      <span className="like-heart-wrap" aria-hidden="true">
        <motion.span
          className="like-heart-motion"
          animate={liked ? { scale: [1, 1.35, 1], rotate: [0, -8, 0] } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.42, ease: 'easeOut' }}
        >
          <span className="like-heart" />
        </motion.span>
        <AnimatePresence>
          {burstKey > 0 && (
            <span key={burstKey} className="heart-burst">
              {[0, 1, 2, 3, 4].map((item) => (
                <motion.span
                  key={item}
                  className="tiny-heart"
                  initial={{ opacity: 0, scale: 0.4, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.45, 1, 0.75],
                    x: [-18, -8, 0, 10, 18][item],
                    y: [-18, -30, -24, -34, -20][item]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.72, delay: item * 0.025, ease: 'easeOut' }}
                />
              ))}
            </span>
          )}
        </AnimatePresence>
      </span>
      <span className="like-label">{label}</span>
      {loading && <span className="like-loading" aria-hidden="true" />}
    </motion.button>
  );
}

export default memo(LikeButton);
