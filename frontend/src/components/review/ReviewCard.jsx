import Button from "../common/Button";

/**
 * Shows the question first; after "Reveal Answer" is pressed, shows the
 * answer beneath it. The `key` prop passed by the parent (tied to the
 * card's id) is what makes the fade/slide-in animation replay for each
 * new card — see .review-card-face in components.css.
 */
function ReviewCard({ question, answer, revealed, onReveal }) {
  return (
    <div className="review-card">
      <div className="review-card-face">
        <span className="review-card-kicker">Question</span>
        <p className="review-card-text">{question}</p>

        {revealed && (
          <>
            <div className="review-card-divider" aria-hidden="true" />
            <span className="review-card-kicker answer">Answer</span>
            <p className="review-card-text">{answer}</p>
          </>
        )}

        {!revealed && (
          <Button onClick={onReveal} variant="secondary">
            Reveal Answer
          </Button>
        )}
      </div>
    </div>
  );
}

export default ReviewCard;
