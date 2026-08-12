import type { Metadata } from "next";
import { Cinzel, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-disp" });
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Sri Pathra Pyro World — Crackers & Fancy Varieties",
  description: "Genuine Sivakasi crackers at factory-direct rates. Licensed dealer in Virudhunagar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} ${manrope.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
