import { Outlet } from "react-router-dom";

function SupportLayout() {
  return (
    <div className="support-shell__content">
      <Outlet />
    </div>
  );
}

export default SupportLayout;
