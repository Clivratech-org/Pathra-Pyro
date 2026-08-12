import { getSettings } from "@/lib/settings";

export default async function LegalPage() {
  const s = await getSettings();
  const items = [
    { n: "01", h: "Licensed Online Checkout", p: "Orders on this website are paid securely through Razorpay. We remain a licensed explosives dealer and ship only via approved carriers." },
    { n: "02", h: "Age & Local Rules", p: "Buyers must be 18+. Cracker bursting timings and green-cracker mandates vary by local authority — please check before use." },
    { n: "03", h: "Order Confirmation", p: "After payment, you receive an order ID. Our team may still call or WhatsApp to confirm address and dispatch slot." },
    { n: "04", h: "Licensed Dealer Information", p: `${s.businessName} operates under Explosives License No. ${s.license}, issued by PESO.` },
    { n: "05", h: "GST Registration", p: `GSTIN: ${s.gstin} — registered under the Tamil Nadu Goods and Services Tax Act.` },
    { n: "06", h: "Transport Policy", p: "All shipments move exclusively through PESO-approved explosive-goods transport carriers with valid road permits." },
  ];
  return (
    <>
      <div className="page-hero">
        <div className="wrap">
          <div className="crumb">Home / <span>Legal Information</span></div>
          <div className="eyebrow">Compliance</div>
          <h1>Legal & Regulatory Information</h1>
          <p>Transparency on how we operate within Indian fireworks trade regulations.</p>
        </div>
      </div>
      <section>
        <div className="wrap legal-grid">
          {items.map((i) => (
            <div className="card legal-item" key={i.n}>
              <div className="n">{i.n}</div>
              <div>
                <h4>{i.h}</h4>
                <p>{i.p}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="wrap">
          <div className="notice-band mt-40">
            <div className="ic">⚠️</div>
            <div>
              <h4>Important Notice to Customers</h4>
              <p>Cracker bursting timings, categories permitted, and green-cracker mandates may vary by state/local authority notification. Please check your local municipal guidelines before use. Prices and stock are subject to change without prior notice.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
