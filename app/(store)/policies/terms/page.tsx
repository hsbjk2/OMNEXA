import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/site/policy-page";
import { getSiteSettings } from "@/lib/settings";
import { getShippingConfig } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description:
    "The terms that apply to browsing, accounts and WhatsApp product enquiries on the OMNEXA demonstration storefront.",
  openGraph: {
    title: "Terms & conditions — OMNEXA",
    description:
      "How the OMNEXA catalogue and WhatsApp enquiry model works, and what demonstration data means.",
  },
};

export default async function TermsPage() {
  const [settings, shipping] = await Promise.all([
    getSiteSettings(),
    Promise.resolve(getShippingConfig()),
  ]);

  return (
    <PolicyPage
      title="Terms"
      eyebrow="Legal"
      intro="The ground rules for using this catalogue and shopping-assistance storefront — including what is demonstration data and how a WhatsApp enquiry differs from a completed purchase."
      currentHref="/policies/terms"
      settings={settings}
      notice={
        <>
          <strong className="font-semibold">
            This is a catalogue, not an online checkout.
          </strong>{" "}
          OMNEXA does not process payments or confirm orders on this website.
          Products, prices, stock and photography are demonstration data. A
          WhatsApp message is an enquiry until the seller confirms availability,
          the final total and payment arrangements. A live operator must replace
          these terms with reviewed legal copy.
        </>
      }
      sections={[
        {
          heading: "Using this store",
          body: (
            <>
              <p>
                These terms apply to everyone who browses OMNEXA, creates an
                account or sends a product enquiry. By using the site you accept
                them. If you do not agree, please do not use the store.
              </p>
              <p>
                You must be at least 18 years old and able to enter into a
                binding contract to create an account or purchase from the
                seller. The storefront is operated as a technical demonstration
                and may be changed, reset, suspended or taken offline without
                notice.
              </p>
            </>
          ),
        },
        {
          heading: "The catalogue and demonstration data",
          body: (
            <>
              <p>
                Everything in the seeded catalogue — product names,
                descriptions, prices, original prices, stock counts, categories
                and images — is demonstration data. Demo products are labelled
                throughout the store and may not correspond to a real item that
                can be bought. Photography is licensed stand-in imagery, credited
                on the <Link href="/credits">credits page</Link>.
              </p>
              <p>
                Colours and finishes can look different between screens. The
                store does not publish invented ratings, reviews, testimonials or
                sales counters. Product details should be treated as
                illustrative until the operator replaces them with verified
                information.
              </p>
              <p>
                Availability, variants and stock can change. The seller will
                confirm current availability in your WhatsApp conversation; the
                website does not reserve stock or guarantee that an item is
                available.
              </p>
            </>
          ),
        },
        {
          heading: "WhatsApp enquiries, not online orders",
          body: (
            <>
              <p>
                From a product page or your bag, OMNEXA prepares a WhatsApp
                message containing the products, variants, quantities, unit
                prices, estimated total and the delivery details you enter. You
                review and send that message yourself. The website does not send
                the message, create an order, take payment or reserve stock.
              </p>
              <p>
                The message is an enquiry. No contract of sale is formed and no
                order is accepted until the seller confirms availability, the
                final price and delivery arrangements with you directly in the
                chat. The seller may decline an enquiry where an item is
                unavailable, where a listing or price error is apparent, or where
                the request appears abusive.
              </p>
              <p>
                Only send delivery details that you are authorised to share.
                Please do not include card numbers, UPI PINs, banking
                credentials or other payment secrets in a WhatsApp message.
                OMNEXA does not ask for them on this website.
              </p>
            </>
          ),
        },
        {
          heading: "Accounts and security",
          body: (
            <>
              <ul>
                <li>
                  Provide accurate account details and keep your email address
                  current.
                </li>
                <li>
                  Choose a strong, unique password. You are responsible for
                  activity carried out while signed in to your account.
                </li>
                <li>
                  Do not share your session or attempt to access another
                  person&apos;s account, saved data or admin tools.
                </li>
                <li>
                  Tell the store promptly if you believe your account has been
                  compromised, using the contact address below.
                </li>
              </ul>
              <p>
                Guest carts, wishlists, search history and recently viewed
                products are stored in your browser and merged into your account
                when you sign in. The store may suspend or remove an account that
                breaches these terms, abuses the environment or interferes with
                its operation. Admin access is restricted by server-side role
                checks; attempting to bypass them is prohibited.
              </p>
            </>
          ),
        },
        {
          heading: "Prices and delivery estimates",
          body: (
            <>
              <p>
                Prices are shown in Indian rupees. The catalogue does not
                configure a tax regime, so the displayed price is the
                product&apos;s listed amount; the operator must define the tax
                treatment before any live sale.
              </p>
              <p>
                For guidance, a flat {formatPrice(shipping.rate)} delivery
                estimate applies below a {formatPrice(shipping.threshold)}{" "}
                product subtotal, and the estimate shows complimentary delivery
                at or above that threshold. These are estimates only. The seller
                confirms the final delivery charge, total and payment method in
                the WhatsApp conversation. See the{" "}
                <Link href="/policies/shipping">shipping policy</Link> for
                details.
              </p>
            </>
          ),
        },
        {
          heading: "Delivery",
          body: (
            <p>
              This demonstration does not dispatch parcels and has no courier
              integration or delivery service levels. Delivery is arranged
              directly between you and the seller after the WhatsApp conversation
              confirms availability and payment. Dispatch times, serviceable PIN
              codes and tracking partners must be supplied by the operator. See{" "}
              <Link href="/policies/shipping">shipping</Link>.
            </p>
          ),
        },
        {
          heading: "Returns, cancellations and refunds",
          body: (
            <p>
              No live returns operation is running and a final return window has
              not been set. Because purchases are arranged directly with the
              seller, cancellation, damaged-item and refund discussions happen in
              the same WhatsApp conversation. The current position is set out on
              the <Link href="/policies/returns">return policy</Link>. Those
              sections are transparency placeholders and will be replaced before
              the store accepts real purchases.
            </p>
          ),
        },
        {
          heading: "Marketplace links",
          body: (
            <>
              <p>
                Individual products may link to Amazon or Flipkart when the
                seller has added a listing URL, and the store may link to its
                marketplace storefronts. Those links open third-party websites.
                OMNEXA does not control their content, availability, pricing,
                fulfilment or privacy practices. Any purchase made on a
                marketplace is governed by that marketplace&apos;s terms.
              </p>
              <p>
                Marketplace links are shipped empty by default. No seller
                profile or storefront URL has been invented for this build, so
                marketplace sections only appear when a real URL has been
                configured.
              </p>
            </>
          ),
        },
        {
          heading: "Intellectual property",
          body: (
            <>
              <p>
                The OMNEXA name, brand mark, page layouts and the storefront code
                are part of this project. You may browse and use the store as a
                customer, but you may not copy the site, resell its code or
                present the brand as your own without permission.
              </p>
              <p>
                Stand-in photographs remain the property of their photographers
                and are used under the licences recorded on the{" "}
                <Link href="/credits">credits page</Link>. Product names and
                descriptions are demo copy written for this project.
              </p>
            </>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <>
              <p>You agree not to:</p>
              <ul>
                <li>use the store for unlawful, fraudulent or abusive activity;</li>
                <li>
                  scrape, overload, probe or attempt to bypass the site&apos;s
                  security, authentication, rate limits or admin controls;
                </li>
                <li>
                  upload malware, harmful code or content you do not have the
                  right to use;
                </li>
                <li>
                  impersonate another person, misrepresent an enquiry or submit
                  another person&apos;s details without permission;
                </li>
                <li>
                  use contact or newsletter forms to send spam or unrelated
                  promotional material.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Beauty products, safety and care",
          body: (
            <>
              <p>
                Product information is illustrative demo copy and is not medical
                advice. Before using any cosmetic or skincare product, read its
                packaging and patch-test where appropriate. Stop using a product
                if irritation occurs and seek qualified advice when needed. Do
                not rely on the demo catalogue for ingredient, allergy or
                suitability decisions.
              </p>
              <p>
                Artificial jewellery should be kept away from water, perfume and
                harsh chemicals, and removed before sleep or vigorous activity.
                Any live product claims must be verified by the operator; no
                hypoallergenic, dermatologist-tested or medical claims are
                asserted here.
              </p>
            </>
          ),
        },
        {
          heading: "Availability and liability",
          body: (
            <>
              <p>
                The demonstration is provided as-is and without warranties of
                uninterrupted availability, accuracy or fitness for a particular
                purpose. Demo data may be reset, and features may change without
                notice.
              </p>
              <p>
                To the extent permitted by the law that ultimately applies, the
                operator would not be liable for indirect or consequential loss
                arising from use of this preview. Because no operator
                jurisdiction has been supplied, this section is not a final
                limitation clause and must be reviewed before live sales.
              </p>
            </>
          ),
        },
        {
          heading: "Governing law",
          body: (
            <p>
              No governing law or exclusive jurisdiction has been specified for
              this demonstration. The live operator must insert the correct
              jurisdiction and have these terms reviewed locally. Until then,
              they describe how the preview works rather than a binding
              cross-border contract.
            </p>
          ),
        },
        {
          heading: "Changes and contact",
          body: (
            <>
              <p>
                These terms may be updated as the store evolves. The current
                version will always be published on this page.
              </p>
              <p>
                Questions about these terms can be sent to{" "}
                <a href={`mailto:${settings.contactEmail}`}>
                  {settings.contactEmail}
                </a>{" "}
                or through the <Link href="/contact">contact page</Link>.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
