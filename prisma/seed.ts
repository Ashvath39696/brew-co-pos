import { PrismaClient, PaymentMethod, DiscountType } from '@prisma/client';

const prisma = new PrismaClient();

const SIZE_VARIANTS = [
  {
    name: 'Size',
    options: [
      { label: 'Small', priceModifier: -0.5 },
      { label: 'Medium', priceModifier: 0 },
      { label: 'Large', priceModifier: 0.75 },
    ],
  },
];

const COFFEE_ADDONS = [
  { name: 'Extra Shot', price: 0.75 },
  { name: 'Oat Milk', price: 0.6 },
  { name: 'Almond Milk', price: 0.6 },
  { name: 'Soy Milk', price: 0.6 },
  { name: 'Whipped Cream', price: 0.5 },
  { name: 'Vanilla Syrup', price: 0.5 },
  { name: 'Caramel Syrup', price: 0.5 },
];

async function main() {
  console.log('🌱 Seeding database...');

  // ── Categories ────────────────────────────────────────────────────────────
  const [coffee, tea, coldBev, pastries, snacks] = await Promise.all([
    prisma.category.upsert({ where: { slug: 'coffee' }, update: {}, create: { name: 'Coffee', slug: 'coffee' } }),
    prisma.category.upsert({ where: { slug: 'tea' }, update: {}, create: { name: 'Tea', slug: 'tea' } }),
    prisma.category.upsert({ where: { slug: 'cold-beverages' }, update: {}, create: { name: 'Cold Beverages', slug: 'cold-beverages' } }),
    prisma.category.upsert({ where: { slug: 'pastries' }, update: {}, create: { name: 'Pastries', slug: 'pastries' } }),
    prisma.category.upsert({ where: { slug: 'snacks' }, update: {}, create: { name: 'Snacks', slug: 'snacks' } }),
  ]);

  // ── Menu Items ────────────────────────────────────────────────────────────
  const menuDefs = [
    // Coffee
    { categoryId: coffee.id, name: 'Espresso', description: 'Rich bold single shot', price: 3.0, emoji: '☕', variants: SIZE_VARIANTS, addons: COFFEE_ADDONS },
    { categoryId: coffee.id, name: 'Americano', description: 'Espresso with hot water', price: 3.5, emoji: '☕', variants: SIZE_VARIANTS, addons: COFFEE_ADDONS },
    { categoryId: coffee.id, name: 'Cappuccino', description: 'Equal parts espresso, milk & foam', price: 4.5, emoji: '☕', variants: SIZE_VARIANTS, addons: COFFEE_ADDONS },
    { categoryId: coffee.id, name: 'Latte', description: 'Espresso with silky steamed milk', price: 4.75, emoji: '☕', variants: SIZE_VARIANTS, addons: COFFEE_ADDONS },
    { categoryId: coffee.id, name: 'Flat White', description: 'Smooth velvety microfoam', price: 4.5, emoji: '☕', variants: SIZE_VARIANTS, addons: COFFEE_ADDONS },
    { categoryId: coffee.id, name: 'Macchiato', description: 'Espresso with a touch of foam', price: 3.75, emoji: '☕', variants: SIZE_VARIANTS, addons: COFFEE_ADDONS },
    { categoryId: coffee.id, name: 'Mocha', description: 'Espresso, chocolate & steamed milk', price: 5.0, emoji: '☕', variants: SIZE_VARIANTS, addons: COFFEE_ADDONS },
    { categoryId: coffee.id, name: 'Cortado', description: 'Espresso cut with warm milk', price: 4.0, emoji: '☕', variants: null, addons: COFFEE_ADDONS },
    // Tea
    { categoryId: tea.id, name: 'English Breakfast', description: 'Classic bold black tea', price: 3.0, emoji: '🍵', variants: SIZE_VARIANTS, addons: [{ name: 'Oat Milk', price: 0.6 }, { name: 'Almond Milk', price: 0.6 }, { name: 'Honey', price: 0.3 }] },
    { categoryId: tea.id, name: 'Earl Grey', description: 'Bergamot-infused black tea', price: 3.0, emoji: '🍵', variants: SIZE_VARIANTS, addons: [{ name: 'Oat Milk', price: 0.6 }, { name: 'Honey', price: 0.3 }] },
    { categoryId: tea.id, name: 'Chamomile', description: 'Soothing floral herbal blend', price: 3.0, emoji: '🌼', variants: SIZE_VARIANTS, addons: [{ name: 'Honey', price: 0.3 }] },
    { categoryId: tea.id, name: 'Matcha Latte', description: 'Ceremonial matcha with steamed milk', price: 5.0, emoji: '🍵', variants: SIZE_VARIANTS, addons: [{ name: 'Oat Milk', price: 0.6 }, { name: 'Almond Milk', price: 0.6 }, { name: 'Extra Matcha', price: 0.75 }] },
    { categoryId: tea.id, name: 'Chai Latte', description: 'Spiced tea with steamed milk', price: 4.5, emoji: '🍵', variants: SIZE_VARIANTS, addons: [{ name: 'Oat Milk', price: 0.6 }, { name: 'Extra Spice', price: 0.3 }] },
    // Cold Beverages
    { categoryId: coldBev.id, name: 'Iced Latte', description: 'Espresso over ice with cold milk', price: 5.0, emoji: '🧊', variants: SIZE_VARIANTS, addons: COFFEE_ADDONS },
    { categoryId: coldBev.id, name: 'Iced Americano', description: 'Espresso over ice', price: 4.0, emoji: '🧊', variants: SIZE_VARIANTS, addons: COFFEE_ADDONS },
    { categoryId: coldBev.id, name: 'Cold Brew', description: '20-hour cold-steeped coffee', price: 5.5, emoji: '🥤', variants: SIZE_VARIANTS, addons: [{ name: 'Oat Milk', price: 0.6 }, { name: 'Vanilla Syrup', price: 0.5 }] },
    { categoryId: coldBev.id, name: 'Frappuccino', description: 'Blended ice coffee drink', price: 6.0, emoji: '🥤', variants: null, addons: [{ name: 'Whipped Cream', price: 0.5 }, { name: 'Caramel Drizzle', price: 0.5 }, { name: 'Extra Shot', price: 0.75 }] },
    { categoryId: coldBev.id, name: 'Iced Matcha Latte', description: 'Matcha over ice with oat milk', price: 5.5, emoji: '🍵', variants: SIZE_VARIANTS, addons: [{ name: 'Oat Milk', price: 0.6 }, { name: 'Almond Milk', price: 0.6 }] },
    // Pastries
    { categoryId: pastries.id, name: 'Butter Croissant', description: 'Flaky French-style pastry', price: 3.5, emoji: '🥐', variants: null, addons: null },
    { categoryId: pastries.id, name: 'Chocolate Croissant', description: 'Dark chocolate-filled croissant', price: 4.0, emoji: '🥐', variants: null, addons: null },
    { categoryId: pastries.id, name: 'Blueberry Muffin', description: 'Bursting with fresh blueberries', price: 3.5, emoji: '🧁', variants: null, addons: null },
    { categoryId: pastries.id, name: 'Banana Bread', description: 'Moist slice with walnuts', price: 4.0, emoji: '🍞', variants: null, addons: null },
    { categoryId: pastries.id, name: 'Cinnamon Roll', description: 'Warm spiral with cream cheese glaze', price: 4.5, emoji: '🍥', variants: null, addons: null },
    { categoryId: pastries.id, name: 'Almond Danish', description: 'Flaky pastry with almond filling', price: 4.0, emoji: '🥐', variants: null, addons: null },
    // Snacks
    { categoryId: snacks.id, name: 'Avocado Toast', description: 'Sourdough with smashed avo & chilli flakes', price: 7.5, emoji: '🥑', variants: null, addons: [{ name: 'Poached Egg', price: 1.5 }, { name: 'Feta Cheese', price: 1.0 }] },
    { categoryId: snacks.id, name: 'Granola Bar', description: 'Oats, honey & mixed seeds', price: 3.0, emoji: '🌾', variants: null, addons: null },
    { categoryId: snacks.id, name: 'Cheese & Crackers', description: 'Selection of artisan cheeses', price: 5.5, emoji: '🧀', variants: null, addons: null },
    { categoryId: snacks.id, name: 'Fruit Cup', description: 'Seasonal fresh fruit mix', price: 4.0, emoji: '🍓', variants: null, addons: null },
    { categoryId: snacks.id, name: 'Yoghurt Parfait', description: 'Greek yoghurt, granola & berries', price: 5.0, emoji: '🫙', variants: null, addons: null },
  ];

  const savedItems: { id: number; name: string; price: number }[] = [];

  for (const def of menuDefs) {
    const item = await prisma.menuItem.upsert({
      where: { name_categoryId: { name: def.name, categoryId: def.categoryId } },
      update: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: def as any,
    });
    savedItems.push({ id: item.id, name: item.name, price: Number(item.price) });
  }

  // ── Seed Demo Orders ──────────────────────────────────────────────────────
  const existingOrderCount = await prisma.order.count();
  if (existingOrderCount > 0) {
    console.log(`✅ Skipping order seed — ${existingOrderCount} orders already exist.`);
    return;
  }

  const byName = Object.fromEntries(savedItems.map((i) => [i.name, i]));
  const TAX = 0.085;

  type SeedOrder = {
    daysAgo: number;
    hour: number;
    paymentMethod: PaymentMethod;
    discountType?: DiscountType;
    discountValue?: number;
    note?: string;
    items: { name: string; qty: number; variant?: string; variantPrice?: number; addons?: { name: string; price: number }[] }[];
  };

  const seedOrders: SeedOrder[] = [
    // Today
    { daysAgo: 0, hour: 8, paymentMethod: 'CARD', items: [{ name: 'Cappuccino', qty: 2, variant: 'Medium', variantPrice: 0 }, { name: 'Butter Croissant', qty: 2 }] },
    { daysAgo: 0, hour: 9, paymentMethod: 'CASH', items: [{ name: 'Latte', qty: 1, variant: 'Large', variantPrice: 0.75, addons: [{ name: 'Oat Milk', price: 0.6 }] }, { name: 'Blueberry Muffin', qty: 1 }], discountType: 'PERCENT', discountValue: 10 },
    { daysAgo: 0, hour: 10, paymentMethod: 'UPI', items: [{ name: 'Iced Latte', qty: 2, variant: 'Large', variantPrice: 0.75, addons: [{ name: 'Oat Milk', price: 0.6 }] }, { name: 'Butter Croissant', qty: 1 }, { name: 'Avocado Toast', qty: 1 }] },
    { daysAgo: 0, hour: 11, paymentMethod: 'CARD', items: [{ name: 'Espresso', qty: 1, variant: 'Small', variantPrice: -0.5 }, { name: 'Cold Brew', qty: 1, variant: 'Medium', variantPrice: 0 }], discountType: 'FIXED', discountValue: 1 },
    { daysAgo: 0, hour: 12, paymentMethod: 'CARD', items: [{ name: 'Chai Latte', qty: 1, variant: 'Medium', variantPrice: 0 }, { name: 'Avocado Toast', qty: 1 }, { name: 'Yoghurt Parfait', qty: 1 }] },
    { daysAgo: 0, hour: 14, paymentMethod: 'CASH', items: [{ name: 'Frappuccino', qty: 2, addons: [{ name: 'Whipped Cream', price: 0.5 }] }, { name: 'Cinnamon Roll', qty: 1 }] },
    // Yesterday
    { daysAgo: 1, hour: 8, paymentMethod: 'CARD', items: [{ name: 'Americano', qty: 1, variant: 'Medium', variantPrice: 0 }, { name: 'Banana Bread', qty: 1 }] },
    { daysAgo: 1, hour: 9, paymentMethod: 'CARD', items: [{ name: 'Cappuccino', qty: 3, variant: 'Medium', variantPrice: 0 }, { name: 'Almond Danish', qty: 2 }], discountType: 'PERCENT', discountValue: 5 },
    { daysAgo: 1, hour: 10, paymentMethod: 'UPI', items: [{ name: 'Matcha Latte', qty: 2, variant: 'Large', variantPrice: 0.75 }, { name: 'Fruit Cup', qty: 2 }] },
    { daysAgo: 1, hour: 13, paymentMethod: 'CASH', items: [{ name: 'Latte', qty: 1, variant: 'Large', variantPrice: 0.75 }, { name: 'Cheese & Crackers', qty: 1 }] },
    { daysAgo: 1, hour: 16, paymentMethod: 'CARD', items: [{ name: 'Iced Matcha Latte', qty: 2, variant: 'Medium', variantPrice: 0 }, { name: 'Chocolate Croissant', qty: 1 }] },
    // 2 days ago
    { daysAgo: 2, hour: 9, paymentMethod: 'CARD', items: [{ name: 'Flat White', qty: 2, variant: 'Medium', variantPrice: 0 }, { name: 'Butter Croissant', qty: 2 }] },
    { daysAgo: 2, hour: 11, paymentMethod: 'CASH', items: [{ name: 'Cold Brew', qty: 1, variant: 'Large', variantPrice: 0.75 }, { name: 'Granola Bar', qty: 2 }] },
    { daysAgo: 2, hour: 14, paymentMethod: 'UPI', items: [{ name: 'Mocha', qty: 1, variant: 'Medium', variantPrice: 0, addons: [{ name: 'Whipped Cream', price: 0.5 }] }, { name: 'Cinnamon Roll', qty: 1 }], discountType: 'FIXED', discountValue: 2 },
    // 3 days ago
    { daysAgo: 3, hour: 8, paymentMethod: 'CARD', items: [{ name: 'Espresso', qty: 2, variant: 'Small', variantPrice: -0.5 }] },
    { daysAgo: 3, hour: 10, paymentMethod: 'CARD', items: [{ name: 'Cappuccino', qty: 2, variant: 'Large', variantPrice: 0.75 }, { name: 'Avocado Toast', qty: 1, addons: [{ name: 'Poached Egg', price: 1.5 }] }] },
    { daysAgo: 3, hour: 15, paymentMethod: 'CASH', items: [{ name: 'Chai Latte', qty: 2, variant: 'Medium', variantPrice: 0 }, { name: 'Blueberry Muffin', qty: 3 }] },
    // 4 days ago
    { daysAgo: 4, hour: 9, paymentMethod: 'UPI', items: [{ name: 'Iced Latte', qty: 1, variant: 'Large', variantPrice: 0.75, addons: [{ name: 'Oat Milk', price: 0.6 }, { name: 'Extra Shot', price: 0.75 }] }, { name: 'Banana Bread', qty: 1 }] },
    { daysAgo: 4, hour: 12, paymentMethod: 'CARD', items: [{ name: 'Latte', qty: 4, variant: 'Medium', variantPrice: 0 }, { name: 'Cinnamon Roll', qty: 3 }], discountType: 'PERCENT', discountValue: 15, note: 'Office order' },
    // 5 days ago
    { daysAgo: 5, hour: 10, paymentMethod: 'CARD', items: [{ name: 'Macchiato', qty: 2 }, { name: 'Almond Danish', qty: 2 }] },
    { daysAgo: 5, hour: 14, paymentMethod: 'CASH', items: [{ name: 'Frappuccino', qty: 3, addons: [{ name: 'Whipped Cream', price: 0.5 }, { name: 'Caramel Drizzle', price: 0.5 }] }] },
    // 6 days ago
    { daysAgo: 6, hour: 8, paymentMethod: 'CARD', items: [{ name: 'Americano', qty: 1, variant: 'Large', variantPrice: 0.75 }, { name: 'Butter Croissant', qty: 1 }] },
    { daysAgo: 6, hour: 11, paymentMethod: 'UPI', items: [{ name: 'Matcha Latte', qty: 1, variant: 'Medium', variantPrice: 0 }, { name: 'Yoghurt Parfait', qty: 2 }] },
  ];

  let orderSeq = 1;

  for (const def of seedOrders) {
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - def.daysAgo);
    orderDate.setHours(def.hour, Math.floor(Math.random() * 60), 0, 0);

    const itemRows = def.items.map((i) => {
      const menuItem = byName[i.name];
      const basePrice = menuItem.price;
      const variantPrice = i.variantPrice ?? 0;
      const addonsPrice = (i.addons ?? []).reduce((s, a) => s + a.price, 0);
      const unitPrice = basePrice + variantPrice + addonsPrice;
      const itemTotal = unitPrice * i.qty;
      return { menuItem, basePrice, variantPrice, addonsPrice, itemTotal, def: i };
    });

    const subtotal = itemRows.reduce((s, r) => s + r.itemTotal, 0);
    const discountAmt =
      def.discountType === 'PERCENT'
        ? subtotal * ((def.discountValue ?? 0) / 100)
        : def.discountType === 'FIXED'
        ? Math.min(def.discountValue ?? 0, subtotal)
        : 0;
    const taxable = subtotal - discountAmt;
    const taxAmount = taxable * TAX;
    const total = taxable + taxAmount;

    const dateStr = orderDate.toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `ORD-${dateStr}-${String(orderSeq++).padStart(4, '0')}`;

    await prisma.order.create({
      data: {
        orderNumber,
        status: 'PAID',
        subtotal,
        taxRate: TAX,
        taxAmount,
        discountType: def.discountType ?? null,
        discountValue: def.discountValue ?? null,
        discountAmount: discountAmt,
        total,
        paymentMethod: def.paymentMethod,
        note: def.note ?? null,
        createdAt: orderDate,
        paidAt: orderDate,
        items: {
          create: itemRows.map((r) => ({
            menuItemId: r.menuItem.id,
            name: r.menuItem.name,
            basePrice: r.basePrice,
            quantity: r.def.qty,
            variant: r.def.variant ?? null,
            variantPrice: r.variantPrice,
            addons: r.def.addons ?? null,
            addonsPrice: r.addonsPrice,
            itemTotal: r.itemTotal,
          })),
        },
      },
    });
  }

  console.log(`✅ Seeded ${seedOrders.length} orders and ${menuDefs.length} menu items.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
