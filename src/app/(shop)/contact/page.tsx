import { ContactForm } from "@/components/contact-form";
import { WhatsAppCta } from "@/components/whatsapp-cta";
import { auth } from "@/auth";
import { getSettings } from "@/lib/settings";

export default async function ContactPage() {
  const [s, session] = await Promise.all([getSettings(), auth()]);
  const loggedIn = session?.user?.role === "CUSTOMER";
  return (
    <>
      <div
        className="page-hero page-hero-photo"
        style={{ backgroundImage: "url('/images/static-sparkler-heart.jpg')" }}
      >
        <div className="wrap">
          <div className="crumb">Home / <span>Contact Us</span></div>
          <div className="eyebrow">Get In Touch</div>
          <h1>Contact Us</h1>
          <p>Reach out for bulk orders, combo customisation, or delivery queries.</p>
        </div>
      </div>
      <section>
        <div className="wrap contact-grid">
          <div>
            <div className="contact-info-list">
              <div className="contact-info-item"><div className="ic">📍</div><div><h5>Address</h5><p>{s.businessName}, {s.address}</p></div></div>
              <div className="contact-info-item"><div className="ic">📞</div><div><h5>Mobile Numbers</h5><p>{s.phone} · {s.phone2}</p></div></div>
              <div className="contact-info-item"><div className="ic">✉️</div><div><h5>Email</h5><p>{s.email}</p></div></div>
              <div className="contact-info-item"><div className="ic">🕒</div><div><h5>Working Hours</h5><p>{s.hours}</p></div></div>
              <div className="contact-info-item"><div className="ic">🟢</div><div><h5>WhatsApp</h5><p>{s.whatsapp} — fastest response for order enquiries</p></div></div>
            </div>
            <div className="cta-row" style={{ marginTop: 24 }}>
              <WhatsAppCta className="btn btn-wa">Message on WhatsApp</WhatsAppCta>
              <a className="btn btn-primary" href={`tel:${s.phone.replace(/\s/g, "")}`}>Call Now</a>
            </div>
          </div>
          <div className="map-box">
            <iframe src={s.mapEmbed} loading="lazy" title="Map" />
          </div>
        </div>
      </section>
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <ContactForm
            loggedIn={loggedIn}
            name={loggedIn ? session?.user?.name || "" : ""}
            phone={loggedIn ? session?.user?.phone || "" : ""}
          />
        </div>
      </section>
    </>
  );
}
