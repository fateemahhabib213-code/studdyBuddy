/**
 * The shared heading block used at the top of every page except the
 * Dashboard, which has its own hero treatment instead.
 */
function Header({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}

export default Header;
