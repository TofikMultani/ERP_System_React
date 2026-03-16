import { Outlet } from "react-router-dom";

function ITLayout() {
  return (
    <div className="it-shell__content">
      <Outlet />
    </div>
  );
}

export default ITLayout;
