import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <section>
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </section>
  );
}
