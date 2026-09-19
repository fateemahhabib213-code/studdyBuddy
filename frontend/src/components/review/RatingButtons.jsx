const RATINGS = [
  { value: "again", label: "Again", hint: "Didn't recall", className: "again" },
  { value: "hard", label: "Hard", hint: "Struggled", className: "hard" },
  { value: "good", label: "Good", hint: "Recalled it", className: "good" },
  { value: "easy", label: "Easy", hint: "Instantly", className: "easy" },
];

function RatingButtons({ onRate, disabled }) {
  return (
    <div className="rating-buttons">
      {RATINGS.map(({ value, label, hint, className }) => (
        <button
          key={value}
          type="button"
          className={`rating-btn ${className}`}
          onClick={() => onRate(value)}
          disabled={disabled}
        >
          <span className="rating-btn-label">{label}</span>
          <span className="rating-btn-hint">{hint}</span>
        </button>
      ))}
    </div>
  );
}

export default RatingButtons;
