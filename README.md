# OMNEXA

A premium beauty, skincare, makeup, artificial-jewellery and accessories catalogue with a WhatsApp-based ordering flow for retail and wholesale customers.

OMNEXA is a product discovery and shopping-assistance storefront, not an online payment shop. Customers browse the catalogue, build a persistent bag and wishlist, enter delivery details, and continue the conversation with the seller on WhatsApp. The website does not collect payment details, create online orders, reserve stock or claim that an order is confirmed.

## Stack

- Next.js 16.4 (App Router, Server Actions, route groups)
- React 19 + TypeScript
- Tailwind CSS v4
- Prisma 6 with SQLite locally and Cloudflare D1 in production
- Cloudflare R2 for uploaded catalogue images
- bcryptjs, opaque database-backed sessions, httpOnly cookies
- Framer Motion, lucide-react, Zod, sharp

## Ordering model

1. Browse the catalogue or search for a product.
2. Choose a variant and quantity, then add the piece to the bag.
3. Review the bag or open the delivery form at `/order-request`.
4. Enter a name, mobile number, complete address, city, state, PIN code and optional delivery instructions.
5. The server validates the product IDs, availability, selected variants and live prices against the catalogue.
6. A prefilled `https://wa.me/<number>?text=...` message is generated with the products, quantities, variants, unit prices, estimated total, product URLs, image URLs and delivery details.
7. The customer reviews and sends the message in WhatsApp. The seller confirms availability, delivery charges and payment arrangements in the chat.

Individual product pages also have their own "Order on WhatsApp" action with a product-specific message. If the seller has configured Amazon or Flipkart listing URLs, the product page shows marketplace buttons that open in a new tab.

The estimated delivery figure comes from `SHIPPING_FLAT_RATE` and `FREE_SHIPPING_THRESHOLD`. It is an estimate only; the seller confirms the final charge on WhatsApp.

## Features

### Storefront

- Homepage with announcement, responsive navigation, category dropdown, live search, bag and wishlist counts, editorial sections, best sellers, new arrivals, coming-soon waitlists, store location, marketplace area, newsletter and footer.
- Catalogue at `/shop`, plus category, new-arrival, coming-soon and search routes.
- Filtering by category, price band and availability; sorting; pagination; shareable query strings; empty and no-result states.
- Product galleries, zoom, variants, stock state, quantity controls, related products, recently viewed and structured product data.
- Persistent bag and wishlist: guests use local storage; signed-in customers sync to the database. Guest bag, wishlist, search history and recently viewed products merge into the account at sign-in.
- Search history and recently viewed products, with clear options.
- Cart drawer and dedicated cart page with estimated totals.
- WhatsApp product and cart enquiry flows with server-validated catalogue data and encoded messages.
- Amazon and Flipkart product buttons, shown only when a complete URL has been saved.

### Authentication and account

- Email/password registration with a six-digit email OTP. The permanent customer account is created only after the code is verified; before that, only a pending registration with a hashed password and HMAC-hashed code exists.
- Email/password sign in and sign out. Unverified accounts cannot sign in with a password.
- Forgot-password and reset flows with hashed, expiring tokens. Reset tokens use a separate purpose from registration codes.
- Legacy verification links remain available for accounts created before the OTP flow.
- Optional Google and Facebook sign-in. The login page shows both buttons; each provider needs its OAuth credentials configured before it can complete a sign-in. The register page shows a provider only when it is configured.
- Session tokens are random, hashed at rest, stored in httpOnly, SameSite cookies and revoked at sign-out.
- Rate limiting on sensitive actions, with persistent D1-backed buckets for registration and OTP resend/verification so limits hold across Worker isolates.
- Account overview with saved bag, wishlist, recently viewed products, search history, saved addresses, profile details, password change and email-verification state.
- Marketplace storefront links and a direct WhatsApp contact card in the account area.
- No payment history or online order history is shown because OMNEXA does not process payments or create orders on the website.

### Admin

- Protected admin shell with mobile navigation and role-based access.
- Dashboard with catalogue, stock, customer, saved bag, wishlist, address, message, newsletter and waitlist counts. No revenue or order-processing metrics.
- Product CRUD, publish/feature/best-seller/new-arrival flags, availability, stock, variants, demo marking, multiple images and per-product Amazon/Flipkart URLs.
- Drag-and-drop image upload validated in the API and stored in R2 on Workers; local development keeps the `public/uploads` fallback.
- Category CRUD with image upload.
- Store settings for the WhatsApp business number, contact details, address, map, social profiles and marketplace storefront URLs.
- Customer list, audience messages, waitlist and newsletter views.
- No payment management or online order processing.

### Platform

- SEO metadata, canonical URLs, Open Graph/Twitter cards, JSON-LD organisation and product data.
- Dynamic sitemap, robots rules, web manifest, favicons and OG image.
- 404 and error boundaries, catalogue/product/account/admin loading skeletons.
- Security headers and CSP in production middleware.
- Responsive layouts from small Android/iPhone widths through tablet, laptop and desktop.
- Reduced-motion support, scroll progress, reveals, a scroll-driven 3D cabinet scene, a floating WhatsApp button, back-to-top and accessible focus styles.
- D1 bootstrap that creates the schema and copies the public catalogue on first boot, with additive table/column migrations for existing databases.

## Getting started

Requirements: Node.js 22+, npm.

```bash
npm install
cp .env.example .env
# edit .env with your values
npm run db:setup
npm run dev
```

Open <http://localhost:3000>.

### Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma SQLite URL. Defaults locally to `file:./dev.db`. |
| `OMNEXA_DATABASE` | Adapter selection: `auto` (default) uses Cloudflare D1 when the `DB` binding exists, otherwise local SQLite. Set `d1` or `sqlite` to force one. |
| `APP_URL` | Public origin used by metadata, sitemap, absolute product/image links and auth email. |
| `ADMIN_EMAIL` | Bootstrap admin email used only by `prisma/seed.ts`. |
| `ADMIN_PASSWORD` | Bootstrap admin password used only by the seed. Use a long unique value. |
| `ADMIN_NAME` | Bootstrap admin display name. |
| `SHIPPING_FLAT_RATE` | Flat delivery estimate in INR below the free threshold. |
| `FREE_SHIPPING_THRESHOLD` | Product subtotal at which the delivery estimate becomes complimentary. |
| `STORE_CONTACT_EMAIL` | Default public contact email if not set in admin settings. |
| `RESEND_API_KEY` | Optional Resend key for registration OTP and password reset email. |
| `EMAIL_FROM` | From address for transactional email. |
| `OTP_HMAC_SECRET` | Required for new registrations. Separate secret used to HMAC six-digit OTPs. Generate with `openssl rand -base64 48`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth credentials. |
| `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` | Optional Facebook OAuth credentials from the Meta app. |
| `AMAZON_STORE_URL` / `FLIPKART_STORE_URL` | Optional marketplace defaults; admin settings override them. |

The seeded admin account is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Those credentials live only in `.env`/the database — never in frontend code. Change them before any real deployment.

### Google and Facebook sign-in

`APP_URL` must be the public origin of the deployment. Register these exact callback URLs with each provider:

- Google: `https://your-domain.example/api/auth/google/callback`
- Facebook: `https://your-domain.example/api/auth/facebook/callback`

For Google, create an OAuth 2.0 Web client and set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. For Facebook, add the Facebook Login product to a Meta app, copy its App ID and App Secret into `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET`, and add the callback URL above under **Facebook Login → Settings → Valid OAuth Redirect URIs**. The app and domain must use HTTPS for anything other than local development.

On Cloudflare Workers, store these values as secrets rather than plain vars:

```bash
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put FACEBOOK_APP_SECRET
```

Never commit OAuth secrets, and never expose them through `NEXT_PUBLIC_` variables.

### Registration OTP

New email/password registrations use a six-digit code:

1. `/register` validates the details and writes a `PendingRegistration` row. No permanent `User` is created.
2. Resend sends **Your OMNEXA verification code** with a code that expires after 10 minutes.
3. `/register/verify` verifies the keyed OTP hash, creates the verified `CUSTOMER`, removes the pending row and signs the customer in.
4. Each code allows five failed attempts, resends have a 60-second cooldown, and persistent per-email/per-IP limits apply across Worker isolates.

`OTP_HMAC_SECRET` is required and must be a separate secret from the session and OAuth secrets. Generate it once and keep it stable; changing it invalidates outstanding codes:

```bash
openssl rand -base64 48
```

Add the value to `.env` for local development. On Cloudflare, store it as a Worker secret:

```bash
npx wrangler secret put OTP_HMAC_SECRET
```

Without `RESEND_API_KEY` and `EMAIL_FROM`, development logs the code and shows it on the verification page. Production responses never include the OTP.

The seller's WhatsApp number is stored in **Admin → Settings** and is never hardcoded into storefront components. Catalogue links only publish when a complete URL is saved.

### Scripts

```bash
npm run dev        # development server
npm run build      # prisma generate + production build
npm start          # production server
npm run typecheck  # TypeScript only
npm run db:push    # sync schema to local SQLite
npm run db:seed    # seed demo catalogue, categories and admin user
npm run db:setup   # generate + push + seed
npm run db:generate:d1 # regenerate the D1 seed SQL from local SQLite
```

`db:push` reconciles the local SQLite database with the Prisma schema. Back up `prisma/dev.db` before running it against a database whose legacy order tables must be retained. No destructive migration is run by the app at runtime.

## Database and Workers

The Prisma schema covers users, sessions, pending registrations, rate-limit buckets, verification tokens, addresses, categories, products, cart items, wishlist items, search history, recently viewed products, newsletter subscribers, waitlist entries, contact messages and site settings. Legacy `Order` and `OrderItem` tables are no longer part of the application schema and are left untouched in existing databases by the runtime; no order is created by the website.

### Applying the OTP tables

`lib/d1.ts` creates `PendingRegistration` and `RateLimit` automatically on the next request to an existing D1 database. To apply the same idempotent SQL explicitly, use one of the following commands.

Local SQLite (`prisma/dev.db`):

```bash
npx prisma db execute \
  --file=prisma/migrations/20261124_add_pending_registration_and_rate_limit/migration.sql \
  --schema=prisma/schema.prisma
```

Local D1 used by Wrangler:

```bash
npx wrangler d1 execute omnexa --local \
  --file=prisma/migrations/20261124_add_pending_registration_and_rate_limit/migration.sql
```

Remote D1:

```bash
npx wrangler d1 execute omnexa --remote \
  --file=prisma/migrations/20261124_add_pending_registration_and_rate_limit/migration.sql
```

The Prisma D1 adapter ignores interactive transactions. OTP verification therefore uses a single conditional `DELETE` to claim the pending row, plus the unique email constraint when the permanent user is created. This prevents two simultaneous verifications from creating two accounts, but it is not an ACID transaction.

On Cloudflare, `lib/d1.ts` creates the schema once per database and seeds the public catalogue from `lib/d1-sql.generated.ts`. Additive column migrations keep older D1 databases working without dropping user data. A one-time, idempotent DateTime migration converts legacy integer/SQLite-style DateTime values to the ISO-8601 text the D1 adapter expects; it never touches non-date columns. `npm run db:generate:d1` regenerates the seed SQL with ISO DateTime values from `prisma/dev.db`. Uploaded images use the `FILES` R2 binding in production and `public/uploads` locally.

## Structure

```text
app/
  (store)/            storefront, cart, order-request, account and policy pages
  (auth)/             login, register, verification and password flows
  admin/              role-protected admin panel
  actions/            server actions for auth, shop, account, enquiries and admin
  api/                search suggestions, admin upload, uploaded-image serving, Google/Facebook OAuth
components/           site, product, shop, cart, order, account, admin and UI
lib/                  auth, catalog, products, settings, shipping, WhatsApp helpers
prisma/               schema, seed and local SQLite database
scripts/              D1 SQL generator
```

## Verification checklist

- Run `npm run typecheck` and `npm run build`.
- Register with a new email, confirm no `User` exists yet, verify the OTP, and confirm the account is created and signed in.
- Test a wrong code, an expired code, five failed attempts, resend cooldown, old-code invalidation after resend, duplicate email registration and unverified password sign-in.
- Register, verify, sign in and sign out; test forgot/reset password.
- Confirm guest bag/wishlist survive refresh and merge into an account at sign-in.
- Filter/sort/paginate `/shop`; test search suggestions and no-results.
- Open a product, switch variants, adjust quantity and add to bag.
- Use the product page "Order on WhatsApp" action and confirm the message contains the product, variant, quantity, price, product link and image URL where available.
- Add multiple products, open `/order-request`, enter delivery details, submit, and confirm the generated `wa.me` message contains every product, quantity, variant, unit price, estimated total, product URLs, image URLs and the delivery address.
- Confirm no order is created, no payment is collected and the page clearly says the seller will confirm availability, delivery charges and payment.
- Save an address from the account area and reuse it in the enquiry form.
- Confirm marketplace buttons appear only when their URLs are configured and open in a new tab.
- Sign in as an admin and verify customer access to `/admin` is denied.
- Create/edit/delete a product and category; upload an image; toggle demo/featured/coming-soon flags.
- Test the contact/waitlist/newsletter forms and admin audience views.
- Visit the site at 320, 375, 768, 1024 and 1440 px; check for horizontal scroll and overlapping controls.
- Check keyboard focus, dialogs, reduced-motion behaviour and the 404 route.
- Verify `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` and metadata.
- Inspect the browser console and production build for errors.

## Known limitations

- The catalogue, pricing and stock are demo content; do not treat them as a live offer.
- No payment gateway, checkout, online order creation, order status, payment status or order history is provided.
- A WhatsApp message is prepared by the website but sent by the customer. The website cannot know whether it was delivered, read or accepted.
- There is no enquiry-history record; the WhatsApp chat is the record of the conversation.
- Demo products are never dispatched and no courier tracking exists.
- Return window, refund process, legal entity, jurisdiction and final policy wording are pending operator input.
- Email delivery, Google sign-in and Facebook sign-in remain inactive until credentials are configured. New registrations also require `OTP_HMAC_SECRET`.
- Analytics and marketing pixels are intentionally absent. Add them only with consent and a corresponding privacy update.

## Photography

Source files and photographer/source metadata are recorded in `public/images/credits.json` and rendered at `/credits`.

---

© OMNEXA. Demonstration storefront. Product names, copy and seeded data are illustrative.
