import { useNavigate } from "react-router-dom";
import { ChevronRight, Clock } from "lucide-react";
import EmptyState from "../common/EmptyState";

/**
 * Previews up to 3 cards that are due today. Clicking any card (or the
 * "Review all" link) goes to the Review page, which pulls its own due
 * queue from the backend — this list is just a preview, not a separate
 * data source.
 *
 * Note: the backend has no concept of "decks" (flashcards are a single
 * pool, by design — see Phase 1 non-goals), so only the question text
 * is shown here, not a deck name.
 */
function UpcomingReviews({ dueCards }) {
  const navigate = useNavigate();
  const preview = dueCards.slice(0, 3);

  return (
    <div className="section">
      <div className="section-heading">
        <h2>Upcoming Reviews</h2>
        {dueCards.length > 0 && (
          <button className="link-button" onClick={() => navigate("/review")}>
            Review all ({dueCards.length})
          </button>
        )}
      </div>

      {preview.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Nothing due right now"
          description="You're all caught up. Check back later or generate a new set of cards."
        />
      ) : (
        <div className="upcoming-list">
          {preview.map((card) => (
            <button
              key={card.id}
              className="upcoming-row"
              onClick={() => navigate("/review")}
            >
              <span className="upcoming-row-question">{card.question}</span>
              <ChevronRight size={16} className="upcoming-row-arrow" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default UpcomingReviews;
