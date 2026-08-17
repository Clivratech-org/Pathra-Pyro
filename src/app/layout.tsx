import type { Metadata } from "next";
import { Suspense } from "react";
import { RouteProgress } from "@/components/route-progress";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sri Pathra Pyro World — Crackers & Fancy Varieties",
  description: "Genuine Sivakasi crackers at factory-direct rates. Licensed dealer in Virudhunagar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
