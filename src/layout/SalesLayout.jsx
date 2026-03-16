import { Outlet } from "react-router-dom";

function SalesLayout() {
  return (
    <div className="sales-shell__content">
      <Outlet />
    </div>
  );
}

export default SalesLayout;
