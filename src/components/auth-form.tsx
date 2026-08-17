"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { customerLogin, customerRegister } from "@/app/(shop)/login/actions";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const params = useSearchParams();
  const from = params.get("from") || "/account";
  const action = mode === "login" ? customerLogin : customerRegister;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <div className="auth-wrap">
      <div className="card form-card static">
        <div className="eyebrow">{mode === "login" ? "Welcome back" : "Create account"}</div>
        <h1 style={{ margin: "10px 0 18px" }}>{mode === "login" ? "Customer Login" : "Register"}</h1>
        {state?.error && <div className="alert error">{state.error}</div>}
        {from !== "/account" && (
          <p style={{ color: "var(--cream-dim)", marginBottom: 14, fontSize: "0.9rem" }}>
            Log in to add items to your cart, enquire on WhatsApp, and manage your orders.
          </p>
        )}
        <form className="form-row" action={formAction}>
          <input type="hidden" name="from" value={from} />
          {mode === "register" && (
            <div className="field">
              <label>Full name</label>
              <input name="name" required placeholder="Your name" />
            </div>
          )}
          {mode === "login" ? (
            <div className="field">
              <label>Phone or email</label>
              <input name="identifier" required placeholder="98432… or you@email.com" autoComplete="username" />
            </div>
          ) : (
            <>
              <div className="field">
                <label>Mobile</label>
                <input name="phone" required placeholder="10-digit mobile" autoComplete="tel" />
              </div>
              <div className="field">
                <label>Email (optional)</label>
                <input name="email" type="email" placeholder="you@email.com" autoComplete="email" />
              </div>
            </>
          )}
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </div>
          <button className="btn btn-primary btn-block" disabled={pending}>
            {pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
        <p style={{ marginTop: 16, fontSize: "0.85rem", color: "var(--cream-dim)" }}>
          {mode === "login" ? (
            <>New here? <Link href={`/register?from=${encodeURIComponent(from)}`}>Create an account</Link></>
          ) : (
            <>Already registered? <Link href={`/login?from=${encodeURIComponent(from)}`}>Log in</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
