import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: Number(params.id) },
      include: { category: true },
    });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ...item, price: Number(item.price) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json();
    const item = await prisma.menuItem.update({
      where: { id: Number(params.id) },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.categoryId !== undefined && { categoryId: Number(body.categoryId) }),
        ...(body.available !== undefined && { available: body.available }),
        ...(body.variants !== undefined && { variants: body.variants }),
        ...(body.addons !== undefined && { addons: body.addons }),
        ...(body.emoji !== undefined && { emoji: body.emoji }),
      },
      include: { category: true },
    });
    return NextResponse.json({ ...item, price: Number(item.price) });
  } catch (e: unknown) {
    console.error(e);
    if ((e as { code?: string }).code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await prisma.menuItem.delete({ where: { id: Number(params.id) } });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    console.error(e);
    if ((e as { code?: string }).code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
