'use client';

import { Category, MenuItem, Order, OrderItem, DashboardStats, Addon, Variant, ShopSettings } from '@/types';

// ── Storage keys ──────────────────────────────────────────────────────────────

const K = {
  categories: 'brew_categories',
  menu:       'brew_menu',
  orders:     'brew_orders',
  seeded:     'brew_seeded',
  settings:   'brew_settings',
  menuSeq:    'brew_seq_menu',
  orderSeq:   'brew_seq_order',
  orderIdSeq: 'brew_seq_order_id',
};

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED_CATEGORIES: Category[] = [
  { id: 1, name: 'Coffee',          slug: 'coffee' },
  { id: 2, name: 'Tea',             slug: 'tea' },
  { id: 3, name: 'Cold Beverages',  slug: 'cold-beverages' },
  { id: 4, name: 'Pastries',        slug: 'pastries' },
  { id: 5, name: 'Snacks',          slug: 'snacks' },
];

const SIZES: Variant[] = [{ name: 'Size', options: [
  { label: 'Small',  priceModifier: -0.50 },
  { label: 'Medium', priceModifier:  0.00 },
  { label: 'Large',  priceModifier:  0.75 },
]}];

const CA: Addon[] = [
  { name: 'Extra Shot',    price: 0.75 },
  { name: 'Oat Milk',      price: 0.60 },
  { name: 'Almond Milk',   price: 0.60 },
  { name: 'Whipped Cream', price: 0.50 },
  { name: 'Vanilla Syrup', price: 0.50 },
  { name: 'Caramel Syrup', price: 0.50 },
];
const TA: Addon[] = [
  { name: 'Extra Honey', price: 0.50 },
  { name: 'Oat Milk',    price: 0.60 },
  { name: 'Almond Milk', price: 0.60 },
];

type RawItem = Omit<MenuItem, 'category'>;

// GST slabs: 5% for dine-in food/beverages (non-AC), 12% for packaged/cold, 18% for AC restaurants
// Adjust per your client's restaurant type. Most small cafes use 5%.
const G5 = 0.05; const G12 = 0.12;

const SEED_MENU: RawItem[] = [
  // Coffee — 5% GST (restaurant beverage service)
  { id:  1, name: 'Espresso',       description: 'Rich and bold single shot',            price: 3.00, categoryId: 1, available: true, emoji: '☕', variants: SIZES, addons: CA, gstRate: G5 },
  { id:  2, name: 'Cappuccino',     description: 'Espresso with steamed milk foam',      price: 4.50, categoryId: 1, available: true, emoji: '☕', variants: SIZES, addons: CA, gstRate: G5 },
  { id:  3, name: 'Latte',          description: 'Smooth espresso with lots of milk',    price: 4.75, categoryId: 1, available: true, emoji: '☕', variants: SIZES, addons: CA, gstRate: G5 },
  { id:  4, name: 'Flat White',     description: 'Espresso with velvety microfoam',      price: 4.50, categoryId: 1, available: true, emoji: '☕', variants: SIZES, addons: CA, gstRate: G5 },
  { id:  5, name: 'Americano',      description: 'Espresso diluted with hot water',      price: 3.50, categoryId: 1, available: true, emoji: '☕', variants: SIZES, addons: [{ name: 'Extra Shot', price: 0.75 }], gstRate: G5 },
  { id:  6, name: 'Mocha',          description: 'Espresso with chocolate and milk',     price: 5.00, categoryId: 1, available: true, emoji: '☕', variants: SIZES, addons: CA, gstRate: G5 },
  { id:  7, name: 'Macchiato',      description: 'Espresso stained with foamed milk',    price: 4.00, categoryId: 1, available: true, emoji: '☕', variants: null,  addons: null, gstRate: G5 },
  { id:  8, name: 'Cortado',        description: 'Equal parts espresso and warm milk',   price: 4.00, categoryId: 1, available: true, emoji: '☕', variants: null,  addons: null, gstRate: G5 },
  // Tea — 5% GST
  { id:  9, name: 'Chai Latte',     description: 'Spiced tea with steamed milk',         price: 4.50, categoryId: 2, available: true, emoji: '🍵', variants: SIZES, addons: TA, gstRate: G5 },
  { id: 10, name: 'Green Tea',      description: 'Light and refreshing Sencha',          price: 3.50, categoryId: 2, available: true, emoji: '🍵', variants: null,  addons: TA, gstRate: G5 },
  { id: 11, name: 'Earl Grey',      description: 'Classic black tea with bergamot',      price: 3.50, categoryId: 2, available: true, emoji: '🍵', variants: null,  addons: TA, gstRate: G5 },
  { id: 12, name: 'Matcha Latte',   description: 'Ceremonial grade matcha with milk',    price: 5.50, categoryId: 2, available: true, emoji: '🍵', variants: SIZES, addons: TA, gstRate: G5 },
  { id: 13, name: 'Turmeric Latte', description: 'Golden milk with turmeric and spices', price: 5.00, categoryId: 2, available: true, emoji: '🍵', variants: null,  addons: null, gstRate: G5 },
  // Cold Beverages — 12% GST (packaged/cold beverages)
  { id: 14, name: 'Iced Coffee',    description: 'Chilled coffee over ice',              price: 4.00, categoryId: 3, available: true, emoji: '🧊', variants: null, addons: [{ name: 'Extra Shot', price: 0.75 }, { name: 'Vanilla Syrup', price: 0.50 }], gstRate: G12 },
  { id: 15, name: 'Cold Brew',      description: '12-hour cold-steeped coffee',          price: 5.00, categoryId: 3, available: true, emoji: '🧊', variants: null, addons: [{ name: 'Oat Milk', price: 0.60 }], gstRate: G12 },
  { id: 16, name: 'Frappuccino',    description: 'Blended iced coffee drink',            price: 5.50, categoryId: 3, available: true, emoji: '🥤', variants: null, addons: [{ name: 'Whipped Cream', price: 0.50 }, { name: 'Caramel Syrup', price: 0.50 }], gstRate: G12 },
  { id: 17, name: 'Iced Matcha',    description: 'Matcha over ice with milk',            price: 5.00, categoryId: 3, available: true, emoji: '🧊', variants: null, addons: [{ name: 'Oat Milk', price: 0.60 }], gstRate: G12 },
  { id: 18, name: 'Lemonade',       description: 'Fresh squeezed lemonade',              price: 3.50, categoryId: 3, available: true, emoji: '🧊', variants: null, addons: null, gstRate: G12 },
  // Pastries — 5% GST
  { id: 19, name: 'Croissant',       description: 'Buttery flaky pastry',                    price: 3.50, categoryId: 4, available: true, emoji: '🥐', variants: null, addons: null, gstRate: G5 },
  { id: 20, name: 'Blueberry Muffin',description: 'Moist muffin with fresh blueberries',     price: 3.00, categoryId: 4, available: true, emoji: '🫐', variants: null, addons: null, gstRate: G5 },
  { id: 21, name: 'Cinnamon Roll',   description: 'Warm roll with cream cheese frosting',    price: 4.50, categoryId: 4, available: true, emoji: '🌀', variants: null, addons: null, gstRate: G5 },
  { id: 22, name: 'Banana Bread',    description: 'Moist and rich banana bread slice',        price: 3.50, categoryId: 4, available: true, emoji: '🍌', variants: null, addons: null, gstRate: G5 },
  { id: 23, name: 'Chocolate Cake',  description: 'Decadent chocolate layer cake',            price: 5.00, categoryId: 4, available: true, emoji: '🍰', variants: null, addons: null, gstRate: G5 },
  { id: 24, name: 'Scone',           description: 'Classic British scone with clotted cream', price: 3.50, categoryId: 4, available: true, emoji: '🍮', variants: null, addons: null, gstRate: G5 },
  // Snacks — 12% GST (packaged snack items)
  { id: 25, name: 'Granola Bar',     description: 'Oats, honey and dried fruits',             price: 2.50, categoryId: 5, available: true, emoji: '🌾', variants: null, addons: null, gstRate: G12 },
  { id: 26, name: 'Trail Mix',       description: 'Nuts, seeds and dried berries',            price: 3.00, categoryId: 5, available: true, emoji: '🥜', variants: null, addons: null, gstRate: G12 },
  { id: 27, name: 'Avocado Toast',   description: 'Sourdough with smashed avocado',           price: 7.00, categoryId: 5, available: true, emoji: '🥑', variants: null, addons: null, gstRate: G5 },
  { id: 28, name: 'Cheese Sandwich', description: 'Grilled cheese on artisan bread',          price: 6.50, categoryId: 5, available: true, emoji: '🧀', variants: null, addons: null, gstRate: G5 },
  { id: 29, name: 'Yogurt Parfait',  description: 'Greek yogurt with granola and berries',    price: 5.00, categoryId: 5, available: true, emoji: '🍓', variants: null, addons: null, gstRate: G5 },
];

/** Demo orders seeded on first open so dashboard & history look populated. */
function buildDemoOrders(): Order[] {
  const now = Date.now();
  const h   = 3600_000;

  const mkItem = (id: number, n: string, bp: number, qty: number, gstRate = G5): OrderItem => {
    const itemTotal  = parseFloat((bp * qty).toFixed(2));
    const gstAmount  = parseFloat((itemTotal * gstRate).toFixed(2));
    return { id, menuItemId: id, name: n, basePrice: bp, quantity: qty, variant: null,
      variantPrice: 0, addons: null, addonsPrice: 0, itemTotal, gstRate, gstAmount };
  };

  const mkOrder = (
    id: number, num: string, ms: number,
    items: OrderItem[], method: 'CASH'|'CARD'|'UPI',
  ): Order => {
    const sub = parseFloat(items.reduce((s, i) => s + i.itemTotal, 0).toFixed(2));
    const gst = parseFloat(items.reduce((s, i) => s + i.gstAmount, 0).toFixed(2));
    const tot = parseFloat((sub + gst).toFixed(2));
    const ts  = new Date(now - ms).toISOString();
    return { id, orderNumber: num, items, status: 'PAID', subtotal: sub,
      taxRate: 0, taxAmount: gst, discountType: null, discountValue: null,
      discountAmount: 0, total: tot, paymentMethod: method, note: null,
      createdAt: ts, paidAt: ts };
  };

  return [
    mkOrder(1,'ORD-DEMO-0001', 1*h, [mkItem(1,'Cappuccino',4.50,2,G5), mkItem(2,'Croissant',3.50,1,G5)],           'CARD'),
    mkOrder(2,'ORD-DEMO-0002', 2*h, [mkItem(3,'Latte',4.75,1,G5), mkItem(4,'Blueberry Muffin',3.00,2,G5)],         'UPI'),
    mkOrder(3,'ORD-DEMO-0003', 3*h, [mkItem(5,'Cold Brew',5.00,1,G12), mkItem(6,'Avocado Toast',7.00,1,G5)],       'CASH'),
    mkOrder(4,'ORD-DEMO-0004', 4*h, [mkItem(7,'Espresso',3.00,2,G5)],                                               'CARD'),
    mkOrder(5,'ORD-DEMO-0005', 5*h, [mkItem(8,'Matcha Latte',5.50,1,G5), mkItem(9,'Cinnamon Roll',4.50,1,G5)],     'UPI'),
    mkOrder(6,'ORD-DEMO-0006',26*h, [mkItem(10,'Americano',3.50,1,G5), mkItem(11,'Granola Bar',2.50,2,G12)],       'CASH'),
    mkOrder(7,'ORD-DEMO-0007',27*h, [mkItem(12,'Chai Latte',4.50,2,G5), mkItem(13,'Scone',3.50,2,G5)],             'CARD'),
  ];
}

// ── Low-level helpers ─────────────────────────────────────────────────────────

function rd<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try { const s = localStorage.getItem(key); return s ? (JSON.parse(s) as T) : null; }
  catch { return null; }
}
function wr(key: string, val: unknown) { localStorage.setItem(key, JSON.stringify(val)); }

function nextSeq(key: string, start = 1000): number {
  const n = parseInt(localStorage.getItem(key) ?? String(start), 10);
  localStorage.setItem(key, String(n + 1));
  return n;
}

/** Must be called once per session (inside useEffect) to seed initial data. */
export function ensureSeeded() {
  if (rd<boolean>(K.seeded)) return;
  wr(K.categories, SEED_CATEGORIES);
  wr(K.menu,       SEED_MENU);
  wr(K.orders,     buildDemoOrders());
  localStorage.setItem(K.menuSeq,    '1000');
  localStorage.setItem(K.orderSeq,   '1');
  localStorage.setItem(K.orderIdSeq, '100');
  wr(K.seeded, true);
}

// ── Categories ────────────────────────────────────────────────────────────────

export function getCategories(): Category[] {
  return rd<Category[]>(K.categories) ?? SEED_CATEGORIES;
}

// ── Menu items ────────────────────────────────────────────────────────────────

function enrich(raw: RawItem): MenuItem {
  const cats = getCategories();
  return { ...raw, category: cats.find(c => c.id === raw.categoryId) ?? cats[0] };
}

export function getMenuItems(slug?: string): MenuItem[] {
  const raws = rd<RawItem[]>(K.menu) ?? SEED_MENU;
  const items = raws.map(enrich);
  return slug ? items.filter(i => i.category.slug === slug) : items;
}

export function createMenuItem(data: Omit<RawItem, 'id'>): MenuItem {
  const raws = rd<RawItem[]>(K.menu) ?? [];
  const raw: RawItem = { ...data, id: nextSeq(K.menuSeq) };
  wr(K.menu, [...raws, raw]);
  return enrich(raw);
}

export function updateMenuItem(id: number, patch: Partial<Omit<RawItem, 'id'>>): MenuItem | null {
  const raws = rd<RawItem[]>(K.menu) ?? [];
  const idx = raws.findIndex(r => r.id === id);
  if (idx === -1) return null;
  raws[idx] = { ...raws[idx], ...patch };
  wr(K.menu, raws);
  return enrich(raws[idx]);
}

export function deleteMenuItem(id: number): boolean {
  const raws = rd<RawItem[]>(K.menu) ?? [];
  const next = raws.filter(r => r.id !== id);
  if (next.length === raws.length) return false;
  wr(K.menu, next);
  return true;
}

// ── Orders ────────────────────────────────────────────────────────────────────

// 'items' is explicitly excluded from Omit so the intersection below cleanly
// overrides it with Omit<OrderItem,'id'>[] rather than creating the confusing
// OrderItem[] & Omit<OrderItem,'id'>[] intersection that would still require id.
type NewOrderInput = Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'paidAt' | 'items'> & {
  items: Omit<OrderItem, 'id'>[];
};

export function createOrder(input: NewOrderInput): Order {
  const orders = rd<Order[]>(K.orders) ?? [];
  const id = nextSeq(K.orderIdSeq, 100);

  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const seq     = nextSeq(K.orderSeq, 1);
  const orderNumber = `ORD-${dateStr}-${String(seq).padStart(4,'0')}`;

  let itemId = id * 100;
  const order: Order = {
    ...input,
    id,
    orderNumber,
    status: 'PAID',
    createdAt: new Date().toISOString(),
    paidAt:    new Date().toISOString(),
    items: input.items.map(i => ({ ...i, id: itemId++ })),
  };
  wr(K.orders, [order, ...orders]);
  return order;
}

export function getOrders(filters?: {
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
}): Order[] {
  const all = rd<Order[]>(K.orders) ?? [];
  return all.filter(o => {
    if (filters?.paymentMethod && o.paymentMethod !== filters.paymentMethod) return false;
    if (filters?.startDate) {
      const s = new Date(filters.startDate); s.setHours(0, 0, 0, 0);
      if (new Date(o.createdAt) < s) return false;
    }
    if (filters?.endDate) {
      const e = new Date(filters.endDate); e.setHours(23, 59, 59, 999);
      if (new Date(o.createdAt) > e) return false;
    }
    return true;
  });
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export function getDashboardStats(): DashboardStats {
  const all = rd<Order[]>(K.orders) ?? [];

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayOrders = all.filter(o => new Date(o.createdAt) >= todayStart);

  const todayRevenue    = todayOrders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue   = todayOrders.length ? todayRevenue / todayOrders.length : 0;
  const totalItemsSold  = todayOrders.reduce((s, o) => s + o.items.reduce((is, i) => is + i.quantity, 0), 0);

  // Top items
  const itemMap = new Map<string, { qty: number; revenue: number }>();
  for (const o of todayOrders)
    for (const i of o.items) {
      const cur = itemMap.get(i.name) ?? { qty: 0, revenue: 0 };
      itemMap.set(i.name, { qty: cur.qty + i.quantity, revenue: cur.revenue + i.itemTotal });
    }
  const topItems = [...itemMap.entries()]
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);

  // Revenue by method
  const methodMap = new Map<string, number>();
  for (const o of todayOrders)
    methodMap.set(o.paymentMethod, (methodMap.get(o.paymentMethod) ?? 0) + o.total);
  const revenueByMethod = (['CASH', 'CARD', 'UPI'] as const).map(m => ({
    method: m, amount: methodMap.get(m) ?? 0,
  }));

  return {
    todayRevenue,
    todayOrders: todayOrders.length,
    avgOrderValue,
    totalItemsSold,
    topItems,
    revenueByMethod,
    recentOrders: all.slice(0, 10),
  };
}

// ── Shop settings ─────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: ShopSettings = {
  shopName:   'Brew & Co.',
  gstin:      '',
  address:    '',
  phone:      '',
  currency:   '₹',
  taxLabel:   'CGST/SGST',
  licenseKey: '',
};

export function getShopSettings(): ShopSettings {
  return { ...DEFAULT_SETTINGS, ...(rd<Partial<ShopSettings>>(K.settings) ?? {}) };
}

export function saveShopSettings(s: ShopSettings) {
  wr(K.settings, s);
}
