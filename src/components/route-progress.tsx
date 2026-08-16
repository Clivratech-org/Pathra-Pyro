"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const t = window.setTimeout(() => setActive(false), 450);
    return () => window.clearTimeout(t);
  }, [pathname, search]);

  return <div className={`route-progress${active ? " on" : ""}`} aria-hidden />;
}
