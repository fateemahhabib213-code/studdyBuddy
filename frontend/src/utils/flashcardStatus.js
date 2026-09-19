/**
 * The backend stores raw SM-2 fields (repetition, interval, due_date) but
 * has no explicit "status" field. This derives the three statuses the UI
 * shows (Due / Learning / Mastered) from that data, in one shared place
 * so the Dashboard and Flashcards page always agree.
 */

const MASTERED_INTERVAL_DAYS = 21;

export function getFlashcardStatus(card) {
  const due = new Date(card.due_date);
  const isDue = due <= new Date();

  if (isDue) return "due";
  if (card.interval >= MASTERED_INTERVAL_DAYS) return "mastered";
  return "learning";
}

export function countByStatus(cards) {
  const counts = { due: 0, learning: 0, mastered: 0 };
  for (const card of cards) {
    counts[getFlashcardStatus(card)] += 1;
  }
  return counts;
}
