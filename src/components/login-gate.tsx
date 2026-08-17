"use client";

import { loginPath } from "@/lib/utils";

export function currentFrom() {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

export function requireCustomerLogin(loggedIn: boolean, action?: () => void) {
  if (loggedIn) {
    action?.();
    return true;
  }
  window.location.href = loginPath(currentFrom());
  return false;
}
