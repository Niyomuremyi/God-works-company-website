/**
 * Stock threshold for "low stock" warnings
 * Products at or below this level will show low stock indicators
 */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * Check if a product is considered low stock
 * @param stock - Current stock count
 * @returns true if stock is above 0 but at or below the threshold
 */
export const isLowStock = (stock) =>
  stock > 0 && stock <= LOW_STOCK_THRESHOLD;

/**
 * Check if a product is out of stock
 * @param stock - Current stock count
 * @returns true if stock is 0 or less
 */
export const isOutOfStock = (stock) => stock <= 0;

/**
 * Get stock status for display purposes
 */
export const getStockStatus = (stock) => {
  if (stock === null || stock === undefined) return "unknown";
  if (stock <= 0) return "out_of_stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
};

/**
 * Get human-readable stock message
 */
export const getStockMessage = (stock) => {
  const status = getStockStatus(stock);

  switch (status) {
    case "out_of_stock":
      return "OUT OF STOCK - Currently unavailable";

    case "low_stock":
      return `LOW STOCK - Only ${stock} left`;

    case "in_stock":
      return `In stock (${stock} available)`;

    default:
      return "Stock status unknown";
  }
};