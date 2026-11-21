import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/site/policy-page";
import { getSiteSettings } from "@/lib/settings";
import { getShippingConfig } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping policy",
  description:
    "How OMNEXA estimates delivery charges and how delivery is confirmed directly on WhatsApp.",
  openGraph: {
    title: "Shipping policy — OMNEXA",
    description:
      "Delivery estimates, WhatsApp confirmation and the current dispatch position of the OMNEXA storefront.",
  },
};

export default async function ShippingPolicyPage() {
  const settings = await getSiteSettings();
  const shipping = getShippingConfig();

  return (
    <PolicyPage
      title="Shipping"
      eyebrow="Policies"
      intro="How delivery is estimated, what happens when you send a WhatsApp enquiry, and the honest limits of delivery in this demonstration storefront."
      currentHref="/policies/shipping"
      settings={settings}
      notice={
        <>
          <strong className="font-semibold">
            No payment is collected on this website.
          </strong>{" "}
          Delivery charges shown here are estimates. OMNEXA confirms the final
          delivery charge, serviceability and payment arrangements with you
          directly on WhatsApp before anything is dispatched.
        </>
      }
      sections={[
        {
          heading: "The short version",
          body: (
            <ul>
              <li>
                A flat {formatPrice(shipping.rate)} delivery estimate applies to
                product subtotals below {formatPrice(shipping.threshold)}.
              </li>
              <li>
                Delivery is estimated as complimentary when the product subtotal
                reaches {formatPrice(shipping.threshold)} or more.
              </li>
              <li>
                The estimate is calculated on the server from the current
                catalogue and store settings, not from prices typed into the
                browser.
              </li>
              <li>
                The final delivery charge is confirmed by OMNEXA on WhatsApp and
                may differ for your address.
              </li>
              <li>
                This is a demonstration storefront. No order is created on the
                website and no parcel is dispatched by the website.
              </li>
            </ul>
          ),
        },
        {
          heading: "How the delivery estimate is calculated",
          body: (
            <>
              <p>
                When you prepare a WhatsApp enquiry, the product subtotal is
                added up from the current catalogue prices. If it is below{" "}
                {formatPrice(shipping.threshold)}, the configured flat estimate
                of {formatPrice(shipping.rate)} is added. At or above the
                threshold, the estimate shows complimentary delivery.
              </p>
              <p>
                These figures are store configuration, not a final quotation.
                They can change, and the seller may confirm a different amount
                for your PIN code, order size or delivery requirement. The
                amount confirmed in your WhatsApp conversation is the amount that
                applies.
              </p>
            </>
          ),
        },
        {
          heading: "Where OMNEXA delivers",
          body: (
            <>
              <p>
                The enquiry form asks for a full name, mobile number, complete
                address, city, state and PIN code — the details needed to
                discuss an Indian delivery. These details are placed into the
                WhatsApp message that you choose to send; they are not submitted
                to a courier from this website.
              </p>
              <p>
                The storefront does not maintain a public serviceability list or
                courier coverage map. Please share your PIN code in the WhatsApp
                conversation so the seller can confirm whether delivery is
                available. A live store should publish its real serviceable
                areas before accepting purchases.
              </p>
            </>
          ),
        },
        {
          heading: "How the WhatsApp enquiry works",
          body: (
            <>
              <p>
                From a product page or your bag, OMNEXA prepares a WhatsApp
                message containing the products, variants, quantities, unit
                prices, estimated total and your delivery details. You review
                and send that message yourself. The website does not send the
                message, create an order or reserve stock.
              </p>
              <p>
                The seller replies with availability, the final delivery charge
                and the payment arrangements. Nothing is charged on this
                website, and the conversation is an enquiry until the seller
                confirms the details. See{" "}
                <Link href="/policies/terms">terms</Link> for the full position.
              </p>
            </>
          ),
        },
        {
          heading: "Processing and delivery timelines",
          body: (
            <>
              <p>
                No dispatch cut-off, processing window, courier partner or
                guaranteed delivery date has been defined for this build, so
                none is displayed. The seller will share the current estimate in
                your WhatsApp conversation.
              </p>
              <p>
                Before launch, this page should state the real processing window,
                expected delivery range, courier partners, tracking method and
                what happens when delivery fails or an address is incomplete.
              </p>
            </>
          ),
        },
        {
          heading: "Address accuracy",
          body: (
            <>
              <p>
                Please enter a complete, accurate address and a reachable mobile
                number. OMNEXA cannot verify the address against a postal
                database. If you notice a mistake, correct it before sending the
                WhatsApp message, or tell the seller in the chat as soon as
                possible.
              </p>
              <p>
                Signed-in customers can save delivery details from{" "}
                <Link href="/account/addresses">your address book</Link> and
                reuse them the next time you prepare an enquiry.
              </p>
            </>
          ),
        },
        {
          heading: "Damaged, delayed or missing items",
          body: (
            <>
              <p>
                Because purchases are arranged directly with the seller, any
                delivery problem should be raised in the same WhatsApp
                conversation. Include your order details, a description of the
                problem and photographs where possible.
              </p>
              <p>
                The final replacement, refund and return position has not yet
                been published. See the{" "}
                <Link href="/policies/returns">return policy</Link> for the
                current position, or write to{" "}
                <a href={`mailto:${settings.contactEmail}`}>
                  {settings.contactEmail}
                </a>
                .
              </p>
            </>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Delivery questions can be sent to{" "}
              <a href={`mailto:${settings.contactEmail}`}>
                {settings.contactEmail}
              </a>{" "}
              or through the <Link href="/contact">contact page</Link>. This
              policy is a working draft for the demonstration storefront and
              will be completed before the store accepts live purchases.
            </p>
          ),
        },
      ]}
    />
  );
}
