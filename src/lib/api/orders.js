const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
import { getToken, clearSession } from "../auth";

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    clearSession(); // token expired/invalid — drop the stale session
  }

  let data = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new ApiError(data?.error || "Request failed", res.status);
  }
  return data;
}

// Orders (Buyer) — identity comes from the token now, no email in the URL
export const getMyOrders = () => request(`/api/orders/me`);
export const getMyOrderById = (id) => request(`/api/orders/me/${id}`);
export const getMyDashboard = () => request(`/api/orders/me/dashboard`);

// Orders (Seller) — identity comes from the token now
export const getSellerOrders = () => request(`/api/orders/seller/me`);

export const getOrderItemTracking = (itemId) => request(`/api/orders/items/${itemId}/tracking`);

export const updateOrderItemStatus = (itemId, { status, note, estimatedDelivery, cancellationReason }) =>
  request(`/api/orders/items/${itemId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, note, estimatedDelivery, cancellationReason }),
  });

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

export const getCustomerOrders = (email) =>
  request(`/api/orders/customer/${email}`);

export const getCustomerOrderById = (email, id) =>
  request(`/api/orders/customer/${email}/${id}`);

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


// =======================
// Customer Dashboard
// =======================

export const getCustomerDashboard = (email) =>{
  return request(`/api/orders/customer/dashboard/${email}`);
}

// =======================
// Customer Profile
// =======================

export async function getCustomerProfile() {
  return request("/api/customer/profile");
}

export async function updateCustomerProfile(data) {
  return request("/api/customer/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// =======================
// Customer Addresses
// =======================

export async function getCustomerAddresses() {
  return request("/api/customer/addresses");
}

export async function createAddress(data) {
  return request("/api/customer/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAddress(id, data) {
  return request(`/api/customer/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(id) {
  return request(`/api/customer/addresses/${id}`, {
    method: "DELETE",
  });
}
export const getSellerDashboard = () => request(`/api/orders/seller/me/dashboard`);
export const getMyProducts = () => request(`/api/products/mine`);
export const cancelOrder = (id, reason) =>
  request(`/api/orders/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ reason }),
  });
export const getSellerOrderById = (id) => request(`/api/orders/seller/me/${id}`);

export const createReturnRequest = (itemId, reason) =>
  request(`/api/orders/items/${itemId}/return`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

export const createReview = (itemId, rating, comment) =>
  request(`/api/orders/items/${itemId}/review`, {
    method: "POST",
    body: JSON.stringify({ rating, comment }),
  });

export const getSellerReturns = () => request(`/api/orders/seller/me/returns`);

export const resolveReturnRequest = (returnId, decision, resolutionNote) =>
  request(`/api/orders/returns/${returnId}`, {
    method: "PATCH",
    body: JSON.stringify({ decision, resolutionNote }),
  });

export const getSellerEarnings = () => request(`/api/orders/seller/me/earnings`);