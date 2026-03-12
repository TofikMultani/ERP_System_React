function Topbar({ title, description }) {
  return (
    <header className="topbar">
      <div>
        <span className="topbar__eyebrow">Operations hub</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="topbar__actions">
        <label className="topbar__search">
          <span className="sr-only">Search</span>
          <input type="search" placeholder="Search module" />
        </label>

        <button type="button" className="topbar__profile">
          <span>AT</span>
          <strong>Admin Team</strong>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
