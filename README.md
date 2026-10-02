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
| `MANAGER_DASHBOARD_PASSWORD` | The one password all **managers** use to log in (8+ characters). Changing it logs every manager out. |
| `STAFF_DASHBOARD_PASSWORD` | The one password all **staff** use to log in (8+ characters). Changing it logs every staff member out. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Sends receipts and "your order is ready" emails. |
| `NEXT_PUBLIC_SITE_URL` | The live website address, used in SEO tags. Defaults to `https://nambitacafe.co.za`. |

`.env.local` is never committed to git. Never paste its values into code.

## Setting up the database (Supabase)

Run these in the Supabase **SQL Editor**, in this order:

1. `supabase/orders.sql` creates the `orders` table.
2. `supabase/migrations/002_pickup_and_receipts.sql` is **only** for an old project that was created before pickup ordering. Skip it on a new project.
3. `supabase/migrations/003_order_fulfillment.sql` adds the kitchen stages (safe to run on a new project too).
4. `supabase/migrations/004_staff_accounts.sql` creates the staff login accounts.
5. `supabase/migrations/005_rate_limits.sql` switches on rate limiting (e.g. max checkouts per visitor). Until it's run, the site works but limits nothing.

In the Yoco dashboard, point the webhook at `https://<your-domain>/api/webhooks/yoco`.

## Maintenance commands

These run on your computer and use the settings in `.env.local`, so they work on the **live database**.

| Command | When | What it does |
| --- | --- | --- |
| `npm run ops:check` | Any time something seems wrong, or weekly | **Read-only.** Checks every setting is filled in and looks right, the database tables exist, no orders are stuck (unpaid for over an hour, or paid but still on the kitchen board after 12 hours) and there is at least one active manager. |
| `npm run ops:monthly` | First week of each month | Everything in `ops:check`, plus: last month's sales (orders, revenue, branches, top items), marks unpaid orders older than 2 days as `cancelled`, deletes old rate-limit counters, lists who can log in, and checks the npm packages for security issues and updates. |
| `npm run ops:monthly -- --dry-run` | Before the real run, if unsure | Same as above, but only says what it *would* tidy. Changes nothing. |

Lines marked `WARN` need attention; each one says what to do. The code is in `scripts/ops/`.

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
  dashboard/              /dashboard…    Staff area: orders board, order history, sales, performance, team
  nambita-staff-access/   Dashboard login (Staff or Manager, name, password)
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
  orders.ts               order types, kitchen stages and short order numbers (Order No. 005)
  order-history.ts        loads orders for the Order History and order details pages
  analytics.ts            numbers for the sales and performance reports
  email/order-emails.ts   receipt and "ready" emails
  staff-*.ts, security/   staff accounts, logins and the login cookie
  supabase.ts             database connection
  api-response.ts         small helpers shared by the API routes
  rate-limit.ts           limits how often something can happen (e.g. checkouts per visitor)

scripts/ops/            Maintenance commands (npm run ops:check, ops:monthly). See "Maintenance commands"
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
   - checks the visitor hasn't started too many checkouts (10 per internet address and 5 per phone number every 10 minutes, see `lib/rate-limit.ts`),
   - saves the order in Supabase with status `pending`,
   - asks Yoco for a payment page (giving up after 15 seconds) and sends the customer there. If Yoco can't make one, the order is marked `failed`.
4. The customer pays on Yoco's page. Yoco sends them back to `/checkout/success`.
5. Separately, **Yoco calls `POST /api/webhooks/yoco`**. We check Yoco's signature, mark the order `paid` and email the receipt.
6. The success page asks `GET /api/orders/<number>/status` every 10 seconds to show "Preparing" / "Ready".

> An order only appears on the kitchen board once it's **paid**. If the webhook isn't set up, orders stay `pending` and the board stays empty.

### The kitchen board

`/dashboard` shows `components/dashboard/orders/OrdersBoard.tsx`. It checks `GET /api/staff/orders` every 5 seconds. Clicking a button calls `PATCH /api/staff/orders/<number>` to move the order to the next stage. Moving an order to **Ready** emails the customer.

Each order shows a short number, **Order No. 005**, worked out from its real reference (`NC-2026-0005`) by `ticketNumber()` in `lib/orders.ts`. It counts 001 → 100 and then starts again. Tapping it opens the order's details page.

### Order history

`/dashboard/history` (the **History** menu link) lists every paid order, newest first, 25 per page. Search by order number (`005`), full reference (`NC-2026-0005`) or customer name. Each order opens `/dashboard/history/<reference>`, which shows the customer, what they ordered, their note, what they paid and when it was placed, prepared, ready and collected. Data comes from `lib/order-history.ts`.

### Staff logins

Everyone has an account (their name in the list), but passwords are shared per role and set by HQ:
**staff** use `STAFF_DASHBOARD_PASSWORD` and **managers** use `MANAGER_DASHBOARD_PASSWORD`
(in `.env.local`, and in Vercel's Environment Variables for the live site). There's no authenticator app or setup code.

1. A manager adds the person on `/dashboard/team` as **Staff** or **Manager**. They can log in straight away.
2. They log in at `/nambita-staff-access`: choose **Staff** or **Manager**, their name, and type that role's password.
3. Someone leaves? Click **Deactivate** next to their name (logged out everywhere). If they knew the password, also change it and redeploy: that logs everyone in that role out and the old password stops working.

5 wrong passwords lock that name for 15 minutes.

> To add the very first manager (e.g. after a fresh database), add a row in Supabase's `staff_accounts` table with their `name` and `role` = `manager`.

| Page | Who can see it |
| --- | --- |
| Orders board, Order history, Sales | Staff and managers |
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
   `lib/supabase.ts`, `lib/staff-*.ts`, `lib/security/*`, `lib/email/*`, `lib/analytics.ts`, `lib/api-response.ts`, `lib/rate-limit.ts`, `lib/order-history.ts`.
   They use secret keys that must never reach a customer's browser.
3. **Every staff API route checks the login first** (`getStaffSession()` / `isStaffAuthenticated()`), and manager-only ones check `role === 'manager'`. Keep that check when you add a new route.
4. **`'use client'` only where needed.** Add it at the top of a component when it uses state (`useState`), effects, click handlers or animations. Pages that only arrange sections (like `app/page.tsx`) don't need it.
5. **Use the brand colour names** (`bg-brand-yellow`) instead of typing hex codes (`bg-[#FFFF00]`).

## Working on this with Claude Code

- Say which page or feature you mean ("the checkout details step", "the kitchen board"). The tables above tell Claude where to look too.
- Ask for one change at a time, then check it with `npm run dev` in the browser.
- Before committing, run `npm run lint`.
- This project uses a newer Next.js than most tutorials. See `AGENTS.md`: the docs for the installed version are in `node_modules/next/dist/docs/`.
