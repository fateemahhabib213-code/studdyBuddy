import FlashcardCard from "./FlashcardCard";
import EmptyState from "../common/EmptyState";
import { Search } from "lucide-react";

function FlashcardList({ cards, noResultsFromFilter }) {
  if (cards.length === 0 && noResultsFromFilter) {
    return (
      <EmptyState
        icon={Search}
        title="No cards match your search"
        description="Try a different search term or clear your filters."
      />
    );
  }

  return (
    <div className="flashcard-list">
      {cards.map((card) => (
        <FlashcardCard key={card.id} card={card} />
      ))}
    </div>
  );
}

export default FlashcardList;
