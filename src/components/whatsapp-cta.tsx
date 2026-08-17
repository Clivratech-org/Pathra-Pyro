"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { useCart } from "@/components/cart-provider";
import { currentFrom, requireCustomerLogin } from "@/components/login-gate";
import { loginPath, waLink } from "@/lib/utils";

export function WhatsAppCta({
  text,
  children,
  ...rest
}: {
  text?: string;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">) {
  const { loggedIn, sessionPending, whatsapp } = useCart();
  const href = loggedIn ? waLink(whatsapp, text) : loginPath(currentFrom());

  return (
    <a
      {...rest}
      href={href}
      target={loggedIn ? "_blank" : undefined}
      rel="noreferrer"
      onClick={(e) => {
        if (loggedIn) return;
        e.preventDefault();
        if (sessionPending) return;
        requireCustomerLogin(false);
        rest.onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
