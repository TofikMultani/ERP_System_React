import { Outlet } from "react-router-dom";

function InventoryLayout() {
  return (
    <div className="inv-shell__content">
      <Outlet />
    </div>
  );
}

export default InventoryLayout;
