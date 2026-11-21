"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import {
  prepareOrderEnquiryAction,
  type OrderRequestState,
} from "@/app/actions/order-request";
import { useStore } from "@/components/providers/store-provider";
import { WhatsAppIcon } from "@/components/site/social-icons";
import { formatPrice } from "@/lib/utils";

type Address = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

const initialState: OrderRequestState = { status: "idle" };

export function OrderRequestForm({
  addresses,
  whatsappConfigured,
}: {
  addresses: Address[];
  whatsappConfigured: boolean;
}) {
  const { cart, user, shipping } = useStore();
  const [state, formAction, pending] = useActionState(
    prepareOrderEnquiryAction,
    initialState,
  );

  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    defaultAddress?.id ?? null,
  );
  const [details, setDetails] = useState({
    customerName: defaultAddress?.fullName || user?.name || "",
    phone: defaultAddress?.phone || user?.phone || "",
    line1: defaultAddress?.line1 || "",
    line2: defaultAddress?.line2 || "",
    city: defaultAddress?.city || "",
    state: defaultAddress?.state || "",
    pincode: defaultAddress?.pincode || "",
    notes: "",
  });

  const subtotal = cart.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );
  const delivery = subtotal >= shipping.threshold ? 0 : shipping.rate;
  const total = subtotal + delivery;

  const itemsJson = useMemo(
    () =>
      JSON.stringify(
        cart.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          variant: line.variant,
        })),
      ),
    [cart],
  );

  function chooseAddress(address: Address) {
    setSelectedAddress(address.id);
    setDetails((current) => ({
      ...current,
      customerName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }));
  }

  function setField(key: keyof typeof details, value: string) {
    setDetails((current) => ({ ...current, [key]: value }));
    if (key !== "notes") setSelectedAddress(null);
  }

  if (state.status === "success" && state.whatsappUrl) {
    return (
      <section className="bg-soft">
        <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center sm:py-24">
          <span className="flex size-16 items-center justify-center rounded-full bg-[#128c47] text-white">
            <WhatsAppIcon className="size-7" />
          </span>
          <p className="eyebrow mt-6 text-forest/45">Your enquiry is ready</p>
          <h1 className="mt-3 max-w-2xl font-display text-[clamp(2.6rem,5vw,4.4rem)] leading-[0.96] tracking-[-0.04em]">
            One message away.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
            WhatsApp will open with your products, delivery details and
            estimated total already written out. Review the message and send it
            to start the conversation with OMNEXA.
          </p>

          {state.summary && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border border-line bg-white px-6 py-4 text-sm">
              <span className="text-muted">
                {state.summary.itemCount}{" "}
                {state.summary.itemCount === 1 ? "piece" : "pieces"}
              </span>
              <span className="text-muted">
                Estimated total{" "}
                <strong className="font-semibold text-ink">
                  {formatPrice(state.summary.total)}
                </strong>
              </span>
            </div>
          )}

          <a
            href={state.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-forest mt-7 h-12 px-7"
          >
            <WhatsAppIcon className="size-4" /> Open WhatsApp and send
          </a>
          <p className="mt-4 max-w-md text-[0.68rem] leading-relaxed text-muted/70">
            Nothing has been charged or confirmed on this website. Your bag is
            still saved. OMNEXA will confirm availability, delivery charges and
            payment arrangements in the chat.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/cart" className="btn btn-outline">
              Back to bag
            </Link>
            <Link href="/shop" className="btn-quiet">
              Continue shopping <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="bg-soft">
        <div className="container-page py-16 text-center sm:py-24">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-light text-forest">
            <ShoppingBag className="size-6" strokeWidth={1.3} />
          </span>
          <p className="eyebrow mt-6 text-forest/45">WhatsApp enquiry</p>
          <h1 className="mt-3 font-display text-4xl">Your bag is empty.</h1>
          <p className="mt-3 text-sm text-muted">
            Add a piece before preparing your WhatsApp message.
          </p>
          <Link href="/shop" className="btn btn-forest mt-6">
            Shop the collection <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-page py-9 sm:py-12">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-forest/50 transition hover:text-forest"
          >
            <ArrowLeft className="size-3.5" /> Back to bag
          </Link>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow text-forest/45">Order via WhatsApp</p>
              <h1 className="mt-3 font-display text-[clamp(2.7rem,5vw,4.2rem)] leading-[0.96] tracking-[-0.04em]">
                Where should it go?
              </h1>
            </div>
            <p className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.13em] text-forest/45">
              <MessageCircle className="size-3.5" /> No payment on this website
            </p>
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <form
          action={formAction}
          className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] lg:gap-16"
        >
          <input type="hidden" name="items" value={itemsJson} />

          <div className="order-1 space-y-9">
            {!whatsappConfigured && (
              <div className="flex items-start gap-2.5 border border-[#d9c88f] bg-[#fbf6e6] px-4 py-3 text-[0.74rem] leading-relaxed text-[#5f5328]">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                <p>
                  WhatsApp ordering is not configured for this store yet. Add a
                  business number in admin settings, or use the{" "}
                  <Link
                    href="/contact"
                    className="font-semibold underline underline-offset-2"
                  >
                    contact page
                  </Link>{" "}
                  to reach the seller.
                </p>
              </div>
            )}

            {state.status === "error" && state.message && (
              <div
                className="border border-wine/25 bg-[#f7eaea] px-4 py-3 text-sm leading-relaxed text-wine"
                role="alert"
              >
                {state.message}
              </div>
            )}

            {!user && (
              <div className="flex items-start gap-2.5 border border-line bg-white px-4 py-3 text-[0.72rem] leading-relaxed text-muted">
                <MapPin className="mt-0.5 size-3.5 shrink-0 text-forest/45" />
                <p>
                  Have an OMNEXA account?{" "}
                  <Link
                    href="/login?next=%2Forder-request"
                    className="font-semibold text-forest underline underline-offset-2"
                  >
                    Sign in
                  </Link>{" "}
                  to use a saved address and keep your bag, wishlist and browsing
                  history together. You can also continue as a guest.
                </p>
              </div>
            )}

            {user && addresses.length > 0 && (
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-forest text-[0.6rem] font-bold text-white">
                    01
                  </span>
                  <h2 className="font-display text-2xl">Use a saved address</h2>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => chooseAddress(address)}
                      className={`border p-4 text-left transition ${
                        selectedAddress === address.id
                          ? "border-forest bg-light/60"
                          : "border-line bg-white hover:border-forest/35"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[0.58rem] font-bold uppercase tracking-[0.13em] text-forest/60">
                          {address.label}
                        </span>
                        {selectedAddress === address.id && (
                          <Check className="size-3.5 text-forest" />
                        )}
                      </div>
                      <p className="mt-2 text-sm font-medium text-ink">
                        {address.fullName}
                      </p>
                      <p className="mt-1 text-[0.72rem] leading-relaxed text-muted">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
                        {address.state} {address.pincode}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[0.65rem] text-muted/65">
                  You can edit the fields below after choosing an address.
                </p>
              </div>
            )}

            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-forest text-[0.6rem] font-bold text-white">
                  {user && addresses.length > 0 ? "02" : "01"}
                </span>
                <h2 className="font-display text-2xl">Contact details</h2>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="customerName" className="field-label">
                    Full name
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    value={details.customerName}
                    onChange={(event) =>
                      setField("customerName", event.target.value)
                    }
                    autoComplete="name"
                    required
                    className="field"
                    aria-invalid={Boolean(state.errors?.customerName)}
                  />
                  {state.errors?.customerName && (
                    <p className="field-error">{state.errors.customerName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="field-label">
                    Mobile number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    value={details.phone}
                    onChange={(event) => setField("phone", event.target.value)}
                    autoComplete="tel"
                    required
                    className="field"
                    aria-invalid={Boolean(state.errors?.phone)}
                  />
                  {state.errors?.phone && (
                    <p className="field-error">{state.errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-forest text-[0.6rem] font-bold text-white">
                  {user && addresses.length > 0 ? "03" : "02"}
                </span>
                <h2 className="font-display text-2xl">Delivery address</h2>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="line1" className="field-label">
                    Complete address
                  </label>
                  <input
                    id="line1"
                    name="line1"
                    value={details.line1}
                    onChange={(event) => setField("line1", event.target.value)}
                    autoComplete="address-line1"
                    required
                    className="field"
                    aria-invalid={Boolean(state.errors?.line1)}
                    placeholder="House / flat, building, street, area"
                  />
                  {state.errors?.line1 && (
                    <p className="field-error">{state.errors.line1}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="line2" className="field-label">
                    Landmark or apartment{" "}
                    <span className="normal-case tracking-normal text-muted/50">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="line2"
                    name="line2"
                    value={details.line2}
                    onChange={(event) => setField("line2", event.target.value)}
                    autoComplete="address-line2"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="field-label">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    value={details.city}
                    onChange={(event) => setField("city", event.target.value)}
                    autoComplete="address-level2"
                    required
                    className="field"
                    aria-invalid={Boolean(state.errors?.city)}
                  />
                  {state.errors?.city && (
                    <p className="field-error">{state.errors.city}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="state" className="field-label">
                    State
                  </label>
                  <input
                    id="state"
                    name="state"
                    value={details.state}
                    onChange={(event) => setField("state", event.target.value)}
                    autoComplete="address-level1"
                    required
                    className="field"
                    aria-invalid={Boolean(state.errors?.state)}
                  />
                  {state.errors?.state && (
                    <p className="field-error">{state.errors.state}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="pincode" className="field-label">
                    PIN code
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    inputMode="numeric"
                    pattern="[1-9][0-9]{5}"
                    maxLength={6}
                    value={details.pincode}
                    onChange={(event) => setField("pincode", event.target.value)}
                    autoComplete="postal-code"
                    required
                    className="field"
                    aria-invalid={Boolean(state.errors?.pincode)}
                  />
                  {state.errors?.pincode && (
                    <p className="field-error">{state.errors.pincode}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="field-label">
                    Delivery instructions{" "}
                    <span className="normal-case tracking-normal text-muted/50">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    maxLength={400}
                    value={details.notes}
                    onChange={(event) => setField("notes", event.target.value)}
                    className="field resize-y"
                    placeholder="Best time to deliver, gate code, or anything else we should know."
                  />
                </div>
              </div>

              {user && (
                <label className="mt-4 flex items-start gap-2.5 text-[0.75rem] leading-relaxed text-muted">
                  <input
                    type="checkbox"
                    name="saveAddress"
                    className="mt-0.5 size-4 accent-forest"
                  />
                  Save this address to my account for next time.
                </label>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-forest text-[0.6rem] font-bold text-white">
                  {user && addresses.length > 0 ? "04" : "03"}
                </span>
                <h2 className="font-display text-2xl">How it works</h2>
              </div>
              <div className="mt-4 border border-[#128c47]/25 bg-[#f1f8f3] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#128c47] text-white">
                    <WhatsAppIcon className="size-[18px]" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-forest">
                      This is an order enquiry, not a checkout.
                    </p>
                    <p className="mt-1 text-[0.74rem] leading-relaxed text-muted">
                      Nothing is charged here and no order is created on this
                      website. We open WhatsApp with your products and delivery
                      details. The seller replies with availability, delivery
                      charges and payment arrangements.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-start gap-2.5 text-[0.74rem] leading-relaxed text-muted">
                <input
                  type="checkbox"
                  name="acknowledgement"
                  required
                  className="mt-0.5 size-4 accent-forest"
                  aria-invalid={Boolean(state.errors?.acknowledgement)}
                />
                <span>
                  I understand this is an enquiry. OMNEXA will confirm
                  availability, delivery charges and payment directly on
                  WhatsApp, and no payment is collected on this website.
                </span>
              </label>
              {state.errors?.acknowledgement && (
                <p className="field-error">{state.errors.acknowledgement}</p>
              )}
            </div>

            <div className="flex items-start gap-2 border border-line bg-white px-4 py-3 text-[0.66rem] leading-relaxed text-muted">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-forest/45" />
              <p>
                Product details, photography and catalogue prices are
                demonstration data. Your delivery details are only included in
                the WhatsApp message you choose to send. The cart stays saved in
                your bag.
              </p>
            </div>
          </div>

          <aside className="order-2 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-white">
              <div className="border-b border-line px-5 py-4">
                <p className="eyebrow text-forest/50">Your enquiry</p>
              </div>
              <ul className="max-h-[360px] space-y-4 overflow-y-auto px-5 py-5">
                {cart.map((line) => (
                  <li
                    key={`${line.productId}-${line.variant}`}
                    className="flex gap-3"
                  >
                    <div className="relative h-[74px] w-[58px] shrink-0 overflow-hidden bg-light">
                      <Image
                        src={line.image || "/images/fallback-product.webp"}
                        alt={line.name}
                        fill
                        sizes="58px"
                        className="object-cover"
                      />
                      <span className="absolute right-0 top-0 flex size-4 items-center justify-center bg-forest text-[0.52rem] font-bold text-white">
                        {line.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[1.02rem] leading-snug">
                        {line.name}
                      </p>
                      {line.variant && (
                        <p className="mt-0.5 text-[0.6rem] uppercase tracking-[0.1em] text-muted">
                          {line.variant}
                        </p>
                      )}
                      <p className="mt-1 text-[0.72rem] font-semibold text-forest">
                        {formatPrice(line.price * line.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="space-y-2.5 border-t border-line px-5 py-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Estimated products</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Estimated delivery</span>
                  <span>
                    {delivery === 0 ? "Complimentary" : formatPrice(delivery)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <span className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-forest">
                    Estimated total
                  </span>
                  <span className="font-display text-2xl">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              <div className="border-t border-line px-5 py-4">
                <p className="mb-3 text-[0.65rem] leading-relaxed text-muted">
                  The final total is confirmed by the seller on WhatsApp.
                  Nothing is charged on this website.
                </p>
                <button
                  type="submit"
                  disabled={pending || !whatsappConfigured}
                  className="btn btn-forest w-full"
                >
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Preparing your
                      message…
                    </>
                  ) : !whatsappConfigured ? (
                    <>
                      <WhatsAppIcon className="size-4" /> WhatsApp ordering
                      unavailable
                    </>
                  ) : (
                    <>
                      <WhatsAppIcon className="size-4" /> Open WhatsApp ·{" "}
                      {formatPrice(total)}
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-[0.62rem] leading-relaxed text-muted">
                  Order enquiry only · No payment collected here
                </p>
              </div>
            </div>
          </aside>
        </form>
      </section>
    </>
  );
}
