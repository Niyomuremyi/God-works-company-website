"use client";

import { useEffect, useState, useCallback } from "react";

const TOKEN_KEY = "token";
const USER_KEY = "user";

function readUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
    console.log(localStorage.getItem(TOKEN_KEY),localStorage.getItem("token"))
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  return readUser();
}

// Call this from your login/register page after a successful response
export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth-changed"));
}

// Any component can call this to read and react to login/logout
export function useAuth() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readUser());
    setReady(true);

    const onChange = () => setUser(readUser());
    window.addEventListener("auth-changed", onChange);
    window.addEventListener("storage", onChange); // keeps tabs in sync
    return () => {
      window.removeEventListener("auth-changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const logout = useCallback(() => clearSession(), []);

  return { user, ready, isLoggedIn: !!user, logout };
}