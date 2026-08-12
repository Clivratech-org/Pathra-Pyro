"use client";

import { useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone"),
        message: fd.get("message"),
      }),
    });
    if (res.ok) {
      setStatus("ok");
      setMsg("Enquiry sent! Our team will contact you shortly.");
      e.currentTarget.reset();
    } else {
      setStatus("err");
      setMsg("Could not send enquiry. Please call us instead.");
    }
  }

  return (
    <form className="form-card card static" onSubmit={onSubmit}>
      <h4 style={{ color: "var(--gold-2)", marginBottom: 18 }}>Send an Enquiry</h4>
      <div className="form-row">
        <div className="form-row two">
          <div className="field">
            <label>Name</label>
            <input name="name" required placeholder="Your name" />
          </div>
          <div className="field">
            <label>Phone</label>
            <input name="phone" required placeholder="+91" />
          </div>
        </div>
        <div className="field">
          <label>Message</label>
          <textarea name="message" rows={4} required placeholder="Tell us what you're looking for..." />
        </div>
      </div>
      {msg && <p className={`alert ${status === "ok" ? "ok" : "error"}`} style={{ marginTop: 14 }}>{msg}</p>}
      <button className="btn btn-primary" style={{ marginTop: 16 }} type="submit">Send Enquiry</button>
    </form>
  );
}
