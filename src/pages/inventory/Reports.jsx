import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import {
  fetchInventoryAdjustments,
  fetchInventoryCategories,
  fetchInventoryProducts,
  fetchInventorySuppliers,
  fetchInventoryWarehouses,
} from "../../utils/inventoryApi.js";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const categoryColumns = [
  { header: "Category", accessor: "category" },
  { header: "Products", accessor: "products" },
  { header: "Stock Units", accessor: "stockUnits" },
  { header: "Inventory Value", accessor: "inventoryValue" },
  { header: "Low Stock Items", accessor: "lowStock" },
];

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value) {
  return `₹${toNumber(value).toLocaleString()}`;
}

function getMonthKey(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function Reports() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [productRows, categoryRows, warehouseRows, supplierRows, adjustmentRows] =
        await Promise.all([
          fetchInventoryProducts(),
          fetchInventoryCategories(),
          fetchInventoryWarehouses(),
          fetchInventorySuppliers(),
          fetchInventoryAdjustments(),
        ]);

      setProducts(Array.isArray(productRows) ? productRows : []);
      setCategories(Array.isArray(categoryRows) ? categoryRows : []);
      setWarehouses(Array.isArray(warehouseRows) ? warehouseRows : []);
      setSuppliers(Array.isArray(supplierRows) ? supplierRows : []);
      setAdjustments(Array.isArray(adjustmentRows) ? adjustmentRows : []);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load inventory reports from database.");
    } finally {
      setIsLoading(false);
    }
  }

  const reportData = useMemo(() => {
    const totalInventoryValue = products.reduce(
      (sum, product) => sum + toNumber(product.unitPrice) * toNumber(product.stockQty),
      0,
    );

    const lowStockItems = products.filter(
      (product) => toNumber(product.stockQty) <= toNumber(product.reorderLevel),
    ).length;

    const monthlyAdjustmentMap = adjustments.reduce((accumulator, adjustment) => {
      const monthKey = getMonthKey(adjustment.date);
      if (!monthKey) {
        return accumulator;
      }

      accumulator[monthKey] = (accumulator[monthKey] || 0) + 1;
      return accumulator;
    }, {});

    const adjustmentMonths = Object.keys(monthlyAdjustmentMap)
      .sort((left, right) => left.localeCompare(right))
      .slice(-6);

    const adjustmentTrend = adjustmentMonths.map((month) => ({
      month: month.slice(5),
      count: monthlyAdjustmentMap[month] || 0,
    }));

    const warehouseUtilization = warehouses.map((warehouse) => {
      const capacity = Math.max(toNumber(warehouse.capacity), 1);
      const occupied = toNumber(warehouse.occupied);
      return {
        warehouse: warehouse.name || "Warehouse",
        utilization: Math.round((occupied / capacity) * 100),
      };
    });

    const categoryMap = products.reduce((accumulator, product) => {
      const category = product.category || "Uncategorized";
      if (!accumulator[category]) {
        accumulator[category] = {
          products: 0,
          stockUnits: 0,
          inventoryValue: 0,
          lowStock: 0,
        };
      }

      accumulator[category].products += 1;
      accumulator[category].stockUnits += toNumber(product.stockQty);
      accumulator[category].inventoryValue += toNumber(product.unitPrice) * toNumber(product.stockQty);
      if (toNumber(product.stockQty) <= toNumber(product.reorderLevel)) {
        accumulator[category].lowStock += 1;
      }

      return accumulator;
    }, {});

    const categoryRows = Object.entries(categoryMap).map(([category, data], index) => ({
      id: index + 1,
      category,
      products: data.products,
      stockUnits: data.stockUnits,
      inventoryValue: formatCurrency(data.inventoryValue),
      lowStock: data.lowStock,
    }));

    const totalWarehouses = warehouses.length;
    const activeSuppliers = suppliers.filter((supplier) => supplier.status === "Active").length;
    const approvedAdjustments = adjustments.filter(
      (adjustment) => String(adjustment.status || "").toLowerCase() === "approved",
    ).length;
    const activeCategories = categories.filter(
      (category) => String(category.status || "").toLowerCase() === "active",
    ).length;

    const summary = [
      {
        title: "Inventory Value",
        value: formatCurrency(totalInventoryValue),
        helper: "price × stock across products",
      },
      {
        title: "Low Stock Items",
        value: lowStockItems,
        helper: "items at or below reorder level",
      },
      {
        title: "Warehouses",
        value: totalWarehouses,
        helper: "tracked storage sites",
      },
      {
        title: "Active Suppliers",
        value: activeSuppliers,
        helper: "available vendor partners",
      },
      {
        title: "Active Categories",
        value: activeCategories,
        helper: "product classification groups",
      },
      {
        title: "Approved Adjustments",
        value: approvedAdjustments,
        helper: "confirmed stock corrections",
      },
    ];

    return {
      summary,
      adjustmentTrend,
      warehouseUtilization,
      categoryRows,
    };
  }, [products, categories, warehouses, suppliers, adjustments]);

  return (
    <div className="inv-page">
      <div className="inv-page__header">
        <div>
          <h2>Inventory Reports</h2>
            <p>Dynamic analytics from products, stock, suppliers, and adjustments.</p>
        </div>
        <button type="button" className="inv-btn" onClick={loadReports}>
          Refresh Report
        </button>
      </div>

      <div className="inv-cards inv-cards--compact">
        {reportData.summary.map((card) => (
          <Card key={card.title} {...card} />
        ))}
      </div>

      {errorMessage && <p className="hr-inline-error">{errorMessage}</p>}

      <div className="inv-charts">
        <div className="inv-panel">
          <h3 className="inv-panel__title">Adjustments Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={isLoading ? [] : reportData.adjustmentTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,33,61,0.08)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#69708a" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#69708a" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => `${value} entries`} contentStyle={{ borderRadius: "12px", border: "1px solid rgba(20,33,61,0.1)" }} />
              <Line type="monotone" dataKey="count" stroke="#5a3df0" strokeWidth={2.5} dot={{ r: 4, fill: "#5a3df0", strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="inv-panel">
          <h3 className="inv-panel__title">Warehouse Utilization</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={isLoading ? [] : reportData.warehouseUtilization} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,33,61,0.08)" />
              <XAxis dataKey="warehouse" tick={{ fontSize: 12, fill: "#69708a" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#69708a" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: "12px", border: "1px solid rgba(20,33,61,0.1)" }} />
              <Bar dataKey="utilization" fill="#5a3df0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="inv-panel">
        <h3 className="inv-panel__title">Category Breakdown</h3>
        <Table columns={categoryColumns} rows={isLoading ? [] : reportData.categoryRows} />
        {!isLoading && !reportData.categoryRows.length ? (
          <p className="root-admin-dashboard__empty-state">No category breakdown data yet.</p>
        ) : null}
      </div>
    </div>
  );
}

export default Reports;
