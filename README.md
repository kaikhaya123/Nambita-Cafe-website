# Nambita Cafe

The website for Nambita Cafe (KwaMashu and Waterloo, Durban), with online ordering and a staff dashboard.

- **Customers** browse the menu, add items to a cart, pay online with **Yoco**, and collect their order at a branch.
- **Staff** log in to a kitchen board that shows paid orders and move them from New → Preparing → Ready → Collected.
- **Managers** also see sales reports and manage who can log in.

Built with **Next.js** (App Router), **React**, **Tailwind CSS**, **Supabase** (the database) and **Resend** (emails).

---

## Running it on your computer

1. Install the packages: `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in the values (see [Settings](#settings-envlocal)).
3. Start it: `npm run dev`, then open <http://localhost:3000>
4. Before committing, check for mistakes: `npm run lint`

## Settings (`.env.local`)

| Setting | What it's for |
| --- | --- |
| `YOCO_SECRET_KEY` | Lets the server create Yoco payment pages. |
| `YOCO_WEBHOOK_SECRET` | Lets the server check that "payment succeeded" messages really come from Yoco. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Connects to the database. **Keep the service role key secret**: it can read and change everything. |
| `DASHBOARD_SESSION_SECRET` | 32+ random characters used to sign staff logins. Changing it logs everyone out. |
| `MANAGER_DASHBOARD_PASSWORD` | Only used once, to create the very first manager account at `/dashboard/setup`. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Sends receipts and "your order is ready" emails. |
| `NEXT_PUBLIC_SITE_URL` | The live website address, used in SEO tags. Defaults to `https://nambitacafe.co.za`. |

`.env.local` is never committed to git. Never paste its values into code.

## Setting up the database (Supabase)

Run these in the Supabase **SQL Editor**, in this order:

1. `supabase/orders.sql` creates the `orders` table.
2. `supabase/migrations/002_pickup_and_receipts.sql` is **only** for an old project that was created before pickup ordering. Skip it on a new project.
3. `supabase/migrations/003_order_fulfillment.sql` adds the kitchen stages (safe to run on a new project too).
4. `supabase/migrations/004_staff_accounts.sql` creates the staff login accounts.

In the Yoco dashboard, point the webhook at `https://<your-domain>/api/webhooks/yoco`.

---

## Where everything lives

```text
app/                    Pages and API routes. The folder path is the URL.
  page.tsx                /              Home
  menu/page.tsx           /menu          Menu + add to cart
  about/page.tsx          /about         About us
  map/page.tsx            /map           Find a branch
  checkout/page.tsx       /checkout      Details → review → pay
  checkout/success/       /checkout/success   After paying: live order progress
  dashboard/              /dashboard…    Staff area: orders board, sales, performance, team, setup
  nambita-staff-access/   Staff login (password, then authenticator code)
  api/                    Server code the pages call (never runs in the browser)

components/             The building blocks of the pages, grouped by page
  home/  about/  menu/  map/  checkout/     one folder per public page
  dashboard/                                staff area (orders/, team/, auth/, analytics/)
  layout/                                   Navbar and Footer (on every public page)
  shared/                                   small pieces used by more than one page

lib/                    Logic and data that isn't a component
  menu-data.ts            THE MENU: items, prices, photos
  cafe-locations.ts       THE BRANCHES: names, addresses, map points
  cart.ts                 the customer's cart (saved in the browser)
  orders.ts               order types and kitchen stages
  analytics.ts            numbers for the sales and performance reports
  email/order-emails.ts   receipt and "ready" emails
  staff-*.ts, security/   staff accounts, logins, passwords, authenticator codes
  supabase.ts             database connection
  api-response.ts         small helpers shared by the API routes

supabase/               SQL for setting up the database
public/                 Images, icons, videos, fonts (a file at public/Images/x.png is served at /Images/x.png)
```

Every file starts with a short comment saying what it does, so opening a file is usually enough to get your bearings.

---

## How the main features work

### A customer places an order

1. **Menu** (`app/menu/page.tsx`): clicking "Add to Cart" stores the item in the cart (`lib/cart.ts`), which is saved in the browser's localStorage.
2. **Checkout** (`app/checkout/page.tsx`): the customer fills in their details, reviews the order and clicks **Confirm & Pay**.
3. The page sends the cart to **`POST /api/checkout`** (`app/api/checkout/route.ts`). The server:
   - rebuilds every line from `lib/menu-data.ts`, so **prices always come from the menu, never from the browser**,
   - saves the order in Supabase with status `pending`,
   - asks Yoco for a payment page and sends the customer there.
4. The customer pays on Yoco's page. Yoco sends them back to `/checkout/success`.
5. Separately, **Yoco calls `POST /api/webhooks/yoco`**. We check Yoco's signature, mark the order `paid` and email the receipt.
6. The success page asks `GET /api/orders/<number>/status` every 10 seconds to show "Preparing" / "Ready".

> An order only appears on the kitchen board once it's **paid**. If the webhook isn't set up, orders stay `pending` and the board stays empty.

### The kitchen board

`/dashboard` shows `components/dashboard/orders/OrdersBoard.tsx`. It checks `GET /api/staff/orders` every 5 seconds. Clicking a button calls `PATCH /api/staff/orders/<number>` to move the order to the next stage. Moving an order to **Ready** emails the customer.

### Staff logins

Everyone has their own account: a password **and** an authenticator app code (like Google Authenticator).

1. A **manager** adds a person on `/dashboard/team` and clicks **Setup code**. They get a one-time code like `K7P2M-QX9TD` and give it to the person.
2. The person opens `/dashboard/setup`, enters the code, scans the QR code with their authenticator app and chooses a password.
3. From then on they log in at `/nambita-staff-access` with the password, then the 6-digit code from the app.

Managers can **Reset** someone (new setup code, old login stops working) or **Deactivate** them (logged out everywhere).
The very first manager is created at `/dashboard/setup` using `MANAGER_DASHBOARD_PASSWORD`.

| Page | Who can see it |
| --- | --- |
| Orders board, Sales | Staff and managers |
| Performance, Team | Managers only |

---

## Common changes: where to go

| I want to… | Change this |
| --- | --- |
| Add, remove or re-price a menu item | `lib/menu-data.ts` (put its photo in `public/Images/`) |
| Add or change a branch | `lib/cafe-locations.ts` (updates checkout, /map, footer and reports) |
| Change a brand colour | `tailwind.config.js` → `brand` (use classes like `bg-brand-yellow`, `text-brand-green`) |
| Change the home page cards | `components/home/MenuCarousel.tsx` → `menuGridItems` |
| Change the About page text or photos | `components/about/` |
| Change footer links or social media | `components/layout/Footer.tsx` |
| Change navbar links | `components/layout/Navbar.tsx` → `primaryNavLinks` |
| Change the receipt or "ready" email | `lib/email/order-emails.ts` |
| Change page titles for Google | the `layout.tsx` next to each page, and `app/layout.tsx` for the default |
| Change the checkout form | `components/checkout/DetailsStep.tsx` (and the checks in `app/api/checkout/route.ts`) |

---

## Rules that keep things safe

1. **Never trust the browser with money.** Prices and totals are always worked out on the server from `lib/menu-data.ts`.
2. **Server-only files stay on the server.** Never import these from a file that starts with `'use client'`:
   `lib/supabase.ts`, `lib/staff-*.ts`, `lib/security/*`, `lib/email/*`, `lib/analytics.ts`, `lib/api-response.ts`.
   They use secret keys that must never reach a customer's browser.
3. **Every staff API route checks the login first** (`getStaffSession()` / `isStaffAuthenticated()`), and manager-only ones check `role === 'manager'`. Keep that check when you add a new route.
4. **`'use client'` only where needed.** Add it at the top of a component when it uses state (`useState`), effects, click handlers or animations. Pages that only arrange sections (like `app/page.tsx`) don't need it.
5. **Use the brand colour names** (`bg-brand-yellow`) instead of typing hex codes (`bg-[#FFFF00]`).

## Working on this with Claude Code

- Say which page or feature you mean ("the checkout details step", "the kitchen board"). The tables above tell Claude where to look too.
- Ask for one change at a time, then check it with `npm run dev` in the browser.
- Before committing, run `npm run lint`.
- This project uses a newer Next.js than most tutorials. See `AGENTS.md`: the docs for the installed version are in `node_modules/next/dist/docs/`.
