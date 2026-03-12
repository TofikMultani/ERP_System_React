/**
 * Badge Component - For status and category labels
 * Variants: success, warning, danger, info, primary, secondary
 */
function Badge({ children, variant = "primary", size = "md", className = "" }) {
  const variantClass = `badge--${variant}`;
  const sizeClass = `badge--${size}`;

  return (
    <span className={`badge ${variantClass} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
