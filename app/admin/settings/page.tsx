import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { getShippingConfig } from "@/lib/shipping";
import { AdminPageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";

export const metadata: Metadata = {
  title: "Settings",
  description: "Business, location, social and marketplace settings.",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettings();
  const shipping = getShippingConfig();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Store settings"
        description="Public business details, store location, social profiles and marketplace links. Everything here is written to the database and revalidated across the storefront."
      />
      <SettingsForm
        settings={settings}
        shipping={shipping}
        integrations={{
          email: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
          google: Boolean(
            process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
          ),
        }}
      />
    </div>
  );
}
