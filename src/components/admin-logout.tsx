import { signOut } from "@/auth";

export function AdminLogout() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/admin/login" });
      }}
    >
      <button className="btn btn-outline btn-sm" type="submit">Log out</button>
    </form>
  );
}
