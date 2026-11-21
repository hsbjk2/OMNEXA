import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/site/policy-page";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Return policy",
  description:
    "Cancellations, damaged items and the current return position for OMNEXA WhatsApp purchase enquiries.",
  openGraph: {
    title: "Return policy — OMNEXA",
    description:
      "What can and cannot happen with returns while OMNEXA remains a catalogue and WhatsApp enquiry store.",
  },
};

export default async function ReturnsPolicyPage() {
  const settings = await getSiteSettings();

  return (
    <PolicyPage
      title="Returns"
      eyebrow="Policies"
      intro="A transparent account of cancellations and returns while the store is still a demonstration — including the decisions that have not yet been made."
      currentHref="/policies/returns"
      settings={settings}
      notice={
        <>
          <strong className="font-semibold">No live returns are operating yet.</strong>{" "}
          The final return window, eligibility rules, refund method and timelines
          have not been supplied. This page states what is true now and marks
          every policy decision that must be settled before launch, rather than
          inventing consumer terms.
        </>
      }
      sections={[
        {
          heading: "The current position",
          body: (
            <>
              <p>
                OMNEXA is a catalogue and WhatsApp shopping-assistance
                storefront. Adding a product to your bag or preparing a WhatsApp
                message does not create an order, reserve stock, collect payment
                or dispatch goods. The catalogue is demo data. Any purchase is
                arranged directly with the seller in WhatsApp, so there is no
                online order to return.
              </p>
              <p>
                A live return policy requires the operator to decide a return
                window, which items are eligible, who pays return shipping, how
                refunds are issued and how long they take. Those choices have not
                been made, so they are not presented here as if they had been.
              </p>
            </>
          ),
        },
        {
          heading: "Cancelling an order",
          body: (
            <>
              <p>
                Because the website does not create an order, there is no online
                order number or order status. If you have already agreed a
                purchase with the seller on WhatsApp, message the same chat
                before dispatch to ask about cancellation. Stock shown on the
                website is not reserved for you.
              </p>
              <p>
                Once a live order has been handed to a courier, cancellation may
                no longer be possible; the eventual policy should say exactly
                where that cut-off falls. Do not assume a cancellation has been
                accepted until the seller confirms it in the WhatsApp chat.
              </p>
            </>
          ),
        },
        {
          heading: "Damaged, wrong or missing items",
          body: (
            <>
              <p>
                When the store begins shipping, this section will explain how to
                report a damaged, incorrect or missing item, the evidence
                required and the resolution offered. The sensible baseline is to
                contact the seller in the same WhatsApp chat with the product,
                delivery date and clear photographs of the parcel and product,
                and to keep the packaging until the issue is resolved — but that
                is guidance, not a live claims promise.
              </p>
              <p>
                For the demonstration, reporting a data or ordering problem to{" "}
                <a href={`mailto:${settings.contactEmail}`}>
                  {settings.contactEmail}
                </a>{" "}
                is still welcome.
              </p>
            </>
          ),
        },
        {
          heading: "Hygiene and product eligibility",
          body: (
            <>
              <p>
                A live cosmetics and jewellery policy normally needs to exclude
                opened or used skincare, makeup, applicators and pierced
                jewellery, because those items cannot be safely resold. Sealed,
                unopened products with intact packaging are the usual baseline.
              </p>
              <p>
                This is what the final policy is expected to cover, not a
                promise that a particular item is eligible today. The operator
                must specify the exact exclusions, any damaged-on-arrival
                exception and whether hygiene-sealed items can be returned once
                the seal is broken.
              </p>
            </>
          ),
        },
        {
          heading: "Refunds and exchanges",
          body: (
            <>
              <p>
                No online payment gateway is connected, so there is no automatic
                gateway refund flow. Payments are arranged directly with the
                seller on WhatsApp; if a purchase is cancelled after payment, the
                refund is arranged with the seller in the same chat. The exact
                process, timing and any fees are not configured on this website
                and should be confirmed with the seller before paying.
              </p>
              <p>
                Refund timelines, exchange availability, return shipping costs
                and restocking fees have not been defined. They should be
                published here before any real transaction is accepted.
              </p>
            </>
          ),
        },
        {
          heading: "What the storefront supports today",
          body: (
            <>
              <p>
                The storefront supports browsing, a persistent bag and wishlist,
                saved addresses, recently viewed products, search history and a
                prefilled WhatsApp enquiry. It does not maintain order status,
                payment status, order history or online order management.
              </p>
              <p>
                You can read the <Link href="/policies/shipping">shipping policy</Link>{" "}
                for the current delivery position and the{" "}
                <Link href="/policies/terms">terms</Link> for the WhatsApp
                enquiry caveats.
              </p>
            </>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Questions about a purchase enquiry, a cancellation or the eventual
              return process can be sent to{" "}
              <a href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>{" "}
              or through the <Link href="/contact">contact page</Link>. If you
              have already spoken to the seller on WhatsApp, continue in that
              chat. This policy is dated 21 November 2026.
            </p>
          ),
        },
      ]}
    />
  );
}
