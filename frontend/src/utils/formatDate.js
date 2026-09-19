const DAY_MS = 24 * 60 * 60 * 1000;

/** Returns a short, human-friendly description of when a due date falls. */
export function formatDueDate(dueDateStr) {
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffDays = Math.ceil((due.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / DAY_MS);

  if (diffDays <= 0) return "Due now";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays < 7) return `Due in ${diffDays} days`;
  if (diffDays < 30) {
    const weeks = Math.round(diffDays / 7);
    return `Due in ${weeks} week${weeks > 1 ? "s" : ""}`;
  }
  const months = Math.round(diffDays / 30);
  return `Due in ${months} month${months > 1 ? "s" : ""}`;
}

/** Returns the "Next review: in N days" phrasing shown right after a rating. */
export function formatNextReview(dueDateStr) {
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffDays = Math.round((due - now) / DAY_MS);

  if (diffDays <= 0) return "Next review: later today";
  if (diffDays === 1) return "Next review: in 1 day";
  return `Next review: in ${diffDays} days`;
}

/** Returns a short date like "Sep 18" for list views. */
export function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
