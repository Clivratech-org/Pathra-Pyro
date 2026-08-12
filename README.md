# Sri Pathra Pyro World

Public storefront + admin portal for the fireworks catalogue, Razorpay checkout, and delivery tracking.

## Local setup

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin (or http://admin.localhost:3000 with hosts entry)
- Admin login: `admin@pathrapyro.local` / `Admin@123`
- Demo customer: `karthik@example.com` / `Customer@123`

Copy `.env.example` to `.env`. With Razorpay keys set to `placeholder`, checkout runs in **demo mode** so you can test orders, invoices, and tracking without real payments.

### SSL / corporate network installs

If `npm install` or `prisma generate` fails with `UNABLE_TO_VERIFY_LEAF_SIGNATURE`:

```bash
set NODE_TLS_REJECT_UNAUTHORIZED=0
npx prisma generate
```

Or use `npm install --strict-ssl=false` once, then restore normal SSL settings.

## Features

- Full public catalogue (shop, categories, product detail, combos, quick order)
- Active campaign offers applied to live prices on shop and at checkout
- Cart (localStorage + DB sync for logged-in customers)
- Guest or account checkout with Razorpay (server-side price validation)
- Order tracking with shipment timeline and admin-uploaded photos
- Admin portal: products (multi-image upload + reorder), combos, offers, leads, sales, settings

## Production deployment

### 1. Environment

Set these on your host (Vercel, VPS, Docker, etc.):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Use PostgreSQL in production (`prisma/schema.prisma` provider) |
| `AUTH_SECRET` | Random 32+ char string |
| `AUTH_URL` | Public site URL, e.g. `https://pathrapyroworld.com` |
| `NEXT_PUBLIC_SITE_URL` | Same as public URL |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Live or test keys from Razorpay dashboard |
| `ADMIN_*` | Used only for initial seed; change admin password after first login |

### 2. Database

For PostgreSQL, update `provider` in `prisma/schema.prisma` to `postgresql`, then:

```bash
npx prisma migrate deploy
npm run db:seed   # first deploy only
```

### 3. Build & run

```bash
npm ci
npm run build
npm start
```

The app uses Next.js `standalone` output. Persist the `uploads/` directory (product images, tracking photos) on a volume or object storage.

### 4. Domains

Point **both** records at the same deployment:

- `pathrapyroworld.com` → public site
- `admin.pathrapyroworld.com` → admin (middleware rewrites to `/admin`)

Set `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to the main public domain.

### 5. Post-deploy checklist

- [ ] Replace placeholder Razorpay keys
- [ ] Change admin password
- [ ] Confirm checkout + order tracking end-to-end
- [ ] Back up database and `uploads/` regularly

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Prisma generate + production build |
| `npm run start` | Start production server |
| `npm run db:push` | Sync schema (dev) |
| `npm run db:seed` | Seed demo data |
| `npm run db:reset` | Reset DB + reseed |

## Prototypes

Original static HTML prototypes are in `/prototype` for reference.
