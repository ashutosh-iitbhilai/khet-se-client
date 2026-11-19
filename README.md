# Khet Se — Web

**Fresh from Local Farms to Your Home.** Customer and farmer web app for Khet Se, a geo-spatial marketplace connecting organic farmers directly with customers in their city.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn-style components · React Hook Form + Zod · Leaflet / OpenStreetMap.

The REST API lives in **[khet-se-server](https://github.com/ashutosh-iitbhilai/khet-se-server)**, which also holds the [architecture](https://github.com/ashutosh-iitbhilai/khet-se-server/blob/main/docs/ARCHITECTURE.md) and [deployment](https://github.com/ashutosh-iitbhilai/khet-se-server/blob/main/docs/DEPLOYMENT.md) docs. This app talks to the API only over REST.

## Setup

Start the API first (see khet-se-server), then:

```bash
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev                  # http://localhost:3000
```

| Variable | When | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | build time | API base used by the browser |
| `API_INTERNAL_URL` | runtime, optional | API base for server-side fetches (e.g. `http://api:5000/api` in Docker) |

## Scripts

| Script | Purpose |
|---|---|
| `dev` / `build` / `start` | Next dev · production build (standalone output) · serve build |
| `typecheck` / `test` | type-check · unit tests (formatting, units, categories, image hosts, cart steps) |

To build while `npm run dev` is running, use a separate output folder: `NEXT_DIST_DIR=.next-build npm run build`.

CI (`.github/workflows/ci.yml`) runs typecheck, tests and build, and builds the Docker image.

## Pages

**Customers**

| Path | What it shows |
|---|---|
| `/` | Hero search, fresh + dry categories, farmers near you, products picked for you, how it works |
| `/products` | Every listing that delivers to you; search, type, category, distance, price, organic, sort. Filters live in the URL. |
| `/products/[id]` | Photos, price, freshness, delivery check, farmer card, farm map, same item from other farms, add to cart |
| `/farmers`, `/farmers/[id]` | Farm discovery with filters; farmer profiles with story, badges, products and farm map |
| `/cart`, `/checkout` | Basket grouped by farm with live server-checked quote; address, payment (COD / Razorpay when enabled), review |
| `/account` | Orders with per-farm tracking and delivery codes, saved addresses, profile |

**Sign-in** (everyone)

| Path | What it shows |
|---|---|
| `/login`, `/register` | Mobile number (or email) + password; email is optional at signup, and "Continue with Google" when the API has Google configured (`/api/auth/providers`). Google errors arrive as `/login?error=<code>`. |
| `/forgot-password` | Asks for an email; the same confirmation whether or not an account exists |
| `/reset-password?token=…` | Sets a new password from the emailed link (single-use, 30 minutes), then sends you to log in |

**Admin** (`/admin`, admin accounts only):
- Overview: what needs attention, plus business numbers.
- Farmer verification: approve or reject the profile and the organic certificate, with a note the farmer sees.
- People: search, role details, suspend or reactivate with a reason.
- Orders: filters, search, part-cancel, record refunds.
- Transactions.
- Audit trail.

**Delivery partners** (`/delivery`): overview with online switch, today's earnings and cash collected; *Find deliveries* (open jobs near your base, auto-refreshing, first to accept wins); *My deliveries* (call / directions, "I've picked it up", hand over with the customer's code); history & earnings; work area & vehicle; account settings. Register with "I deliver".

**Farmers** (`/farmer`): overview, my products, add product, inventory, incoming / completed orders, farm profile with map pin, account settings.

## Data and state

- **Server data** goes through one shared cache ([TanStack Query](https://tanstack.com/query)), via `useFetch(key, fetcher)` in `hooks/useFetch.ts`. A key starts with its area (`orders`, `farmer`, `delivery`, `inventory`, `market`, `addresses`, …, see `lib/queryClient.ts`), then its parameters.
- **After any successful change**, the API client announces it, and every screen showing affected data refreshes (`areasChangedBy` maps API paths to areas). Screens never have to reload by hand.
- **Automatic refreshes:** data refetches when you return to the tab. Farmer order queues, the partner job board, active deliveries and the customer's order page also poll every 20–30 s.
- **Login, logout or switching accounts** clears the cache. If the session ends elsewhere, the app shows you as logged out.
- **Local-only state:** the cart and the delivery location live in `localStorage`. Cart prices and stock are always re-checked with the server (`useQuote`).

## Design

- **Square corners everywhere:** every `rounded-*` utility resolves to `0` in `tailwind.config.ts`, and `globals.css` enforces it for all elements.
- **Palette:** leaf green, cream, sand and soil tones; Fraunces for headings and Inter for text.
- **States:** every data view has loading, empty and error states. Layouts are responsive down to 375 px.

## Photos

Catalogue and site photos are self-hosted in `public/images`: Unsplash License and Creative Commons (CC0 / BY / BY-SA) images from Wikimedia Commons. Sources and licences are listed on the in-app `/credits` page, and catalogue credits are stored with each product in the API.

## Docker

```bash
docker build -t khet-se-web --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api .
docker run -p 3000:3000 -e API_INTERNAL_URL=http://api:5000/api khet-se-web
```

For the full stack (MongoDB, Redis, API, web), use `docker-compose.yml` in khet-se-server with this repo cloned next to it.

## Project structure

```
app/          routes: (shop) customer pages, (auth) login/register, farmer/ dashboard
components/   ui/ (button, input, dialog, …), layout/ (navbar, footer), map/ (Leaflet)
features/     auth, cart, checkout, account, location, marketplace, farmer
hooks/        useFetch, useUrlState, useDebounced
lib/          API client, labels, categories, images, utils
services/     typed REST calls per resource
types/        shared TypeScript types
public/       self-hosted photos
```
