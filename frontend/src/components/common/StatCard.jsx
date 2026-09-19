/**
 * A compact metric card. `tone` picks a soft background for the icon
 * chip so different stats can be told apart at a glance without relying
 * on color alone (the label and icon shape also differ).
 *
 * When `onClick` is passed, the card renders as a real <button> so it's
 * keyboard-reachable and gets a proper focus ring, not just a div with
 * a click handler.
 *
 * `footnote` is an optional short line shown under the label — used for
 * empty-state encouragement ("Start your streak today!") or a nudge
 * ("Complete your first review to see cards here.").
 */
const TONE_STYLES = {
  primary: { background: "var(--color-primary-soft)", color: "var(--color-primary)" },
  warning: { background: "var(--color-warning-soft)", color: "var(--color-warning)" },
  info: { background: "var(--color-info-soft)", color: "var(--color-info)" },
  success: { background: "var(--color-success-soft)", color: "var(--color-success)" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "primary",
  onClick,
  footnote,
  highlight = false,
}) {
  const style = TONE_STYLES[tone] || TONE_STYLES.primary;
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      className={"stat-card" + (onClick ? " stat-card-clickable" : "")}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <div
        className={"stat-card-icon" + (highlight ? " stat-card-icon-highlight" : "")}
        style={style}
      >
        <Icon size={19} strokeWidth={2.1} />
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {footnote && <div className="stat-card-footnote">{footnote}</div>}
    </Tag>
  );
}

export default StatCard;
