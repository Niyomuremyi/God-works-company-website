// lib/api/client.js

import { getToken, clearSession } from "../auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function request(path, options = {}) {
  const token = getToken();
  console.log(token)
  console.log("Requesting:", `${API_BASE_URL}${path}`);
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    clearSession();
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