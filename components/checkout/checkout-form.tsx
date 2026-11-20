"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  MapPin,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { placeOrderAction, type CheckoutState } from "@/app/actions/checkout";
import { useStore } from "@/components/providers/store-provider";
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

const initialState: CheckoutState = { status: "idle" };

export function CheckoutForm({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const { cart, user, clearCart, shipping } = useStore();
  const [state, formAction, pending] = useActionState(
    placeOrderAction,
    initialState,
  );
  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  const [selectedAddress, setSelectedAddress] = useState<string | null>(
    defaultAddress?.id ?? null,
  );
  const [details, setDetails] = useState({
    customerName: defaultAddress?.fullName || user?.name || "",
    email: user?.email || "",
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

  useEffect(() => {
    if (state.status === "success" && state.order) {
      clearCart();
      router.replace(
        `/order/${state.order.orderNumber}?token=${encodeURIComponent(
          state.order.token,
        )}`,
      );
    }
  }, [state, clearCart, router]);

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

  if (cart.length === 0 && state.status !== "success") {
    return (
      <section className="bg-soft">
        <div className="container-page py-20 text-center sm:py-28">
          <p className="eyebrow text-forest/45">Checkout</p>
          <h1 className="mt-4 font-display text-4xl">Your bag is empty.</h1>
          <p className="mt-3 text-sm text-muted">
            Add a piece before continuing to checkout.
          </p>
          <Link href="/shop" className="btn btn-forest mt-6">
            Shop the collection <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    );
  }

  if (state.status === "success") {
    return (
      <section className="bg-soft">
        <div className="container-page flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-light text-forest">
            <Check className="size-6" />
          </span>
          <h1 className="mt-5 font-display text-4xl">Order placed.</h1>
          <p className="mt-2 text-sm text-muted">Taking you to your confirmation…</p>
          <Loader2 className="mt-5 size-5 animate-spin text-forest/40" />
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
              <p className="eyebrow text-forest/45">Secure checkout</p>
              <h1 className="mt-3 font-display text-[clamp(2.7rem,5vw,4.2rem)] leading-[0.96] tracking-[-0.04em]">
                Almost yours.
              </h1>
            </div>
            <p className="flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.13em] text-forest/45">
              <Lock className="size-3.5" /> Server-verified pricing
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
          <input type="hidden" name="paymentMethod" value="COD" />

          <div className="order-1 space-y-9">
            {state.status === "error" && state.message && (
              <div
                className="border border-wine/25 bg-[#f7eaea] px-4 py-3 text-sm leading-relaxed text-wine"
                role="alert"
              >
                {state.message}
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
                    onChange={(event) => setField("customerName", event.target.value)}
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
                  <label htmlFor="email" className="field-label">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={details.email}
                    onChange={(event) => setField("email", event.target.value)}
                    autoComplete="email"
                    required
                    className="field"
                    aria-invalid={Boolean(state.errors?.email)}
                  />
                  {state.errors?.email && (
                    <p className="field-error">{state.errors.email}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="field-label">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
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
                    Address line 1
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
                  />
                  {state.errors?.line1 && (
                    <p className="field-error">{state.errors.line1}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="line2" className="field-label">
                    Address line 2 <span className="normal-case tracking-normal text-muted/50">(optional)</span>
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
                    Order notes <span className="normal-case tracking-normal text-muted/50">(optional)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    maxLength={400}
                    value={details.notes}
                    onChange={(event) => setField("notes", event.target.value)}
                    className="field resize-y"
                    placeholder="Anything we should know about this delivery?"
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
                <h2 className="font-display text-2xl">Payment</h2>
              </div>
              <div className="mt-4 border border-forest bg-light/50 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-4 items-center justify-center rounded-full border border-forest bg-forest">
                    <span className="size-1.5 rounded-full bg-lime" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-forest">
                      Cash on delivery
                    </p>
                    <p className="mt-1 text-[0.74rem] leading-relaxed text-muted">
                      Pay in cash when your order arrives. No online payment is
                      collected on this storefront.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-[0.72rem] leading-relaxed text-muted">
              <input
                type="checkbox"
                required
                className="mt-0.5 size-4 accent-forest"
              />
              <span>
                I agree to the{" "}
                <Link href="/policies/terms" className="underline underline-offset-2 hover:text-forest">
                  terms &amp; conditions
                </Link>
                ,{" "}
                <Link href="/policies/returns" className="underline underline-offset-2 hover:text-forest">
                  return policy
                </Link>{" "}
                and{" "}
                <Link href="/policies/privacy" className="underline underline-offset-2 hover:text-forest">
                  privacy policy
                </Link>
                .
              </span>
            </label>

            <div className="flex items-start gap-2 border border-line bg-white px-4 py-3 text-[0.66rem] leading-relaxed text-muted">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-forest/45" />
              This is a demonstration storefront: orders are recorded in the
              demo database and the catalogue items are marked demo data.
            </div>
          </div>

          <aside className="order-2 lg:sticky lg:top-28 lg:self-start">
            <div className="border border-line bg-white">
              <div className="border-b border-line px-5 py-4">
                <p className="eyebrow text-forest/50">Order summary</p>
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
                  <span className="text-muted">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Delivery</span>
                  <span>{delivery === 0 ? "Complimentary" : formatPrice(delivery)}</span>
                </div>
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <span className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-forest">
                    Total
                  </span>
                  <span className="font-display text-2xl">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              <div className="border-t border-line px-5 py-4">
                <button
                  type="submit"
                  disabled={pending}
                  className="btn btn-forest w-full"
                >
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Placing order…
                    </>
                  ) : (
                    <>
                      Place order · {formatPrice(total)}
                      <ArrowRight className="size-3.5" />
                    </>
                  )}
                </button>
                <div className="mt-3 flex items-center justify-center gap-3 text-[0.58rem] uppercase tracking-[0.1em] text-muted/55">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3" /> Secure
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="size-3" /> COD
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </section>
    </>
  );
}
