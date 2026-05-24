function Skeleton({ count = 3 }) {
  return (
    <div className="skeleton-stack" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <span key={index} className="skeleton-line" />
      ))}
    </div>
  );
}

export default Skeleton;
