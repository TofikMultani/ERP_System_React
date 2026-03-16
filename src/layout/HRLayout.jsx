import { Outlet } from "react-router-dom";

function HRLayout() {
  return (
    <div className="hr-shell__content">
      <Outlet />
    </div>
  );
}

export default HRLayout;
