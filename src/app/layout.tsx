import type { Metadata } from "next";
import { Suspense } from "react";
import { Cinzel, Manrope, JetBrains_Mono } from "next/font/google";
import { RouteProgress } from "@/components/route-progress";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-disp",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sri Pathra Pyro World — Crackers & Fancy Varieties",
  description: "Genuine Sivakasi crackers at factory-direct rates. Licensed dealer in Virudhunagar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${manrope.variable} ${mono.variable}`}>
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
