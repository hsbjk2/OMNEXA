import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { ensureDatabase } from "@/lib/d1";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · OMNEXA Admin",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await ensureDatabase();
  const user = await requireAdmin();

  return (
    <AdminShell
      user={{ name: user.name, email: user.email, role: user.role }}
    >
      {children}
    </AdminShell>
  );
}
