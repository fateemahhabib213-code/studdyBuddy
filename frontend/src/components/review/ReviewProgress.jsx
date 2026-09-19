function ReviewProgress({ current, total }) {
  const percent = total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className="review-progress-track">
      <span className="review-progress-label">
        Card {current} of {total}
      </span>
      <div
        className="review-progress-bar"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div className="review-progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default ReviewProgress;
