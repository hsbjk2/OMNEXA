"use client";

import { useActionState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Loader2,
  Save,
} from "lucide-react";
import { saveSettingsAction } from "@/app/actions/admin";
import { initialActionState } from "@/lib/action-state";
import type { StoreSettings } from "@/lib/settings";

function Input({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  hint,
  error,
  autoComplete,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="field"
        aria-invalid={Boolean(error)}
      />
      {error ? <p className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

export function SettingsForm({
  settings,
  shipping,
  integrations,
}: {
  settings: StoreSettings;
  shipping: { rate: number; threshold: number };
  integrations: { email: boolean; google: boolean };
}) {
  const [state, formAction, pending] = useActionState(
    saveSettingsAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <div className="space-y-5">
        {state.status === "success" && (
          <div className="flex items-start gap-2 border border-line bg-light/70 px-4 py-3 text-[0.78rem] text-forest">
            <Check className="mt-0.5 size-4 shrink-0" /> {state.message}
          </div>
        )}
        {state.status === "error" && state.message && (
          <div
            role="alert"
            className="flex items-start gap-2 border border-wine/25 bg-[#f7eaea] px-4 py-3 text-[0.78rem] text-wine"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.message}
          </div>
        )}

        <section className="border border-line bg-white">
          <div className="border-b border-line px-4 py-3.5">
            <h2 className="text-[0.85rem] font-semibold">Business identity</h2>
            <p className="mt-0.5 text-[0.66rem] text-muted">
              Shown in the footer, contact page and structured data.
            </p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Business name"
                name="businessName"
                defaultValue={settings.businessName}
                error={state.errors?.businessName}
              />
            </div>
            <Input
              label="Contact email"
              name="contactEmail"
              type="email"
              defaultValue={settings.contactEmail}
              error={state.errors?.contactEmail}
              hint="A demo .example address is labelled honestly on the storefront."
            />
            <Input
              label="Contact phone"
              name="contactPhone"
              type="tel"
              defaultValue={settings.contactPhone}
              error={state.errors?.contactPhone}
              hint="Leave blank to hide the phone number."
            />
            <Input
              label="WhatsApp number"
              name="whatsapp"
              type="tel"
              defaultValue={settings.whatsapp}
              error={state.errors?.whatsapp}
              hint="Used for every product and cart enquiry. Include the country code. Leave blank to hide WhatsApp ordering."
            />
          </div>
        </section>

        <section className="border border-line bg-white">
          <div className="border-b border-line px-4 py-3.5">
            <h2 className="text-[0.85rem] font-semibold">Store location</h2>
            <p className="mt-0.5 text-[0.66rem] text-muted">
              Nothing is invented on the storefront. Leave these blank until the
              real address is confirmed.
            </p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Address line 1"
                name="addressLine1"
                defaultValue={settings.addressLine1}
                error={state.errors?.addressLine1}
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Address line 2"
                name="addressLine2"
                defaultValue={settings.addressLine2}
                error={state.errors?.addressLine2}
              />
            </div>
            <Input
              label="City"
              name="city"
              defaultValue={settings.city}
              error={state.errors?.city}
            />
            <Input
              label="State"
              name="state"
              defaultValue={settings.state}
              error={state.errors?.state}
            />
            <Input
              label="PIN code"
              name="pincode"
              defaultValue={settings.pincode}
              error={state.errors?.pincode}
            />
            <div className="sm:col-span-2">
              <Input
                label="Google Maps embed URL"
                name="mapEmbedUrl"
                type="url"
                defaultValue={settings.mapEmbedUrl}
                placeholder="https://www.google.com/maps/embed?pb=…"
                error={state.errors?.mapEmbedUrl}
                hint="Only embed a map once the address is final. Use the official embed src URL."
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Directions link"
                name="mapLink"
                type="url"
                defaultValue={settings.mapLink}
                placeholder="https://maps.google.com/…"
                error={state.errors?.mapLink}
                hint="Leave blank to generate a Google Maps search from the address."
              />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Google Business listing URL"
                name="googleBusinessUrl"
                type="url"
                defaultValue={settings.googleBusinessUrl}
                placeholder="https://share.google/… or https://g.page/…"
                error={state.errors?.googleBusinessUrl}
                hint="Optional second link to the verified Google listing, shown next to directions."
              />
            </div>
          </div>
        </section>

        <section className="border border-line bg-white">
          <div className="border-b border-line px-4 py-3.5">
            <h2 className="text-[0.85rem] font-semibold">Social and marketplace</h2>
            <p className="mt-0.5 text-[0.66rem] text-muted">
              Store-level links appear only when they are real, complete URLs.
              Product-level Amazon and Flipkart links are added on each product.
            </p>
          </div>
          <div className="grid gap-4 p-4 sm:grid-cols-2">
            <Input
              label="Instagram URL"
              name="instagramUrl"
              type="url"
              defaultValue={settings.instagramUrl}
              placeholder="https://instagram.com/…"
              error={state.errors?.instagramUrl}
            />
            <Input
              label="Facebook URL"
              name="facebookUrl"
              type="url"
              defaultValue={settings.facebookUrl}
              placeholder="https://facebook.com/…"
              error={state.errors?.facebookUrl}
            />
            <Input
              label="WhatsApp channel URL"
              name="whatsappChannelUrl"
              type="url"
              defaultValue={settings.whatsappChannelUrl}
              placeholder="https://whatsapp.com/channel/…"
              error={state.errors?.whatsappChannelUrl}
              hint="Public channel only. Leave blank to hide the channel link."
            />
            <Input
              label="WhatsApp catalogue URL"
              name="whatsappCatalogueUrl"
              type="url"
              defaultValue={settings.whatsappCatalogueUrl}
              placeholder="https://wa.me/c/…"
              error={state.errors?.whatsappCatalogueUrl}
              hint="Public WhatsApp catalogue link. Leave blank to hide the catalogue buttons."
            />
            <Input
              label="Amazon storefront URL"
              name="amazonUrl"
              type="url"
              defaultValue={settings.amazonUrl}
              placeholder="https://amazon.in/…"
              error={state.errors?.amazonUrl}
            />
            <Input
              label="Flipkart storefront URL"
              name="flipkartUrl"
              type="url"
              defaultValue={settings.flipkartUrl}
              placeholder="https://flipkart.com/…"
              error={state.errors?.flipkartUrl}
            />
          </div>
        </section>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="submit" disabled={pending} className="btn btn-forest">
            {pending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="size-3.5" /> Save settings
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <section className="border border-line bg-white p-4">
          <h2 className="text-[0.85rem] font-semibold">Operations</h2>
          <p className="mt-0.5 text-[0.66rem] text-muted">
            Configured in the server environment, not the database.
          </p>
          <dl className="mt-3 space-y-2.5 text-[0.72rem]">
            <div className="flex justify-between gap-3 border-b border-line pb-2.5">
              <dt className="text-muted">Flat shipping</dt>
              <dd className="font-medium">₹{shipping.rate}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-line pb-2.5">
              <dt className="text-muted">Free over</dt>
              <dd className="font-medium">₹{shipping.threshold}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-line pb-2.5">
              <dt className="text-muted">Online payment</dt>
              <dd className="font-medium">Not collected</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Ordering</dt>
              <dd className="font-medium">WhatsApp enquiry</dd>
            </div>
          </dl>
          <p className="mt-3 text-[0.64rem] leading-relaxed text-muted/65">
            OMNEXA does not collect payment details or create online orders.
            Customers prepare an enquiry and continue with the seller on
            WhatsApp. Change shipping with <code>SHIPPING_FLAT_RATE</code> and{" "}
            <code>FREE_SHIPPING_THRESHOLD</code>, then restart the server.
          </p>
        </section>

        <section className="border border-line bg-white p-4">
          <h2 className="text-[0.85rem] font-semibold">Integrations</h2>
          <div className="mt-3 space-y-2 text-[0.72rem]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted">Email delivery (Resend)</span>
              <span
                className={`text-[0.6rem] font-bold uppercase tracking-[0.08em] ${
                  integrations.email ? "text-bright" : "text-[#8a6f24]"
                }`}
              >
                {integrations.email ? "Configured" : "Dev preview"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted">Google sign-in</span>
              <span
                className={`text-[0.6rem] font-bold uppercase tracking-[0.08em] ${
                  integrations.google ? "text-bright" : "text-muted/45"
                }`}
              >
                {integrations.google ? "Configured" : "Optional"}
              </span>
            </div>
          </div>
          <div className="mt-3 border-t border-line pt-3 text-[0.64rem] leading-relaxed text-muted/65">
            Without Resend, verification and reset links are printed to the server
            console in development only. Google sign-in buttons stay hidden until
            credentials exist.
          </div>
        </section>

        <section className="border border-line bg-light/60 p-4">
          <h2 className="text-[0.85rem] font-semibold">Honesty check</h2>
          <ul className="mt-2 space-y-1.5 text-[0.66rem] leading-relaxed text-forest/65">
            <li>· Demo catalogue products are labelled on the storefront.</li>
            <li>· Blank location fields show a transparent “being finalised” note.</li>
            <li>· No reviews, ratings or invented order counts are displayed.</li>
            <li>· Marketplace links only publish when saved as complete URLs.</li>
            <li>· No payment is collected on the website; every purchase is a WhatsApp enquiry.</li>
          </ul>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-forest transition hover:text-bright"
          >
            Review storefront <ArrowUpRight className="size-3" />
          </a>
        </section>
      </div>
    </form>
  );
}
