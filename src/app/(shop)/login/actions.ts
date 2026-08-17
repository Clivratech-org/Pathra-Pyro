"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { safeReturnTo } from "@/components/login-gate";
import { registerCustomer } from "@/lib/customer-auth";

export type AuthActionState = { error?: string } | undefined;

async function credentialsSignIn(identifier: string, password: string, redirectTo: string) {
  await signIn("credentials", {
    identifier,
    password,
    portal: "customer",
    redirectTo,
  });
}

export async function customerLogin(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const identifier = String(formData.get("identifier") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectTo = safeReturnTo(String(formData.get("from") || "/account"));

  if (!identifier || !password) {
    return { error: "Phone/email and password are required." };
  }

  try {
    await credentialsSignIn(identifier, password, redirectTo);
  } catch (e) {
    if (e instanceof AuthError) {
      if (e.type === "CredentialsSignin") return { error: "Invalid phone/email or password" };
      return { error: "Could not sign in. Please try again." };
    }
    throw e;
  }
}

export async function customerRegister(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const name = String(formData.get("name") || "");
  const phone = String(formData.get("phone") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const redirectTo = safeReturnTo(String(formData.get("from") || "/account"));

  const result = await registerCustomer({
    name,
    phone,
    email: email || null,
    password,
  });
  if (!result.ok) return { error: result.error };

  try {
    await credentialsSignIn(result.phone, password, redirectTo);
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Account created, but sign-in failed. Please log in manually." };
    }
    throw e;
  }
}
