# MoroKika Storefront

A premium, responsive React storefront for a Moroccan artisan cake brand.

## Included

- Editorial home page and locally hosted custom imagery
- Complete content architecture: Maison, Journal and articles, delivery, serving guide, allergens, contact, FAQ, legal pages, and branded 404
- Dedicated Signature, Birthday, and Gift collection landing pages
- Ten substantial local/service landing pages for Rabat, Salé, Témara, Kénitra, Casablanca, birthdays, custom cakes, weddings, sbâa celebrations, and professional events
- Twelve in-depth journal guides covering planning, sizing, flavors, personalized briefs, messages, weddings, sbâa, professional events, transport, conservation, ingredients, and tea pairings
- Unique inspiration, tasting, pairing, serving, transport, occasion, and allergen guidance for every product
- Page-specific practical enrichment for the shop, collections, core pages, legal pages, local services, and all journal articles, rendered in both hydrated and build-time HTML
- Contextual landing-page ↔ journal linking plus Service, FAQ, Article, and breadcrumb structured data
- Build-time static HTML, route-specific social metadata, canonicals, and JSON-LD across all 46 canonical public routes
- Filterable/sortable product collection
- Dynamic product detail routes and image galleries
- Guided custom-cake brief for occasions, flavors, styling, budgets, and contact details
- Size, quantity, and gift-message options with an interactive serving guide
- Persistent slide-out cart and wishlist (`localStorage`)
- Dedicated saved-favorites collection
- Three-step checkout with cash on receipt, configurable bank transfer, WhatsApp confirmation, and Supabase order storage
- Search, moderated customer reviews, recommendations, Supabase-backed newsletter subscriptions, and responsive navigation
- Complete product editor with main-image and gallery upload, WebP optimization, pricing, inventory, publication, allergens, ingredients, and editorial content
- Optimized WebP imagery with 320, 480, and 800 pixel responsive variants, explicit dimensions, lazy loading, and priority hero loading
- Installable web-app manifest with adaptive icons, app shortcuts, versioned offline cache, and connection-status messaging
- Route-aware canonical, Open Graph, Twitter, robots, Product, Article, image-sitemap, `llms.txt`, and proper 404 metadata
- Netlify and Vercel security headers covering CSP, framing, MIME sniffing, permissions, referrer policy, and service-worker updates
- Branded application error recovery that preserves locally stored selections
- Fully local fonts and image assets; no runtime CDN dependency
- Automated axe accessibility auditing with zero detected violations on tested routes
- WCAG-oriented landmarks, focus trapping, keyboard dismissal, contrast-safe colors, reduced-motion support, and mobile-first layouts
- Validated contact and checkout fields with clear inline recovery states
- Privacy, terms of sale, legal-information, and branded 404 routes

## Route inventory

- `/` — Home
- `/boutique` — Filterable catalogue
- `/collections/signatures`, `/collections/anniversaires`, `/collections/cadeaux`
- `/gateaux-rabat`, `/gateau-anniversaire-rabat`, `/gateau-sur-mesure-rabat`, `/gateau-mariage-rabat`
- `/gateau-sbaa-rabat`, `/gateaux-entreprise-rabat`
- `/livraison-gateau-sale`, `/livraison-gateau-temara`, `/livraison-gateau-kenitra`, `/livraison-gateau-casablanca`
- `/produit/:slug` — Eight seeded product detail pages plus seller-created catalogue entries
- `/favoris` — Persistent wishlist
- `/sur-mesure` — Custom-cake brief
- `/la-maison` — Brand story and atelier
- `/journal` and `/journal/:slug` — Journal index and twelve complete articles
- `/livraison`, `/guide-des-tailles`, `/allergenes`
- `/contact`, `/faq`
- `/checkout` — Three-step checkout
- `/confidentialite`, `/cgv`, `/mentions-legales`
- Branded fallback for unknown routes

### Seller workspace

- `/admin` — Revenue overview, KPIs, charts, recent orders, product activity derived from recorded orders, and tracked-stock alerts
- `/admin/orders` — Searchable order operations with CSV export, printable preparation slips, and fulfillment drawer
- `/admin/products` — Table/grid catalogue management, storefront publishing, optional inventory tracking, made-to-order products, product creation, and editing
- `/admin/custom` — Custom-cake request kanban with client details, quote amounts, internal notes, and persistent workflow stages
- `/admin/customers` — Customer segments, lifetime value, CSV export, contact details, and accessible customer profiles
- `/admin/reviews` — Review moderation with persistent public seller replies
- `/admin/messages` — Contact-message workflow and newsletter subscriber export/removal
- `/admin/analytics` — Revenue, order, city, and product insights calculated only from stored commerce data
- `/admin/settings` — Public contact/social details, fulfillment methods, city rates, free-delivery threshold, lead time, cash, banking details, notifications, account password, connection status, and JSON backups

The dashboard synchronizes settings, products, images, orders, custom requests, and reviews through Supabase when configured. Local browser persistence remains available on localhost for development. Production access is protected by Supabase authentication.

Public email and social links are rendered only when configured. Leave inventory blank for a made-to-order product; enter a numeric stock only when finite inventory must be tracked. Never publish an unverified street address, business schedule, social profile, customer metric, or bank detail.

## Local development

```bash
npm install
npm run dev
```

Node.js 20.19 or newer is required. Runtime and build dependencies are pinned for reproducible installs.

The Vite development server binds to `0.0.0.0` and accepts proxied preview hosts.

## Production build

```bash
npm run build
npm run preview
```

The deployable bundle is created in `dist/`. Netlify and Vercel rules serve statically generated SEO routes directly and preserve SPA fallback behavior for interactive and private routes.

## GitHub and Netlify deployment

The GitHub repository should contain this complete source project rather than a copy of `dist/`. The root `netlify.toml` runs `npm run build:netlify` and publishes the generated `dist` directory. The production build guard stops deployment when either required public Supabase variable is missing:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Configure both values in the Netlify project environment before enabling automatic production deploys from `main`. Keep `.env.local`, `.netlify/`, `node_modules/`, generated test screenshots, and `dist/` out of Git. The public `_headers`, `_redirects`, and `/.well-known/llms.txt` files are copied into every build from `public/`.

## Browser QA

```bash
npx playwright install chromium
npm test
```

The browser suite visits every public and seller route, runs strict Axe audits—including open drawers, modals, and reply forms—validates route metadata and structured data, exercises contact/FAQ interactions, completes the full commerce journey, verifies storefront-to-dashboard data flow, and checks responsive navigation plus console health.

Run the production build and browser suite together with `npm run check` after installing Chromium.

## Commerce integration

The checkout supports cash at delivery or pickup and bank transfer. Bank transfer stays hidden until bank, account-holder, and RIB or IBAN details are complete in `/admin/settings`. Orders are stored in Supabase and prepared as a complete WhatsApp message.

Apply `supabase/migrations/001_initial.sql` followed by `002_staff_access.sql`, then add authorized dashboard users to `public.staff_users`. Product images are resized and converted to WebP before upload to the `product-images` bucket. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the deployment environment; never expose a secret or `service_role` key.
