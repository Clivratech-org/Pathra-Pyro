import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/account-nav";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  return (
    <section>
      <div className="wrap account-grid">
        <AccountNav />
        <div className="card form-card static">
          <h2>My Account</h2>
          <p style={{ color: "var(--cream-dim)", margin: "10px 0 20px" }}>Hello, {user.name}</p>
          <div className="form-row">
            <div className="field"><label>Name</label><input readOnly value={user.name} /></div>
            <div className="field"><label>Phone</label><input readOnly value={user.phone} /></div>
            <div className="field"><label>Email</label><input readOnly value={user.email || "—"} /></div>
            <div className="field"><label>Address</label><textarea readOnly rows={2} value={user.address || ""} /></div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
            style={{ marginTop: 20 }}
          >
            <button className="btn btn-outline">Log out</button>
          </form>
        </div>
      </div>
    </section>
  );
}
