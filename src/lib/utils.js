import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge and deduplicate Tailwind classes safely
 * @param  {...any} inputs - class strings or arrays
 * @returns merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price amount with currency symbol
 * @param {number|null|undefined} amount - The price amount
 * @param {string} currency - Currency symbol (default: "£")
 * @returns {string} Formatted price string (e.g., "£599.99")
 */
export function formatPrice(amount, currency = "£") {
  return `${currency}${(amount ?? 0).toFixed(2)}`;
}

/** Date format options */
const DATE_FORMAT_OPTIONS = {
  short: { day: "numeric", month: "short" },
  long: { day: "numeric", month: "long", year: "numeric" },
  datetime: {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
};

/**
 * Format a date string with locale-specific formatting
 * @param {string|null|undefined} date - ISO date string
 * @param {"short"|"long"|"datetime"} format - Format option
 * @param {string} fallback - Fallback text when date is null/undefined
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = "long", fallback = "Date unknown") {
  if (!date) return fallback;
  return new Date(date).toLocaleDateString("en-GB", DATE_FORMAT_OPTIONS[format]);
}

/**
 * Format an order number for display (shows only the last segment after the last hyphen)
 * @param {string|null|undefined} orderNumber - Full order number (e.g., "ORD-2024-ABC123")
 * @returns {string} Shortened order number (e.g., "ABC123") or "N/A" if null
 */
export function formatOrderNumber(orderNumber) {
  if (!orderNumber) return "N/A";
  return orderNumber.split("-").pop() || orderNumber;
}