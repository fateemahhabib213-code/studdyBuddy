import { Clock, BookOpen, Trophy } from "lucide-react";
import { getFlashcardStatus } from "../../utils/flashcardStatus";
import { formatDueDate } from "../../utils/formatDate";

const STATUS_META = {
  due: { label: "Due", icon: Clock },
  learning: { label: "Learning", icon: BookOpen },
  mastered: { label: "Mastered", icon: Trophy },
};

function FlashcardCard({ card }) {
  const status = getFlashcardStatus(card);
  const { label, icon: Icon } = STATUS_META[status];

  return (
    <div className="flashcard-row">
      <p className="flashcard-row-question">{card.question}</p>
      <div className="flashcard-row-meta">
        <span className={`status-badge ${status}`}>
          <Icon size={12} strokeWidth={2.5} />
          {label}
        </span>
        <span>{formatDueDate(card.due_date)}</span>
      </div>
    </div>
  );
}

export default FlashcardCard;
