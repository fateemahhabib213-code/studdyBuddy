import { AlertTriangle } from "lucide-react";
import Button from "./Button";

/**
 * A readable error panel. Always pass a plain-language `message` — never
 * a raw exception or stack trace. `onRetry` is optional; when provided,
 * a "Try again" button is shown.
 */
function ErrorState({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  onRetry,
}) {
  return (
    <div className="state-block error" role="alert">
      <div className="state-block-icon">
        <AlertTriangle size={24} strokeWidth={2} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
