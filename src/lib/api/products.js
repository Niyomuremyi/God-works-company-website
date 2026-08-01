// lib/api/products.js

import { request } from "./client";

export const getProducts = () =>
  request("/api/products");

export const getProductBySlug = (slug) =>
  request(`/api/products/${slug}`);

export const getMyProducts = () =>
  request("/api/products/mine");

export const createProduct = (product) =>
  request("/api/products", {
    method: "POST",
    body: JSON.stringify(product),
  });

export const updateProduct = (id, product) =>
  request(`/api/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(product),
  });

export const deleteProduct = (id) =>
  request(`/api/products/${id}`, {
    method: "DELETE",
  });