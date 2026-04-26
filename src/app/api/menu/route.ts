import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');

    const items = await prisma.menuItem.findMany({
      where: categorySlug ? { category: { slug: categorySlug } } : undefined,
      include: { category: true },
      orderBy: [{ categoryId: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(items.map((i) => ({ ...i, price: Number(i.price) })));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, price, categoryId, available, variants, addons, emoji } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'name, price, and categoryId are required' }, { status: 400 });
    }

    const item = await prisma.menuItem.create({
      data: { name, description: description || null, price, categoryId: Number(categoryId), available: available ?? true, variants: variants ?? null, addons: addons ?? null, emoji: emoji || null },
      include: { category: true },
    });

    return NextResponse.json({ ...item, price: Number(item.price) }, { status: 201 });
  } catch (e: unknown) {
    console.error(e);
    if ((e as { code?: string }).code === 'P2002') return NextResponse.json({ error: 'A menu item with this name already exists in this category' }, { status: 409 });
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
