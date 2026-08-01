import {
  Package,
  Truck,
  XCircle,
  CreditCard,
} from "lucide-react";

export const ORDER_STATUS_CONFIG = {
  paid: {
    value: "paid",
    label: "Paid",
    color: "bg-green-100 text-green-800",
    icon: CreditCard,
    emoji: "✅",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  shipped: {
    value: "shipped",
    label: "Shipped",
    color: "bg-blue-100 text-blue-800",
    icon: Truck,
    emoji: "📦",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  delivered: {
    value: "delivered",
    label: "Delivered",
    color: "bg-zinc-100 text-zinc-800",
    icon: Package,
    emoji: "🎉",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
  cancelled: {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    emoji: "❌",
    iconColor: "text-red-600 dark:text-red-400",
    iconBgColor: "bg-red-100 dark:bg-red-900/30",
  },
};

/** All valid order status values */
export const ORDER_STATUS_VALUES = Object.keys(ORDER_STATUS_CONFIG);

/** Tabs for admin order filtering (includes "all" option) */
export const ORDER_STATUS_TABS = [
  { value: "all", label: "All" },
  ...ORDER_STATUS_VALUES.map((value) => ({
    value,
    label: ORDER_STATUS_CONFIG[value].label,
  })),
];

/** Format for Sanity schema options.list */
export const ORDER_STATUS_SANITY_LIST = ORDER_STATUS_VALUES.map((value) => ({
  title: ORDER_STATUS_CONFIG[value].label,
  value,
}));

/** Get order status config with fallback to "paid" */
export const getOrderStatus = (status) =>
  ORDER_STATUS_CONFIG[status] ?? ORDER_STATUS_CONFIG.paid;

/** Get emoji display for status */
export const getOrderStatusEmoji = (status) => {
  const config = getOrderStatus(status);
  return `${config.emoji} ${config.label}`;
};
export const ORDER_LEVEL_STATUSES = ["pending", "processing", "completed", "cancelled"];

export const ORDER_LEVEL_STATUS_TABS = [
  { value: "all", label: "All" },
  ...ORDER_LEVEL_STATUSES.map((value) => ({
    value,
    label: value[0].toUpperCase() + value.slice(1),
  })),
];