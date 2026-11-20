import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/site/policy-page";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Return policy",
  description:
    "Cancellations, damaged items and the current return status of the OMNEXA demonstration storefront.",
  openGraph: {
    title: "Return policy — OMNEXA",
    description:
      "What can and cannot happen with returns while OMNEXA remains a demonstration store.",
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
                OMNEXA is a demonstration store. Orders placed through it are
                recorded in the database and can be managed in the admin panel,
                but they are not dispatched, no payment is collected and no
                physical goods change hands. There is therefore nothing to
                return for a demo order.
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
                Before dispatch, contact the store with the order number and the
                email or phone used at checkout. In this demo an admin can move a
                pending or confirmed order to cancelled, which also restores the
                reserved stock to the catalogue.
              </p>
              <p>
                Once a live order has been handed to a courier, cancellation may
                no longer be possible; the eventual policy should say exactly
                where that cut-off falls. Do not assume a cancellation has been
                accepted until the store confirms it. The order status on your
                account or private confirmation link is the source of truth.
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
                contact the store with the order number and clear photographs of
                the parcel and product, and to keep the packaging until the
                issue is resolved — but that is guidance, not a live claims
                promise.
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
                No online payment is connected, so there is no gateway refund
                flow. Demo cash-on-delivery orders do not collect cash, and no
                refund is due on them. If an order is marked paid and then
                cancelled in the admin panel, the operator must decide how the
                money is returned — for COD that might be a bank transfer using
                details supplied securely by the customer, but the process is not
                configured.
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
                Every order has a status and a payment status. Admins can update
                both, cancel an order and restore stock, and customers can review
                their order history. This is operational plumbing for a future
                policy, not a substitute for one.
              </p>
              <p>
                You can read the <Link href="/policies/shipping">shipping policy</Link>{" "}
                for the current delivery position and the{" "}
                <Link href="/policies/terms">terms</Link> for the demo-order
                caveats.
              </p>
            </>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Questions about a demo order, a cancellation or the eventual return
              process can be sent to{" "}
              <a href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>{" "}
              or through the <Link href="/contact">contact page</Link>. Include
              the order number if you have one. This policy is dated 18 November
              2026.
            </p>
          ),
        },
      ]}
    />
  );
}
