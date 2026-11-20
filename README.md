# OMNEXA

A complete, working beauty storefront and admin platform for OMNEXA — skincare, makeup, makeup kits, artificial jewellery and accessories. The storefront, authentication, persisted shopping state, checkout, customer account and protected admin panel are real application code, not static mockups.

The catalogue is intentionally **demo data**: seeded products, prices, stock and stand-in photography are labelled as such throughout the UI.

## Stack

- Next.js 15.5 (App Router, Server Actions, route groups)
- React 19 + TypeScript
- Tailwind CSS v4
- Prisma 6 with SQLite
- bcryptjs, opaque database-backed sessions, httpOnly cookies
- Framer Motion, lucide-react, Zod, sharp

## Features

### Storefront

- Homepage with dismissible announcement, sticky responsive navigation, category dropdown, live search, cart and wishlist counters, editorial hero, six category cards, best sellers, new arrivals, coming soon with waitlist, business highlights, brand story, marketplace area, newsletter and full footer.
- Catalogue at `/shop` plus category, new-arrival, coming-soon and search routes.
- Filtering by category, price band and availability; sorting; pagination; shareable query strings; empty and no-result states.
- Live search suggestions from the published catalogue.
- Product detail gallery, zoom, variants, stock state, quantity controls, related products, recently viewed and structured product data.
- Persistent bag and wishlist: guests use local storage, signed-in customers sync to the database on sign-in and while signed in.
- Search history and recently viewed products, with clear options.
- Cart drawer, dedicated cart page and order summary.
- WhatsApp checkout with server-validated prices, stock and totals. Orders are recorded transactionally, stock is reserved, and the customer continues to WhatsApp with a prepared order message.
- Private order confirmation and tracking pages, authorised by owner session or an unguessable order token.

### Authentication and account

- Email/password sign-up and sign-in.
- Forgot-password and reset flows with hashed, expiring tokens.
- Email verification (verification link is logged locally when no email provider is configured).
- Optional Google sign-in when credentials are present; hidden otherwise.
- Session tokens are random, hashed at rest, stored in httpOnly, SameSite cookies and revocable at sign-out.
- Rate limiting on sensitive actions.
- Account overview, order list/detail, address book, profile details, password change, email verification state and search-history controls.
- Authoritative authorisation is checked server-side in layouts and actions, not only in middleware.

### Admin

- Separate protected admin shell with mobile navigation and role-based access.
- Dashboard with live counts for orders, revenue, stock, products and audience.
- Product CRUD, publish/feature/best-seller/new-arrival flags, availability, stock, variants, demo marking and multiple images.
- Drag-and-drop image upload resized to WebP via sharp, stored under `public/uploads`; optional remote image URLs limited to Pexels/Unsplash or local paths.
- Category CRUD with image upload.
- Order management with status and payment status updates; cancelling restores stock.
- Customer list, audience messages, waitlist/newsletter entries and store settings.
- Business location, map, social and marketplace URLs configurable; nothing is invented in the public UI.

### Platform

- SEO metadata, canonical URLs, Open Graph/Twitter cards, JSON-LD organisation and product data.
- Dynamic sitemap, robots rules, web manifest, favicons and OG image.
- 404 and error boundaries, catalogue/product/account/admin loading skeletons.
- Security headers and CSP in production middleware.
- Responsive from small Android/iPhone widths through tablet, laptop and desktop.
- Reduced-motion support, scroll progress, reveals, a scroll-driven 3D cabinet scene, a floating WhatsApp order button, back-to-top and accessible focus styles.

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
| `APP_URL` | Public origin used by metadata, sitemap and links in auth email. |
| `ADMIN_EMAIL` | Bootstrap admin email used only by `prisma/seed.ts`. |
| `ADMIN_PASSWORD` | Bootstrap admin password used only by the seed. Use a long unique value. |
| `ADMIN_NAME` | Bootstrap admin display name. |
| `SHIPPING_FLAT_RATE` | Flat shipping charge in INR below the free threshold. |
| `FREE_SHIPPING_THRESHOLD` | Product subtotal at which shipping becomes free. |
| `STORE_CONTACT_EMAIL` | Default public contact email if not set in admin settings. |
| `RESEND_API_KEY` | Optional Resend key for verification/reset email. |
| `EMAIL_FROM` | From address for transactional email. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth credentials. |
| `AMAZON_STORE_URL` / `FLIPKART_STORE_URL` | Optional marketplace defaults; admin settings override them. |

The seeded admin account is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Those credentials live only in `.env`/the database — never in frontend code. Change them before any real deployment.

### Scripts

```bash
npm run dev        # development server
npm run build      # prisma generate + production build
npm start          # production server
npm run typecheck  # TypeScript only
npm run db:push    # sync schema to SQLite
npm run db:seed    # seed demo catalogue, categories and admin user
npm run db:setup   # generate + push + seed
```

Reseeding is destructive to the demo dataset. It recreates the catalogue, admin account and supporting demo records.

## Structure

```
app/
  (store)/            public storefront, account and order pages
  (auth)/             login, register, verification and password flows
  admin/              role-protected admin panel
  actions/            server actions for auth, shop, checkout, account, admin
  api/                search suggestions, admin upload, Google OAuth
components/           site, product, shop, checkout, account, admin, UI
lib/                  auth, catalog, orders, settings, shipping, validators
prisma/               schema, seed, local SQLite database
public/images/        licensed stand-in photography + credits manifest
public/uploads/       admin-uploaded product/category images
```

## Store settings

Most operational content is managed in **Admin → Settings**:

- business name, verified store address, phone/WhatsApp and contact email;
- Google Maps embed, directions URL and optional Google Business listing URL;
- Instagram, Facebook and optional WhatsApp channel URLs;
- Amazon and Flipkart marketplace links.

If a location or marketplace link has not been configured, the public UI says so instead of displaying a fabricated address, coordinate or seller page. The contact and homepage maps only render when a valid embed URL has been supplied. Instagram, Facebook and the WhatsApp channel stay hidden until real URLs are entered; the order WhatsApp button uses the configured number.

Shipping values come from environment configuration (`SHIPPING_FLAT_RATE`, `FREE_SHIPPING_THRESHOLD`) and are passed to the client for display. The server recalculates them when the order is placed.

## Demo-data and content policy

- Seeded products carry `isDemo`, explicit badges and catalogue notices.
- Prices, stock, ratings-free copy and product details are illustrative. There are no invented reviews, testimonials, sales counters or countdowns.
- Photography is licensed Pexels stand-in imagery, credited at `/credits`.
- Marketplace links and the store address are configuration, not fabricated defaults.
- Policy pages describe the real implementation and clearly mark decisions that the operator has not supplied (return window, legal entity, jurisdiction, dispatch SLAs).

## Security notes

- Passwords are bcrypt-hashed; session and verification tokens are random and stored hashed.
- Cookies are httpOnly and SameSite; session lifetime is 30 days and revoked on sign-out.
- Admin routes check the database-backed role on the server. Middleware only performs preliminary cookie redirects.
- Order confirmation requires the owning signed-in user or the order's private access token.
- Uploads require admin authentication and are normalised through sharp.
- Production middleware adds security headers and a CSP. Review it after adding any third-party integration.
- Server actions validate inputs with Zod and re-check stock and prices transactionally.

## Production deployment checklist

1. Set a strong, unique `ADMIN_PASSWORD` and `APP_URL`; use HTTPS.
2. Do not reuse the development database or admin credentials.
3. Ensure **persistent writable storage** for the SQLite database and `public/uploads`, or replace them with managed database/object storage. Serverless filesystems are ephemeral.
4. Configure Resend (or another email provider) so verification and reset links are delivered instead of logged.
5. Add real store address/coordinates, map URLs, social and marketplace links in admin settings.
6. Replace demo catalogue content and stand-in photography; update `/credits`.
7. Have the privacy, terms, shipping and return pages reviewed for the operator's legal entity and jurisdiction; set a real return window and dispatch service levels.
8. Keep the WhatsApp order number current in admin settings; checkout uses it for the order handoff. No payment gateway is connected.
9. Add courier/tracking integration if live shipment tracking is required.
10. Back up the database and uploads; monitor sessions, uploads and rate limits.
11. Re-run `npm run typecheck`, `npm run build`, and the manual test checklist below.
12. Review the CSP and security headers against any new third-party scripts.

## Manual test checklist

- Register, verify, sign in, sign out; test forgot/reset password.
- Confirm guest bag/wishlist survive refresh and merge into an account at sign-in.
- Filter/sort/paginate `/shop`; test search suggestions and no-results.
- Open a product, switch variants, adjust quantity and add to bag.
- Complete checkout, confirm the order page opens with the prepared WhatsApp message, then verify the order in the account and admin.
- Mark the order paid in admin, move it through packing/shipping, and confirm cancellation restores stock.
- Sign in as an admin and verify customer access to `/admin` is denied.
- Create/edit/delete a product and category; upload an image; toggle demo/featured/coming-soon flags.
- Update order status; cancel and confirm stock is restored.
- Test the contact/waitlist/newsletter forms and admin audience views.
- Visit the site at 320, 375, 768, 1024 and 1440 px; check for horizontal scroll and overlapping controls.
- Check keyboard focus, dialogs, reduced-motion behaviour and the 404 route.
- Verify `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest` and metadata.
- Inspect the browser console and production build for errors.

## Known limitations

- The catalogue, pricing and stock are demo content; do not treat them as a live offer.
- Checkout saves the order and hands it to WhatsApp. Payment is arranged with the seller in chat; no payment gateway is connected.
- Demo orders are never dispatched and no courier tracking exists.
- Return window, refund process, legal entity, jurisdiction and final policy wording are pending operator input.
- Email delivery and Google sign-in remain inactive until credentials are configured.
- SQLite and local image uploads suit a single persistent host; a multi-instance deployment needs managed storage.
- Analytics and marketing pixels are intentionally absent. Add them only with consent and a corresponding privacy update.

## Photography

Source files and photographer/source metadata are recorded in `public/images/credits.json` and rendered at `/credits`.

---

© OMNEXA. Demonstration storefront. Product names, copy and seeded data are illustrative.
