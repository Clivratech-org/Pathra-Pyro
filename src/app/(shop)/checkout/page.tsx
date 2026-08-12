import { auth } from "@/auth";
import { CheckoutForm } from "@/components/checkout-form";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage() {
  const session = await auth();
  let prefill = { name: "", phone: "", email: "", address: "", pincode: "" };
  if (session?.user?.id && session.user.role === "CUSTOMER") {
    const u = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (u) {
      prefill = {
        name: u.name,
        phone: u.phone,
        email: u.email || "",
        address: u.address || "",
        pincode: u.pincode || "",
      };
    }
  }
  return <CheckoutForm prefill={prefill} loggedIn={session?.user?.role === "CUSTOMER"} />;
}
