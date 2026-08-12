import Link from "next/link";

export default function NotFound() {
  return (
    <section>
      <div className="wrap empty-cart">
        <div className="emoji">🪔</div>
        <h1>Page not found</h1>
        <p>That sparkle wandered off. Try the shop instead.</p>
        <Link className="btn btn-primary" href="/shop" style={{ marginTop: 20 }}>Go to Shop</Link>
      </div>
    </section>
  );
}
