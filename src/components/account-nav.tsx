"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account", label: "Profile" },
  { href: "/cart", label: "My Cart" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/enquiries", label: "My Enquiries" },
  { href: "/track", label: "Track an order" },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <div className="account-nav card static" style={{ padding: 12, height: "fit-content" }}>
      {LINKS.map((l) => {
        const active = l.href === "/account" ? path === "/account" : path.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={active ? "active" : ""}>
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
