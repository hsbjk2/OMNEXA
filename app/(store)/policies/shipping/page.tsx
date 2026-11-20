import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/site/policy-page";
import { getSiteSettings } from "@/lib/settings";
import { getShippingConfig } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping policy",
  description:
    "Shipping charges, checkout address rules and the current dispatch limits of the OMNEXA demonstration storefront.",
  openGraph: {
    title: "Shipping policy — OMNEXA",
    description:
      "How shipping is priced at checkout, and what the demo store does and does not do about dispatch.",
  },
};

export default async function ShippingPolicyPage() {
  const settings = await getSiteSettings();
  const shipping = getShippingConfig();

  return (
    <PolicyPage
      title="Shipping"
      eyebrow="Policies"
      intro="How shipping is calculated, what the checkout records and the honest limits of delivery in this demonstration."
      currentHref="/policies/shipping"
      settings={settings}
      notice={
        <>
          <strong className="font-semibold">Demo orders are not dispatched.</strong>{" "}
          The storefront calculates shipping and records an address correctly,
          but no courier is booked and no money changes hands. Dispatch service
          levels, serviceable PIN codes and courier partners have not been
          supplied and are not invented here.
        </>
      }
      sections={[
        {
          heading: "The short version",
          body: (
            <>
              <ul>
                <li>
                  A flat {formatPrice(shipping.rate)} shipping charge applies to
                  product subtotals below {formatPrice(shipping.threshold)}.
                </li>
                <li>
                  Shipping is free when the product subtotal reaches{" "}
                  {formatPrice(shipping.threshold)} or more.
                </li>
                <li>
                  Shipping is recalculated on the server at checkout, not trusted
                  from the browser.
                </li>
                <li>
                  Orders are completed on WhatsApp, where the seller confirms
                  the payment options.
                </li>
                <li>
                  This is a demonstration store: orders are recorded and can be
                  managed, but they are not picked, packed or shipped.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Where the checkout delivers",
          body: (
            <>
              <p>
                The address form collects a full name, phone number, address
                lines, city, state and PIN code — the fields used for an Indian
                delivery address. Prices are shown in Indian rupees and the
                order records the address exactly as entered.
              </p>
              <p>
                The demo does not maintain a serviceability list, courier
                coverage map or restricted-PIN-code rules. Every address that
                passes form validation can complete a demo order. A live store
                must define where it actually delivers before accepting real
                orders.
              </p>
            </>
          ),
        },
        {
          heading: "How shipping is charged",
          body: (
            <>
              <p>
                The product subtotal is added up from the current catalogue
                prices. If it is below {formatPrice(shipping.threshold)}, the
                configured flat charge of {formatPrice(shipping.rate)} is added.
                At or above the threshold, shipping is zero. The order total is
                product subtotal plus shipping.
              </p>
              <p>
                These figures are configuration, not marketing promises. The
                operator can change them through the shipping environment
                settings. The amount confirmed at checkout is the amount stored
                with the order. There is no tax configuration in this demo, so
                no tax line is added. See{" "}
                <Link href="/policies/terms">terms</Link> for the pricing
                caveat.
              </p>
            </>
          ),
        },
        {
          heading: "Ordering and payment on WhatsApp",
          body: (
            <>
              <p>
                Orders are completed in a WhatsApp conversation with the store.
                Checkout saves your order and opens WhatsApp with the items,
                total and delivery address already written out. The seller
                reviews the message and replies with the available payment
                options.
              </p>
              <p>
                No card, UPI or bank details are collected on this website, and
                no payment gateway is connected. Payment is arranged directly
                with the seller in the chat. Your order is packed and dispatched
                after the seller confirms payment.
              </p>
            </>
          ),
        },
        {
          heading: "Processing and delivery timelines",
          body: (
            <>
              <p>
                No dispatch cut-off, processing time, holiday schedule,
                delivery estimate or courier partner has been defined for this
                build, so none is displayed. Order statuses — pending, confirmed,
                packed, shipped, delivered and cancelled — exist so the admin can
                demonstrate the order lifecycle; a status change is not evidence
                that a parcel has moved.
              </p>
              <p>
                Before launch, this page should state the real processing
                window, expected delivery range, courier partners, tracking
                method and what happens when delivery fails or an address is
                incomplete.
              </p>
            </>
          ),
        },
        {
          heading: "Tracking an order",
          body: (
            <>
              <p>
                A confirmation page is available immediately after checkout at a
                private link containing an unguessable access token. Signed-in
                customers can also see their orders under{" "}
                <Link href="/account/orders">account orders</Link>. The order
                page shows the recorded address, items, totals and current
                status.
              </p>
              <p>
                There is no live courier tracking integration. If you lose the
                confirmation link, sign in with the account used at checkout or
                contact the store with the order number.
              </p>
            </>
          ),
        },
        {
          heading: "Address accuracy",
          body: (
            <>
              <p>
                Please enter a complete, accurate address and a reachable phone
                number. The store records what you submit and cannot verify it
                against a postal database. If you notice a mistake after placing
                an order, contact the store immediately; in this demo an admin
                may be able to correct the record before it is reset, but there
                is no guarantee once an order has moved beyond pending or
                confirmed.
              </p>
              <p>
                Saved addresses can be managed from{" "}
                <Link href="/account/addresses">your address book</Link> and
                reused at checkout.
              </p>
            </>
          ),
        },
        {
          heading: "Damaged, delayed or missing orders",
          body: (
            <>
              <p>
                This demo cannot experience a real transit delay, loss or
                damage. When the store begins dispatching, this section should
                explain how to report a problem, the evidence needed (such as
                unboxing photographs and the order number), the response window
                and whether a replacement or refund is offered.
              </p>
              <p>
                For now, if something about a demo order looks wrong, write to{" "}
                <a href={`mailto:${settings.contactEmail}`}>
                  {settings.contactEmail}
                </a>{" "}
                with the order number. See the{" "}
                <Link href="/policies/returns">return policy</Link> for the
                current cancellation position.
              </p>
            </>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Shipping questions can be sent to{" "}
              <a href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>{" "}
              or through the <Link href="/contact">contact page</Link>. This
              policy is dated 18 November 2026 and will be completed before the
              store accepts real orders.
            </p>
          ),
        },
      ]}
    />
  );
}
