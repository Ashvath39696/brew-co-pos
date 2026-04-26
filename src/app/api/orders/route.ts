import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeOrder(order: any) {
  return {
    ...order,
    subtotal: Number(order.subtotal),
    taxRate: Number(order.taxRate),
    taxAmount: Number(order.taxAmount),
    discountValue: order.discountValue != null ? Number(order.discountValue) : null,
    discountAmount: Number(order.discountAmount),
    total: Number(order.total),
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    paidAt: order.paidAt ? (order.paidAt instanceof Date ? order.paidAt.toISOString() : order.paidAt) : null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: (order.items as any[]).map((i) => ({
      ...i,
      basePrice: Number(i.basePrice),
      variantPrice: Number(i.variantPrice),
      addonsPrice: Number(i.addonsPrice),
      itemTotal: Number(i.itemTotal),
    })),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentMethod = searchParams.get('paymentMethod');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, any> = { status: 'PAID' };
    if (paymentMethod && ['CASH', 'CARD', 'UPI'].includes(paymentMethod)) where.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders.map((o) => serializeOrder(o)));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, subtotal, taxRate, taxAmount, discountType, discountValue, discountAmount, total, paymentMethod, note } = body;

    if (!items?.length || !paymentMethod) {
      return NextResponse.json({ error: 'items and paymentMethod are required' }, { status: 400 });
    }

    // Generate order number: ORD-YYYYMMDD-NNNN
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayCount = await prisma.order.count({ where: { createdAt: { gte: todayStart } } });
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `ORD-${dateStr}-${String(todayCount + 1).padStart(4, '0')}`;

    const now = new Date();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'PAID',
        subtotal,
        taxRate,
        taxAmount,
        discountType: discountType ?? null,
        discountValue: discountValue ?? null,
        discountAmount: discountAmount ?? 0,
        total,
        paymentMethod,
        note: note ?? null,
        paidAt: now,
        items: {
          create: items.map((i: {
            menuItemId: number; name: string; basePrice: number; quantity: number;
            variant?: string; variantPrice: number; addons?: unknown; addonsPrice: number; itemTotal: number;
          }) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            basePrice: i.basePrice,
            quantity: i.quantity,
            variant: i.variant ?? null,
            variantPrice: i.variantPrice ?? 0,
            addons: i.addons ?? null,
            addonsPrice: i.addonsPrice ?? 0,
            itemTotal: i.itemTotal,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(serializeOrder(order), { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
