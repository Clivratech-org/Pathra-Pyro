import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";
import { waLink } from "@/lib/utils";

export function PublicFooter({
  settings,
  categories,
}: {
  settings: SiteSettings;
  categories: { name: string; slug: string }[];
}) {
  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <div className="brand" style={{ marginBottom: 16 }}>
            <div className="mark">SP</div>
            <div className="name">
              {settings.businessName}
              <small>{settings.tagline}</small>
            </div>
          </div>
          <p style={{ color: "var(--cream-dim)", fontSize: "0.86rem", lineHeight: 1.7 }}>
            Genuine Sivakasi crackers at direct factory rates. Licensed, tested, and trusted by families across Tamil Nadu.
          </p>
          <div className="social-row">
            <a className="icon-btn" href="#" aria-label="Facebook">f</a>
            <a className="icon-btn" href="#" aria-label="Instagram">in</a>
            <a className="icon-btn" href={waLink(settings.whatsapp)} target="_blank" rel="noreferrer">wa</a>
          </div>
        </div>
        <div>
          <h5>Quick Links</h5>
          <ul>
            <li><Link href="/shop">Shop All</Link></li>
            <li><Link href="/quick-order">Quick Order</Link></li>
            <li><Link href="/combos">Combo Packs</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/track">Track Order</Link></li>
          </ul>
        </div>
        <div>
          <h5>Categories</h5>
          <ul>
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}><Link href={`/category/${c.slug}`}>{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h5>Contact</h5>
          <ul>
            <li>📍 {settings.cityLine}</li>
            <li>📞 {settings.phone}</li>
            <li>✉️ {settings.email}</li>
            <li><Link href="/legal">Legal & Compliance Info</Link></li>
          </ul>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} {settings.businessName}, Virudhunagar. All rights reserved.</span>
        <span>Secure checkout via Razorpay · Licensed explosives dealer</span>
      </div>
    </footer>
  );
}
