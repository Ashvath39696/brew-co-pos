import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [todayOrders, recentOrders] = await Promise.all([
      prisma.order.findMany({
        where: { status: 'PAID', paidAt: { gte: todayStart } },
        include: { items: true },
        orderBy: { paidAt: 'desc' },
      }),
      prisma.order.findMany({
        where: { status: 'PAID' },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const todayRevenue = todayOrders.reduce((s, o) => s + Number(o.total), 0);
    const todayOrderCount = todayOrders.length;
    const avgOrderValue = todayOrderCount > 0 ? todayRevenue / todayOrderCount : 0;
    const totalItemsSold = todayOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.quantity, 0), 0);

    // Top selling items (today)
    const itemMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const order of todayOrders) {
      for (const item of order.items) {
        if (!itemMap[item.name]) itemMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
        itemMap[item.name].qty += item.quantity;
        itemMap[item.name].revenue += Number(item.itemTotal);
      }
    }
    const topItems = Object.values(itemMap).sort((a, b) => b.qty - a.qty).slice(0, 6);

    // Revenue by payment method (today)
    const methodMap: Record<string, number> = { CASH: 0, CARD: 0, UPI: 0 };
    for (const order of todayOrders) methodMap[order.paymentMethod] += Number(order.total);
    const revenueByMethod = Object.entries(methodMap).map(([method, amount]) => ({ method, amount }));

    const serialize = (o: typeof recentOrders[0]) => ({
      ...o,
      subtotal: Number(o.subtotal),
      taxRate: Number(o.taxRate),
      taxAmount: Number(o.taxAmount),
      discountValue: o.discountValue ? Number(o.discountValue) : null,
      discountAmount: Number(o.discountAmount),
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      paidAt: o.paidAt?.toISOString() ?? null,
      items: o.items.map((i) => ({
        ...i,
        basePrice: Number(i.basePrice),
        variantPrice: Number(i.variantPrice),
        addonsPrice: Number(i.addonsPrice),
        itemTotal: Number(i.itemTotal),
      })),
    });

    return NextResponse.json({
      todayRevenue,
      todayOrders: todayOrderCount,
      avgOrderValue,
      totalItemsSold,
      topItems,
      revenueByMethod,
      recentOrders: recentOrders.map(serialize),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
