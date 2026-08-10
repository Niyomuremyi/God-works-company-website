import { request } from "./client";

export const login = (data) =>
  request("/api/auth/login", { method: "POST", body: JSON.stringify(data) });

export const register = (data) =>
  request("/api/auth/register", { method: "POST", body: JSON.stringify(data) });

export const requestPasswordReset = (email) =>
  request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });

export const resetPassword = (token, password) =>
  request("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });