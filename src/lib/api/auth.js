import { request } from "./client";

export const login = (data) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const register = (data) =>
  request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });