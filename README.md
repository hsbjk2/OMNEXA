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

- Email/password register, sign in and sign out.
- Forgot-password and reset flows with hashed, expiring tokens.
- Email verification (the link is logged locally when no email provider is configured).
- Optional Google sign-in when credentials are present; hidden otherwise.
- Session tokens are random, hashed at rest, stored in httpOnly, SameSite cookies and revoked at sign-out.
- Rate limiting on sensitive actions.
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
- D1 bootstrap that creates the schema and copies the public catalogue on first boot, with additive column migrations for existing databases.

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
| `RESEND_API_KEY` | Optional Resend key for verification/reset email. |
| `EMAIL_FROM` | From address for transactional email. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth credentials. |
| `AMAZON_STORE_URL` / `FLIPKART_STORE_URL` | Optional marketplace defaults; admin settings override them. |

The seeded admin account is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Those credentials live only in `.env`/the database — never in frontend code. Change them before any real deployment.

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

The Prisma schema covers users, sessions, verification tokens, addresses, categories, products, cart items, wishlist items, search history, recently viewed products, newsletter subscribers, waitlist entries, contact messages and site settings. Legacy `Order` and `OrderItem` tables are no longer part of the application schema and are left untouched in existing databases by the runtime; no order is created by the website.

On Cloudflare, `lib/d1.ts` creates the schema once per database and seeds the public catalogue from `lib/d1-sql.generated.ts`. Additive column migrations keep older D1 databases working without dropping user data. A one-time, idempotent DateTime migration converts legacy integer/SQLite-style DateTime values to the ISO-8601 text the D1 adapter expects; it never touches non-date columns. `npm run db:generate:d1` regenerates the seed SQL with ISO DateTime values from `prisma/dev.db`. Uploaded images use the `FILES` R2 binding in production and `public/uploads` locally.

## Structure

```text
app/
  (store)/            storefront, cart, order-request, account and policy pages
  (auth)/             login, register, verification and password flows
  admin/              role-protected admin panel
  actions/            server actions for auth, shop, account, enquiries and admin
  api/                search suggestions, admin upload, uploaded-image serving, Google OAuth
components/           site, product, shop, cart, order, account, admin and UI
lib/                  auth, catalog, products, settings, shipping, WhatsApp helpers
prisma/               schema, seed and local SQLite database
scripts/              D1 SQL generator
```

## Verification checklist

- Run `npm run typecheck` and `npm run build`.
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
- Email delivery and Google sign-in remain inactive until credentials are configured.
- Analytics and marketing pixels are intentionally absent. Add them only with consent and a corresponding privacy update.

## Photography

Source files and photographer/source metadata are recorded in `public/images/credits.json` and rendered at `/credits`.

---

© OMNEXA. Demonstration storefront. Product names, copy and seeded data are illustrative.
