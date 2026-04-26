# Brew & Co. — Coffee Shop POS

A complete, demo-ready Point-of-Sale application for a coffee shop. Built with Next.js 14, PostgreSQL, Prisma, and Tailwind CSS. Runs in a single Docker Compose command.

---

## Architecture

```
Browser
  └── Next.js 14 (App Router)  — port 3000
        ├── /             Dashboard (stats, charts, recent orders)
        ├── /pos          POS screen (menu browser + cart + payment)
        ├── /orders       Order history (filter, view, reprint)
        ├── /menu         Menu management (CRUD, availability toggle)
        └── /api/*        REST API route handlers
              ├── /api/dashboard
              ├── /api/menu
              ├── /api/menu/[id]
              ├── /api/orders
              ├── /api/orders/[id]
              └── /api/categories

PostgreSQL (port 5432, internal only)
  └── Prisma ORM — schema in prisma/schema.prisma
```

**Key choices:**
- **Full-stack Next.js** — no separate API server needed
- **PostgreSQL** — production-grade relational DB
- **Prisma** — type-safe ORM with easy migration
- **Tailwind CSS** — utility-first, no component library dependency
- **Docker Compose** — one command starts everything

---

## Quick Start (Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)

### Run the app

```bash
# Clone / enter the project directory
cd cf_bl

# Build and start everything (first run takes ~3-5 minutes to build)
docker compose up --build

# On subsequent runs (image already built):
docker compose up
```

The app will:
1. Start PostgreSQL
2. Push the Prisma schema (create tables)
3. Seed sample menu items + 23 demo orders
4. Start Next.js on port 3000

### Open in browser

| URL | Page |
|-----|------|
| http://localhost:3000 | Dashboard |
| http://localhost:3000/pos | New Order (POS) |
| http://localhost:3000/orders | Order History |
| http://localhost:3000/menu | Menu Management |

### Stop

```bash
docker compose down          # stop containers (data preserved)
docker compose down -v       # stop + delete database volume (fresh start)
```

---

## Local Development (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL running locally

```bash
# Install dependencies
npm install

# Copy env file and set your database URL
cp .env.example .env.local
# Edit .env.local: DATABASE_URL="postgresql://user:pass@localhost:5432/coffeepos"

# Push schema and seed
npx prisma db push
npx prisma db seed

# Start dev server
npm run dev
```

---

## Demo Flow (Testing Checklist)

After `docker compose up` and the app is live at http://localhost:3000:

### Dashboard
- [ ] View today's revenue, order count, avg order value, items sold
- [ ] See top-selling items bar chart (pre-seeded data)
- [ ] See revenue by payment method
- [ ] View a recent order receipt inline

### Create a New Order (POS)
- [ ] Go to http://localhost:3000/pos
- [ ] Click **Cappuccino** → select **Medium** size → click **Add to Cart** × 2
- [ ] Click **Butter Croissant** → Add to Cart × 1
- [ ] Click **Iced Latte** → select **Large** → check **Oat Milk** → Add to Cart
- [ ] Optionally add an order note
- [ ] Apply a 10% discount: select "% Off", enter `10`
- [ ] Click **Pay** → select **Card** → **Confirm Card Payment**
- [ ] Receipt modal appears with full breakdown
- [ ] Click **Print** to open printable receipt in new tab
- [ ] Click **New Order** to reset cart

### Order History
- [ ] Go to http://localhost:3000/orders
- [ ] New order appears at the top
- [ ] Filter by **CARD** payment method
- [ ] Filter by today's date range
- [ ] Click **View** to see receipt inline
- [ ] Click printer icon to reprint receipt

### Menu Management
- [ ] Go to http://localhost:3000/menu
- [ ] Toggle an item's availability (In Stock ↔ Out of Stock)
- [ ] Click **Add Item** → fill in name, price, category, enable size variants
- [ ] Verify new item appears in POS menu
- [ ] Edit an existing item and update price
- [ ] Delete an item

### Dashboard Refresh
- [ ] Go back to http://localhost:3000
- [ ] Click **Refresh** — today's revenue should include the new order

---

## Receipt Details

Every receipt includes:
- Shop name & address (Brew & Co., 123 Coffee Lane)
- Order ID (e.g. `ORD-20240423-0001`)
- Date & time
- Each item with quantity, variant, and add-ons
- Subtotal → Discount → Tax → **Total**
- Payment method
- Thank-you footer

Receipts are printable via browser print dialog (opens a clean 300px-wide receipt layout in a new window).

---

## Known Limitations

1. **No authentication** — anyone with the URL can access all pages. Suitable for demo/internal use.
2. **Tax rate is hardcoded** at 8.5% in the POS page (`TAX_RATE = 0.085`). To change it, update that constant.
3. **No real-time sync** — if two browsers have the POS open, they won't see each other's cart activity.
4. **No inventory tracking** — availability is a manual toggle; stock levels are not decremented per sale.
5. **Order numbers may collide** if many orders are created in the same second on parallel requests (fine for demo scale).
6. **Print** opens a new browser window — pop-up blockers may need to allow localhost.

---

## Seed Data Summary

| Category | Items |
|----------|-------|
| Coffee | Espresso, Americano, Cappuccino, Latte, Flat White, Macchiato, Mocha, Cortado |
| Tea | English Breakfast, Earl Grey, Chamomile, Matcha Latte, Chai Latte |
| Cold Beverages | Iced Latte, Iced Americano, Cold Brew, Frappuccino, Iced Matcha Latte |
| Pastries | Butter Croissant, Chocolate Croissant, Blueberry Muffin, Banana Bread, Cinnamon Roll, Almond Danish |
| Snacks | Avocado Toast, Granola Bar, Cheese & Crackers, Fruit Cup, Yoghurt Parfait |

23 demo orders seeded across the past 7 days with a mix of CASH / CARD / UPI payments and varying discounts.
