import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

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
    items: (order.items as any[]).map((i: any) => ({
      ...i,
      basePrice: Number(i.basePrice),
      variantPrice: Number(i.variantPrice),
      addonsPrice: Number(i.addonsPrice),
      itemTotal: Number(i.itemTotal),
    })),
  };
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(params.id) },
      include: { items: true },
    });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(serializeOrder(order));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
