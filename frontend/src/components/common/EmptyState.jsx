import { Sparkles } from "lucide-react";
import Button from "./Button";

/**
 * Shown whenever a list genuinely has nothing in it yet (no flashcards,
 * no due cards). Frames emptiness as an invitation to act, with one
 * clear next step.
 */
function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="state-block empty">
      <div className="state-block-icon">
        <Icon size={24} strokeWidth={2} />
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

export default EmptyState;
