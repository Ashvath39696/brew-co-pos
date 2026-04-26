'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, ClipboardList, UtensilsCrossed } from 'lucide-react';
import clsx from 'clsx';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pos', label: 'New Order', icon: ShoppingCart },
  { href: '/orders', label: 'Orders', icon: ClipboardList },
  { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-3 shadow-sm">
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2">
        <span className="text-2xl">☕</span>
        <span className="text-lg font-bold tracking-tight text-stone-900">
          Brew <span className="text-amber-600">&amp;</span> Co.
        </span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                active
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
