function LoadingScreen({ message = 'Gathering soft words...' }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="ink-loader" />
      <p>{message}</p>
    </div>
  );
}

export default LoadingScreen;
