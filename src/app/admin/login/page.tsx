"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { AuthSession } from "@/components/auth-session";

function LoginInner() {
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      identifier: String(fd.get("identifier")),
      password: String(fd.get("password")),
      portal: "admin",
      redirect: false,
    });
    if (result?.error) {
      setErr("Invalid admin credentials");
      setBusy(false);
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form className="card form-card static" style={{ width: "min(420px, 100%)" }} onSubmit={onSubmit}>
        <div className="brand" style={{ marginBottom: 18 }}>
          <img className="brand-logo" src="/images/logo.png" alt="Sri Pathra Pyro World" />
          <div className="name">Admin Console<small>SRI PATHRA PYRO WORLD</small></div>
        </div>
        {err && <div className="alert error">{err}</div>}
        <div className="form-row">
          <div className="field">
            <label>Email or phone</label>
            <input name="identifier" required defaultValue="admin@pathrapyro.local" />
          </div>
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" required defaultValue="Admin@123" />
          </div>
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <AuthSession>
      <LoginInner />
    </AuthSession>
  );
}
