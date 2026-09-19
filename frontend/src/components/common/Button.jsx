/**
 * The single button component used everywhere in the app, so every
 * button shares the same sizing, states, and focus behavior.
 *
 * variant: "primary" | "secondary" | "ghost" | "danger-ghost"
 * size: "md" | "lg"
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  block = false,
  type = "button",
  ...rest
}) {
  const variantClass =
    {
      primary: "btn-primary",
      secondary: "btn-secondary",
      ghost: "btn-ghost",
      "danger-ghost": "btn-danger-ghost",
    }[variant] || "btn-primary";

  const classes = [
    "btn",
    variantClass,
    size === "lg" ? "btn-lg" : "",
    block ? "btn-block" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {Icon && <Icon size={18} strokeWidth={2.2} />}
      {children}
    </button>
  );
}

export default Button;
