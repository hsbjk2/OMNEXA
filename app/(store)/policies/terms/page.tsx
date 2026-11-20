import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/site/policy-page";
import { getSiteSettings } from "@/lib/settings";
import { getShippingConfig } from "@/lib/shipping";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms & conditions",
  description:
    "The terms that apply to browsing, accounts and demo orders on the OMNEXA demonstration storefront.",
  openGraph: {
    title: "Terms & conditions — OMNEXA",
    description:
      "How the OMNEXA demonstration storefront works, what demo data means and the limits of the preview.",
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
      intro="The ground rules for using this working preview — including what is demonstration data and what is a real transaction."
      currentHref="/policies/terms"
      settings={settings}
      notice={
        <>
          <strong className="font-semibold">This is a preview, not a live shop.</strong>{" "}
          Products, prices, stock and photography are demonstration data. Orders
          can be placed and managed end to end, but no money is collected, no
          courier is dispatched and no contract of sale is formed. A live
          operator must replace these terms with reviewed legal copy.
        </>
      }
      sections={[
        {
          heading: "Using this store",
          body: (
            <>
              <p>
                These terms apply to everyone who browses OMNEXA, creates an
                account or places a demo order. By using the site you accept
                them. If you do not agree, please do not use the store.
              </p>
              <p>
                You must be at least 18 years old and able to enter into a
                binding contract to create an account or order. The store is
                operated as a technical demonstration and may be changed,
                reset, suspended or taken offline without notice.
              </p>
            </>
          ),
        },
        {
          heading: "Demo catalogue and product information",
          body: (
            <>
              <p>
                Everything in the seeded catalogue — product names, descriptions,
                prices, original prices, stock counts, categories and images —
                is demonstration data. Demo products are labelled throughout
                the store and may not correspond to a real item that can be
                bought. Photography is licensed stand-in imagery, credited on
                the <Link href="/credits">credits page</Link>.
              </p>
              <p>
                Colours and finishes can look different between screens. The
                store does not publish invented ratings, reviews, testimonials or
                sales counters, and any product detail should be treated as
                illustrative until the operator replaces it with verified
                information.
              </p>
              <p>
                Availability is checked again on the server when an order is
                placed. If an item becomes unavailable, the order is refused
                rather than oversold. The admin panel can also move products
                between available, out of stock and coming soon.
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
                  person&apos;s account, orders or admin tools.
                </li>
                <li>
                  Tell the store promptly if you believe your account has been
                  compromised, using the contact address below.
                </li>
              </ul>
              <p>
                The store may suspend or remove an account that breaches these
                terms, abuses the demo environment or interferes with its
                operation. Admin access is restricted by server-side role
                checks; attempting to bypass them is prohibited.
              </p>
            </>
          ),
        },
        {
          heading: "Orders and acceptance",
          body: (
            <>
              <p>
                Submitting the checkout form is an offer to place a demo order.
                The server validates the catalogue, live stock and prices, then
                records the order and decrements stock in one transaction. An
                order confirmation is displayed immediately with a private
                access link; it is not a promise that goods will be dispatched.
              </p>
              <p>
                The store may refuse or cancel an order where an item is
                unavailable, where a price or listing error is apparent, where
                the order appears abusive, or where the demonstration data has
                been reset. Cash on delivery is the only payment method. No
                online payment gateway is connected and no card details are
                requested.
              </p>
            </>
          ),
        },
        {
          heading: "Prices and charges",
          body: (
            <>
              <p>
                Prices are shown in Indian rupees. The demo catalogue does not
                configure a tax regime, so the displayed price is the
                product&apos;s listed amount and the tax treatment must be
                defined by the operator before any live sale.
              </p>
              <p>
                Shipping is calculated on the server: a flat{" "}
                {formatPrice(shipping.rate)} charge applies below a{" "}
                {formatPrice(shipping.threshold)} product subtotal, and shipping
                is free at or above that threshold. The order total recorded at
                checkout is the amount shown on the confirmation page. See the{" "}
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
              This demonstration does not dispatch orders and has no courier
              integration or delivery service levels. The checkout records an
              address and an order status; an admin can move the status through
              pending, confirmed, packed, shipped and delivered for
              demonstration purposes. Dispatch times, serviceable PIN codes and
              tracking partners still need to be supplied by the operator. See{" "}
              <Link href="/policies/shipping">shipping</Link>.
            </p>
          ),
        },
        {
          heading: "Returns and cancellations",
          body: (
            <p>
              No live returns operation is running and a final return window has
              not been set. Cancellation and damaged-item guidance is set out on
              the <Link href="/policies/returns">return policy</Link>. Those
              sections are transparency placeholders and will be replaced
              before the store accepts real orders.
            </p>
          ),
        },
        {
          heading: "Intellectual property",
          body: (
            <>
              <p>
                The OMNEXA name, brand mark, page layouts and the storefront
                code are part of this project. You may browse and use the store
                as a customer, but you may not copy the site, resell its code or
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
          heading: "Third-party links and marketplaces",
          body: (
            <>
              <p>
                The store can link to Instagram, Facebook, Amazon, Flipkart or a
                map when those URLs are configured in settings. It is not
                affiliated with those services unless a live operator states
                otherwise, and it does not control their content, availability,
                pricing or privacy practices.
              </p>
              <p>
                Marketplace links are shipped empty by default. No seller
                profile or storefront URL has been invented for this build, so
                marketplace sections honestly report that a link has not been
                configured.
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
                  impersonate another person, misrepresent an order or submit
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
                To the extent permitted by the law that ultimately applies,
                the operator would not be liable for indirect or consequential
                loss arising from use of this preview. Because no operator
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
                These terms are dated 18 November 2026 and may be updated as the
                store evolves. The current version will always be published on
                this page.
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
