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
    credentials: "include", // Send cookies/JWT if using authentication
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
    // Ignore empty response body
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