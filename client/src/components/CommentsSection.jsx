import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { publicService } from '../services/publicService.js';

function CommentsSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [form, setForm] = useState({ username: '', message: '' });
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!postId) return;
    publicService
      .comments(postId)
      .then(({ data }) => setComments(data.comments))
      .catch(() => setComments([]));
  }, [postId]);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submitComment(event) {
    event.preventDefault();
    setStatus('');

    try {
      const { data } = await publicService.createComment({
        postId,
        username: form.username || '~ Anonymous',
        message: form.message
      });
      setComments((current) => [data.comment, ...current]);
      setForm({ username: '', message: '' });
      setStatus('Your note has been added.');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to add comment.');
    }
  }

  return (
    <section className="comments-section">
      <div className="section-heading">
        <p className="eyebrow">Reader notes</p>
        <h2>Anonymous comments</h2>
      </div>

      <form className="comment-compose" onSubmit={submitComment}>
        <input name="username" value={form.username} onChange={updateField} placeholder="Name, optional" />
        <textarea name="message" value={form.message} onChange={updateField} rows="4" placeholder="Leave a gentle note..." />
        <button className="primary-button" type="submit">
          Add comment
        </button>
        {status && <p className="form-note">{status}</p>}
      </form>

      <div className="comment-thread">
        {comments.map((comment, index) => (
          <motion.article
            key={comment._id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <span className="thread-line" />
            <div>
              <strong>{comment.username || '~ Anonymous'}</strong>
              <time>{new Date(comment.createdAt).toLocaleString()}</time>
              <p>{comment.message}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export default CommentsSection;
