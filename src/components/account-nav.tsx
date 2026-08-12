"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AccountNav() {
  const path = usePathname();
  return (
    <div className="account-nav card static" style={{ padding: 12, height: "fit-content" }}>
      <Link href="/account" className={path === "/account" ? "active" : ""}>Profile</Link>
      <Link href="/account/orders" className={path.startsWith("/account/orders") ? "active" : ""}>My Orders</Link>
      <Link href="/track">Track an order</Link>
    </div>
  );
}
