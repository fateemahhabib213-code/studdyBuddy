import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PartyPopper, Sparkles } from "lucide-react";
import { api, ApiError } from "../services/api";
import { recordReviewToday } from "../utils/storage";
import { formatNextReview } from "../utils/formatDate";
import Header from "../components/layout/Header";
import ReviewProgress from "../components/review/ReviewProgress";
import ReviewCard from "../components/review/ReviewCard";
import RatingButtons from "../components/review/RatingButtons";
import LoadingState from "../components/common/LoadingState";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";

function Review() {
  const navigate = useNavigate();

  const [queue, setQueue] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const [totalInSession, setTotalInSession] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [rating, setRating] = useState(false); // submitting a rating
  const [lastResult, setLastResult] = useState(null); // {due_date} after rating

  async function load() {
    setError(null);
    setQueue(null);
    try {
      const due = await api.getDueFlashcards();
      setQueue(due);
      setTotalInSession(due.length);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't load your due cards."
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRate(ratingValue) {
    const current = queue[0];
    setRating(true);
    try {
      const updated = await api.reviewFlashcard(current.id, ratingValue);
      recordReviewToday();
      setLastResult(updated);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Couldn't save that review."
      );
    } finally {
      setRating(false);
    }
  }

  function goToNext() {
    setQueue((prev) => prev.slice(1));
    setRevealed(false);
    setLastResult(null);
  }

  if (queue === null && !error) {
    return (
      <>
        <Header title="Review Session" />
        <LoadingState label="Loading cards due for review" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Review Session" />
        <ErrorState message={error} onRetry={load} />
      </>
    );
  }

  if (queue.length === 0) {
    return (
      <>
        <Header title="Review Session" />
        <div className="review-session-complete">
          <div className="review-session-complete-icon">
            <PartyPopper size={28} strokeWidth={2} />
          </div>
          <h3>
            {totalInSession === 0 ? "Nothing due right now" : "All caught up!"}
          </h3>
          <p>
            {totalInSession === 0
              ? "You have no flashcards due for review today. Generate a new set or check back later."
              : "You've reviewed every card that was due today. Great work."}
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <Button
              variant="secondary"
              icon={Sparkles}
              onClick={() => navigate("/generate")}
            >
              Generate more cards
            </Button>
            <Button onClick={() => navigate("/flashcards")}>View all flashcards</Button>
          </div>
        </div>
      </>
    );
  }

  const current = queue[0];
  const cardNumber = totalInSession - queue.length + 1;

  return (
    <>
      <Header title="Review Session" />
      <ReviewProgress current={cardNumber} total={totalInSession} />

      <div className="review-stage">
        <div style={{ width: "100%", maxWidth: 560 }}>
          <ReviewCard
            key={current.id}
            question={current.question}
            answer={current.answer}
            revealed={revealed}
            onReveal={() => setRevealed(true)}
          />

          {revealed && !lastResult && (
            <>
              <p className="review-rate-heading">How well did you know this?</p>
              <RatingButtons onRate={handleRate} disabled={rating} />
            </>
          )}

          {lastResult && (
            <>
              <p className="review-feedback">{formatNextReview(lastResult.due_date)}</p>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--space-4)" }}>
                <Button onClick={goToNext}>
                  {queue.length > 1 ? "Next card" : "Finish session"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Review;
