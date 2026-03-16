import { Outlet } from "react-router-dom";

function FinanceLayout() {
  return (
    <div className="finance-shell__content">
      <Outlet />
    </div>
  );
}

export default FinanceLayout;
