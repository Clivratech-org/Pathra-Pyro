# Sri Pathra Pyro World

Public storefront + admin portal for the fireworks catalogue, Razorpay checkout, and delivery tracking.

**Zero-server deployment:** Vercel + Neon Postgres + Supabase Storage (see [Deploy on Vercel](#deploy-on-vercel-zero-server-management)).

## Local setup

```bash
npm install
cp .env.example .env
# Set DATABASE_URL to Neon Postgres (free) or local Postgres
npx prisma db push
npm run db:seed
npm run dev
```

- Public site: http://localhost:3000
- Admin: http://localhost:3000/admin
- Admin login: `admin@pathrapyro.local` / `Admin@123`
- Demo customer: `karthik@example.com` / `Customer@123`

Without Supabase env vars, images save to `./uploads/` locally. With Razorpay keys set to `placeholder`, checkout runs in **demo mode**.

## Deploy on Vercel (zero server management)

### 1. Create free services

| Service | Sign up | Purpose |
|---------|---------|---------|
| [Neon](https://neon.tech) | Free | PostgreSQL database |
| [Supabase](https://supabase.com) | Free | Image storage |
| [Vercel](https://vercel.com) | Free | Host Next.js app |
| [Cloudflare](https://cloudflare.com) | Free | DNS (optional) |

### 2. Neon database

1. Create a project → copy the **pooled** connection string.
2. Set as `DATABASE_URL` in Vercel env vars.

### 3. Supabase storage

1. Create a project → **Storage** → New bucket named `uploads`.
2. Make the bucket **public** (Policies → allow public read, or use Supabase dashboard “Public bucket”).
3. Copy:
   - Project URL → `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - Service role key (Settings → API) → `SUPABASE_SERVICE_ROLE_KEY`
   - Bucket name → `SUPABASE_STORAGE_BUCKET` and `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`

### 4. Vercel project

1. Import `Clivratech-org/Pathra-Pyro` from GitHub.
2. Add all env vars from `.env.example` (production values).
3. Deploy.

### 5. First-time database setup

After the first deploy, run once from your machine (with production `DATABASE_URL` in `.env`):

```bash
npx prisma db push
npm run db:seed
```

Or use Vercel CLI: `vercel env pull` then run the commands above.

### 6. Domains

In Vercel → Settings → Domains, add:

- `yourdomain.com`
- `admin.yourdomain.com` (same project — middleware routes admin subdomain)

Set `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` to `https://yourdomain.com`.

### Vercel environment variables

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Neon pooled Postgres URL |
| `AUTH_SECRET` | Yes | Random 32+ char string |
| `AUTH_URL` | Yes | `https://yourdomain.com` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Same as AUTH_URL |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side uploads |
| `SUPABASE_STORAGE_BUCKET` | Yes | `uploads` |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Same as SUPABASE_URL |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | Yes | `uploads` |
| `RAZORPAY_*` | Yes | Live/test keys from Razorpay |
| `ADMIN_*` | Seed only | First `db:seed` run |

## Features

- Full public catalogue (shop, categories, product detail, combos, quick order)
- Active campaign offers applied to live prices on shop and at checkout
- Cart (localStorage + DB sync for logged-in customers)
- Guest or account checkout with Razorpay (server-side price validation)
- Order tracking with shipment timeline and admin-uploaded photos
- Admin portal: products (multi-image upload + reorder), combos, offers, leads, sales, settings
- Cloud image storage (Supabase) — works on Vercel serverless

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Prisma generate + production build |
| `npm run vercel-build` | Same as build (used by Vercel) |
| `npm run start` | Start production server locally |
| `npm run db:push` | Sync schema to database |
| `npm run db:seed` | Seed demo data + upload placeholder images |
| `npm run db:reset` | Reset DB + reseed |

## Prototypes

Original static HTML prototypes are in `/prototype` for reference.
