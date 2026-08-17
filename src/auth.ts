import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { findCustomerByIdentifier } from "@/lib/customer-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    phone?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      phone?: string | null;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or phone", type: "text" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "text" },
      },
      async authorize(credentials) {
        try {
          const identifier = String(credentials?.identifier || "").trim();
          const password = String(credentials?.password || "");
          const portal = String(credentials?.portal || "customer");
          if (!identifier || !password) return null;

          const user = await findCustomerByIdentifier(identifier);
          if (!user) return null;
          const ok = await bcrypt.compare(password, user.passwordHash);
          if (!ok) return null;
          if (portal === "admin" && user.role !== "ADMIN") return null;
          if (portal === "customer" && user.role !== "CUSTOMER") return null;
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
          };
        } catch (error) {
          console.error("Credentials authorize failed:", error);
          return null;
        }
      },
    }),
  ],
});
