"use client";

import { loginPath } from "@/lib/utils";

export function currentFrom() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

export function safeReturnTo(from?: string | null) {
  if (!from || !from.startsWith("/") || from.startsWith("//")) return "/account";
  if (from.startsWith("/login") || from.startsWith("/register") || from.startsWith("/admin")) {
    return "/account";
  }
  return from;
}

export function requireCustomerLogin(loggedIn: boolean, action?: () => void, pending = false) {
  if (loggedIn) {
    action?.();
    return true;
  }
  if (pending) return false;
  window.location.href = loginPath(currentFrom());
  return false;
}
