const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    // No response body
  }

  if (!res.ok) {
    throw new ApiError(data?.error || "Request failed", res.status);
  }

  return data;
}

// =======================
// Products
// =======================

export const getProducts = () =>
  request("/api/products");

export const getProductBySlug = (slug) =>
  request(`/api/products/${slug}`);

// =======================
// Orders (Customer)
// =======================

export const createOrder = (input) =>
  request("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const getOrderById = (id) =>
  request(`/api/orders/${id}`);

// =======================
// Orders (Admin)
// =======================

export const getAllOrders = (status) =>
  request(`/api/orders${status ? `?status=${status}` : ""}`);

export const updateOrderStatus = (id, status) =>
  request(`/api/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// =======================
// Orders (Seller)
// =======================

export const getSellerOrders = (sellerName) =>
  request(`/api/orders/seller/${encodeURIComponent(sellerName)}`);

export const updateOrderItemStatus = (itemId, status, seller) =>
  request(`/api/orders/items/${itemId}/status`, {
    method: "PATCH",
    body: JSON.stringify({
      status,
      seller,
    }),
  });