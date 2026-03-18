import {
  Briefcase,
  CalendarCheck,
  ChartLine,
  Clock3,
  FileText,
  IndianRupee,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { usePersistentSnapshot } from "../utils/persistentState.js";

const SETTINGS_STORAGE_KEY = "erp_settings";

const CURRENCY_CONFIG = {
  "₹": { code: "INR", locale: "en-IN", rateFromInr: 1 },
};

function getIconKeyForTitle(title = "") {
  const normalizedTitle = title.toLowerCase();

  if (
    normalizedTitle.includes("employee") ||
    normalizedTitle.includes("team")
  ) {
    return "users";
  }

  if (
    normalizedTitle.includes("present") ||
    normalizedTitle.includes("attendance")
  ) {
    return "calendar";
  }

  if (normalizedTitle.includes("leave")) {
    return "clock";
  }

  if (
    normalizedTitle.includes("open position") ||
    normalizedTitle.includes("job") ||
    normalizedTitle.includes("recruit")
  ) {
    return "briefcase";
  }

  if (
    normalizedTitle.includes("invoice") ||
    normalizedTitle.includes("document")
  ) {
    return "file";
  }

  if (
    normalizedTitle.includes("payment") ||
    normalizedTitle.includes("expense")
  ) {
    return "wallet";
  }

  if (
    normalizedTitle.includes("revenue") ||
    normalizedTitle.includes("sales")
  ) {
    return "revenue";
  }

  if (
    normalizedTitle.includes("security") ||
    normalizedTitle.includes("ticket")
  ) {
    return "shield";
  }

  return "chart";
}

function parseInrCompactValue(value) {
  if (typeof value !== "string" || !value.includes("₹")) {
    return null;
  }

  const sanitized = value.replace(/,/g, "").trim();
  const match = sanitized.match(/^₹\s*([0-9]*\.?[0-9]+)\s*([LK])?$/i);
  if (!match) {
    return null;
  }

  const numeric = Number.parseFloat(match[1]);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  const suffix = (match[2] || "").toUpperCase();
  if (suffix === "L") {
    return numeric * 100000;
  }

  if (suffix === "K") {
    return numeric * 1000;
  }

  return numeric;
}

function formatCurrencyValue(inrAmount, currencySymbol) {
  const config = CURRENCY_CONFIG[currencySymbol] || CURRENCY_CONFIG["₹"];
  const converted = inrAmount * config.rateFromInr;

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.code,
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(converted);
}

function renderIcon(iconKey) {
  if (iconKey === "revenue") {
    return <IndianRupee className="erp-card__icon" strokeWidth={1.9} />;
  }

  if (iconKey === "users") {
    return <Users className="erp-card__icon" strokeWidth={1.9} />;
  }

  if (iconKey === "calendar") {
    return <CalendarCheck className="erp-card__icon" strokeWidth={1.9} />;
  }

  if (iconKey === "clock") {
    return <Clock3 className="erp-card__icon" strokeWidth={1.9} />;
  }

  if (iconKey === "briefcase") {
    return <Briefcase className="erp-card__icon" strokeWidth={1.9} />;
  }

  if (iconKey === "file") {
    return <FileText className="erp-card__icon" strokeWidth={1.9} />;
  }

  if (iconKey === "wallet") {
    return <Wallet className="erp-card__icon" strokeWidth={1.9} />;
  }

  if (iconKey === "shield") {
    return <ShieldCheck className="erp-card__icon" strokeWidth={1.9} />;
  }

  return <ChartLine className="erp-card__icon" strokeWidth={1.9} />;
}

function Card({ title, value, helper }) {
  const settings = usePersistentSnapshot(SETTINGS_STORAGE_KEY, {
    currency: "₹",
  });

  const effectiveCurrencySymbol = CURRENCY_CONFIG[settings?.currency]
    ? settings.currency
    : "₹";

  const iconKey = getIconKeyForTitle(title);
  const parsedInrAmount = parseInrCompactValue(value);
  const formattedValue =
    parsedInrAmount !== null
      ? formatCurrencyValue(parsedInrAmount, effectiveCurrencySymbol)
      : value;

  return (
    <article className="erp-card">
      <div className="erp-card__head">
        <span className="erp-card__title">{title}</span>
        <span className="erp-card__accent" aria-hidden="true">
          {renderIcon(iconKey)}
        </span>
      </div>
      <strong className="erp-card__value">{formattedValue}</strong>
      <p className="erp-card__helper">{helper}</p>
    </article>
  );
}

export default Card;
