import { request } from "./client"; // adjust to match however orders.js/products.js import the shared `request` helper

export const getCustomerAddresses = () => request("/api/customer/addresses");

export const createAddress = (data) =>
  request("/api/customer/addresses", { method: "POST", body: JSON.stringify(data) });

export const updateAddress = (id, data) =>
  request(`/api/customer/addresses/${id}`, { method: "PATCH", body: JSON.stringify(data) });

export const deleteAddress = (id) =>
  request(`/api/customer/addresses/${id}`, { method: "DELETE" });