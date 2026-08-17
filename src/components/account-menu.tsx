"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

export function AccountMenu({ userName }: { userName?: string | null }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const name =
    session?.user?.role === "CUSTOMER" ? session.user.name || userName : userName;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!name) {
    return (
      <Link href="/login" className="icon-btn" title="Log in">
        👤
      </Link>
    );
  }

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

  return (
    <div className="account-menu" ref={wrapRef}>
      <button
        type="button"
        className="account-menu-btn"
        aria-expanded={open}
        aria-haspopup="true"
        title={name}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="account-avatar">{initials}</span>
        <span className="account-menu-name">{name}</span>
      </button>
      {open && (
        <div className="account-dropdown">
          <div className="account-dropdown-head">
            <strong>{name}</strong>
            <small>My account</small>
          </div>
          <Link href="/account" onClick={() => setOpen(false)}>Profile</Link>
          <Link href="/account/orders" onClick={() => setOpen(false)}>My orders</Link>
          <Link href="/account/enquiries" onClick={() => setOpen(false)}>My enquiries</Link>
          <Link href="/cart" onClick={() => setOpen(false)}>My cart</Link>
          <button
            type="button"
            className="account-dropdown-logout"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
