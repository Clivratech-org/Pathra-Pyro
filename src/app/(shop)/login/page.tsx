import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <section>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </section>
  );
}
