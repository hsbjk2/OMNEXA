import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/site/policy-page";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How the OMNEXA demonstration store handles account, enquiry and browsing information, and the choices available to you.",
  openGraph: {
    title: "Privacy policy — OMNEXA",
    description:
      "Account, enquiry and browsing data in the OMNEXA demonstration storefront, explained plainly.",
  },
};

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();

  return (
    <PolicyPage
      title="Privacy"
      eyebrow="Legal"
      intro="What this working storefront actually collects, where it lives and how you can control it — written in plain language."
      currentHref="/policies/privacy"
      settings={settings}
      notice={
        <>
          <strong className="font-semibold">Demonstration storefront.</strong>{" "}
          This page describes the data the application genuinely handles today.
          No advertising trackers, third-party analytics or marketing pixels
          are installed. A live launch would require the operator to review this
          notice against its legal entity, jurisdiction and any applicable
          privacy law.
        </>
      }
      sections={[
        {
          heading: "Who is responsible",
          body: (
            <>
              <p>
                OMNEXA is presented here as a demonstration storefront: a fully
                working commerce application populated with demo products,
                prices and photography. A formal legal entity, registered
                address and data-protection contact have not been supplied for
                this build.
              </p>
              <p>
                Privacy questions can be sent to{" "}
                <a href={`mailto:${settings.contactEmail}`}>
                  {settings.contactEmail}
                </a>{" "}
                or through the{" "}
                <Link href="/contact">contact page</Link>. Because the catalogue
                is demo data, please do not submit sensitive personal
                information through any demo form.
              </p>
            </>
          ),
        },
        {
          heading: "Information the store holds",
          body: (
            <>
              <p>
                The application only stores what is needed to operate the
                features you use:
              </p>
              <ul>
                <li>
                  <strong>Account details</strong> — your name, email address, a
                  bcrypt hash of your password (never the password itself),
                  whether your email has been verified, and your role.
                </li>
                <li>
                  <strong>Session data</strong> — a random session token is kept
                  in an httpOnly cookie. A hashed copy is stored in the
                  database so the session can be checked and revoked on
                  sign-out.
                </li>
                <li>
                  <strong>Shopping data</strong> — for signed-in customers, your
                  bag, wishlist, recently viewed products, search history and
                  saved addresses. Guests keep the same state in their own
                  browser&apos;s local storage.
                </li>
                <li>
                  <strong>Enquiry preparation</strong> — the name, mobile number
                  and delivery details you enter are used to prepare a WhatsApp
                  message. They are not saved as an order. If you are signed in
                  and choose to save the address, it is stored in your account
                  address book.
                </li>
                <li>
                  <strong>Messages</strong> — anything you send through the
                  contact, wholesale, waitlist or newsletter forms, together
                  with the email or phone number you provide.
                </li>
              </ul>
            </>
          ),
        },
        {
          heading: "Cookies and browser storage",
          body: (
            <>
              <p>
                Only essential storage is used. There are no advertising,
                cross-site tracking or social-media cookies.
              </p>
              <ul>
                <li>
                  <code>omnexa_session</code> — an essential httpOnly,
                  SameSite=Lax cookie that keeps you signed in. It is intended
                  to last up to 30 days unless you sign out or the session is
                  revoked.
                </li>
                <li>
                  <code>omnexa_oauth_state</code> — a short-lived cookie used
                  only while completing Google sign-in, when that optional
                  integration has been configured.
                </li>
                <li>
                  <code>omnexa.guest.v1</code> — local storage for a guest bag,
                  wishlist, recently viewed products and searches. It stays in
                  your browser and is never sent to the server as a tracking
                  profile.
                </li>
              </ul>
              <p>
                Signing in moves guest shopping state into your account. You can
                clear guest state at any time through the clear options on the
                wishlist and account screens, or by clearing site data in your
                browser. Blocking the session cookie will prevent sign-in and the
                saved account area from working.
              </p>
            </>
          ),
        },
        {
          heading: "How the information is used",
          body: (
            <>
              <p>The store uses this information to:</p>
              <ul>
                <li>create and secure your account and verified sessions;</li>
                <li>
                  keep your bag, wishlist, history and addresses available
                  across visits;
                </li>
                <li>
                  validate catalogue prices and stock while preparing your
                  WhatsApp enquiry, and save a delivery address you choose to
                  keep;
                </li>
                <li>
                  respond to enquiries and, where you asked, manage a waitlist or
                  newsletter request;
                </li>
                <li>
                  keep the service secure and diagnose abuse or errors.
                </li>
              </ul>
              <p>
                The application does not sell products using hidden profiling,
                does not run advertising campaigns and does not use your data to
                train models. Waitlist and newsletter entries are only used for
                the purpose you requested.
              </p>
            </>
          ),
        },
        {
          heading: "Payments",
          body: (
            <p>
              OMNEXA does not process payments on this website. The cart and
              enquiry form prepare a WhatsApp message for you to review and
              send; no card, UPI, bank, wallet or other payment credentials are
              collected or stored here. Any payment is arranged directly with
              the seller in WhatsApp and is governed by WhatsApp&apos;s own terms.
              This website does not receive, verify or record a payment.
            </p>
          ),
        },
        {
          heading: "Sharing and processors",
          body: (
            <>
              <p>
                Personal information is not sold or rented. It may be handled by
                service providers strictly to run the store:
              </p>
              <ul>
                <li>
                  the hosting, database and file-storage environment where the
                  application, its database and uploaded files are hosted;
                </li>
                <li>
                  a transactional email provider, if configured, for
                  verification and reset messages — message content is logged
                  locally when no provider is configured;
                </li>
                <li>
                  Google Sign-In, if enabled, which returns your name, email and
                  profile identifier;
                </li>
                <li>
                  Google Maps, only where a map embed URL has been supplied in
                  store settings, in which case the browser contacts Google
                  directly.
                </li>
              </ul>
              <p>
                Information may also be disclosed where required by law or to
                protect the store, its customers or the public. Photographs are
                licensed stand-ins from Pexels; images are served from this site
                and are credited on the{" "}
                <Link href="/credits">photography credits page</Link>.
              </p>
            </>
          ),
        },
        {
          heading: "Retention",
          body: (
            <>
              <p>
                Account and shopping data are kept while your account exists.
                Your bag, wishlist, saved addresses, recently viewed products
                and search history remain until you remove them or your account
                is deleted. Contact, wholesale, waitlist and newsletter messages
                are kept until they are handled or the audience records are
                removed. Sessions expire at sign-out or after their configured
                lifetime.
              </p>
              <p>
                Delivery details entered in the WhatsApp enquiry form are used
                only to prepare the message you choose to send. They are not
                stored as an order; if you are signed in and choose to save the
                address, it is added to your account address book. This is a
                demo environment: reseeding the database clears its demo
                accounts and messages. Do not treat it as permanent storage.
              </p>
            </>
          ),
        },
        {
          heading: "Your choices",
          body: (
            <>
              <ul>
                <li>
                  Update your name, phone number and password from{" "}
                  <Link href="/account/profile">your profile</Link>.
                </li>
                <li>
                  Add, edit or remove saved addresses from{" "}
                  <Link href="/account/addresses">your address book</Link>.
                </li>
                <li>
                  Clear search history from your account overview and clear
                  guest data in the wishlist or your browser settings.
                </li>
                <li>
                  Ask for a copy of your account data, correction of inaccurate
                  details or deletion of your account by writing to{" "}
                  <a href={`mailto:${settings.contactEmail}`}>
                    {settings.contactEmail}
                  </a>
                  . Deletion is handled manually in this demonstration; saved
                  addresses, bag, wishlist and browsing history attached to the
                  account are removed. Messages you sent separately through
                  WhatsApp remain in that chat and are outside this website.
                </li>
                <li>
                  Ask to be removed from a waitlist or newsletter list by
                  replying to any message or using the same contact address.
                </li>
              </ul>
              <p>
                If a privacy law such as the DPDP Act or GDPR applies to the
                eventual operator, additional rights and response timelines may
                apply. Those points have not been asserted for this demo and
                should be added by the operator before launch.
              </p>
            </>
          ),
        },
        {
          heading: "Security",
          body: (
            <p>
              Passwords are hashed with bcrypt, session tokens are random and
              stored hashed, cookies are httpOnly and SameSite, and account and
              admin actions are checked on the server. No method of storage or transmission is completely
              secure, so please use a unique password and avoid sending
              sensitive information through the demo. Report a suspected issue
              to the contact address above.
            </p>
          ),
        },
        {
          heading: "Children",
          body: (
            <p>
              The store is intended for adults. It is not directed at children,
              and accounts should not be created by anyone under 18. If you
              believe a child has provided personal information, contact the
              store so it can be removed.
            </p>
          ),
        },
        {
          heading: "Changes to this notice",
          body: (
            <p>
              This page is dated 21 November 2026 and will be revised if the
              store&apos;s data practices change or the demonstration becomes a
              live shop. Material changes will be reflected here; continued use
              after an update means the revised notice applies.
            </p>
          ),
        },
      ]}
    />
  );
}
