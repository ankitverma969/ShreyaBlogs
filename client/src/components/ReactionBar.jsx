import { reactions } from '../utils/posts.js';

function ReactionBar({ counts = {}, selected, onReact }) {
  return (
    <div className="reaction-bar">
      {reactions.map((reaction) => (
        <button
          key={reaction.key}
          className={selected === reaction.key ? 'active' : ''}
          type="button"
          onClick={() => onReact(reaction.key)}
        >
          <span className={`reaction-icon ${reaction.icon}`} />
          <strong>{reaction.label}</strong>
          <small>{counts?.[reaction.key] || 0}</small>
        </button>
      ))}
    </div>
  );
}

export default ReactionBar;
