/**
 * A quiet, reusable loading indicator for any section waiting on the API.
 * `label` should describe what's loading, e.g. "Loading your flashcards".
 */
function LoadingState({ label = "Loading" }) {
  return (
    <div className="state-block" role="status" aria-live="polite">
      <div className="loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>{label}…</p>
    </div>
  );
}

export default LoadingState;
