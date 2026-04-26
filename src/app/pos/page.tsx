'use client';

import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { Receipt, printReceipt } from '@/components/Receipt';
import { PageLoader } from '@/components/LoadingSpinner';
import { MenuItem, Category, CartItem, Addon, Variant, Order, PaymentMethod } from '@/types';
import { Search, Plus, Minus, Trash2, X, Tag, StickyNote, CreditCard, Banknote, Smartphone, Printer, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';

const TAX_RATE = 0.085;

// ─── Item Selection Modal ────────────────────────────────────────────────────
function ItemModal({ item, onClose, onAdd }: { item: MenuItem; onClose: () => void; onAdd: (c: CartItem) => void }) {
  const variants: Variant[] = (item.variants as Variant[] | null) ?? [];
  const addons: Addon[] = (item.addons as Addon[] | null) ?? [];
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<{ label: string; priceModifier: number } | null>(
    variants[0]?.options[1] ?? variants[0]?.options[0] ?? null
  );
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  const toggleAddon = (addon: Addon) =>
    setSelectedAddons((prev) =>
      prev.some((a) => a.name === addon.name) ? prev.filter((a) => a.name !== addon.name) : [...prev, addon]
    );

  const variantPrice = selectedVariant?.priceModifier ?? 0;
  const addonsPrice = selectedAddons.reduce((s, a) => s + a.price, 0);
  const unitPrice = item.price + variantPrice + addonsPrice;
  const total = unitPrice * qty;

  const handleAdd = () => {
    const cartItem: CartItem = {
      cartId: `${item.id}-${Date.now()}-${Math.random()}`,
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      quantity: qty,
      variant: selectedVariant?.label,
      variantPrice,
      selectedAddons,
      addonsPrice,
      itemTotal: total,
    };
    onAdd(cartItem);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b">
          <div>
            <div className="text-2xl mb-1">{item.emoji}</div>
            <h2 className="text-lg font-bold">{item.name}</h2>
            {item.description && <p className="text-sm text-stone-500 mt-0.5">{item.description}</p>}
            <p className="text-amber-700 font-semibold mt-1">${item.price.toFixed(2)}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 ml-4"><X size={22} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Variants */}
          {variants.map((v) => (
            <div key={v.name}>
              <p className="label">{v.name}</p>
              <div className="grid grid-cols-3 gap-2">
                {v.options.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedVariant(opt)}
                    className={clsx(
                      'rounded-lg border-2 py-2 text-sm font-medium transition',
                      selectedVariant?.label === opt.label
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : 'border-stone-200 text-stone-700 hover:border-stone-300'
                    )}
                  >
                    <div>{opt.label}</div>
                    {opt.priceModifier !== 0 && (
                      <div className="text-xs text-stone-400">
                        {opt.priceModifier > 0 ? '+' : ''}${Math.abs(opt.priceModifier).toFixed(2)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Add-ons */}
          {addons.length > 0 && (
            <div>
              <p className="label">Add-ons</p>
              <div className="space-y-2">
                {addons.map((addon) => {
                  const checked = selectedAddons.some((a) => a.name === addon.name);
                  return (
                    <label key={addon.name} className="flex items-center gap-3 cursor-pointer group">
                      <div className={clsx('w-5 h-5 rounded border-2 flex items-center justify-center transition',
                        checked ? 'bg-amber-500 border-amber-500' : 'border-stone-300 group-hover:border-amber-400'
                      )}>
                        {checked && <svg viewBox="0 0 10 10" className="w-3 h-3 text-white" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleAddon(addon)} />
                      <span className="flex-1 text-sm text-stone-700">{addon.name}</span>
                      <span className="text-sm text-stone-500">+${addon.price.toFixed(2)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <p className="label">Quantity</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 rounded-full border-2 border-stone-300 flex items-center justify-center hover:border-amber-400 transition"><Minus size={16} /></button>
              <span className="text-xl font-bold w-8 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-9 h-9 rounded-full border-2 border-stone-300 flex items-center justify-center hover:border-amber-400 transition"><Plus size={16} /></button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-stone-50 rounded-b-2xl flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-stone-500">Total</div>
            <div className="text-xl font-bold text-stone-900">${total.toFixed(2)}</div>
          </div>
          <button onClick={handleAdd} className="btn-primary flex-1 max-w-[180px]">
            <Plus size={16} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({
  total, method, onMethodChange, onConfirm, onClose, isProcessing,
}: {
  total: number; method: PaymentMethod; onMethodChange: (m: PaymentMethod) => void;
  onConfirm: () => void; onClose: () => void; isProcessing: boolean;
}) {
  const methods: { id: PaymentMethod; label: string; icon: React.ElementType }[] = [
    { id: 'CASH', label: 'Cash', icon: Banknote },
    { id: 'CARD', label: 'Card', icon: CreditCard },
    { id: 'UPI', label: 'UPI', icon: Smartphone },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold">Payment</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700"><X size={22} /></button>
        </div>
        <div className="p-5 space-y-5">
          <div className="text-center">
            <div className="text-sm text-stone-500">Amount Due</div>
            <div className="text-4xl font-bold text-stone-900 mt-1">${total.toFixed(2)}</div>
          </div>
          <div>
            <p className="label text-center mb-3">Select Payment Method</p>
            <div className="grid grid-cols-3 gap-3">
              {methods.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onMethodChange(id)}
                  className={clsx(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition',
                    method === id
                      ? 'border-amber-500 bg-amber-50 text-amber-700'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  )}
                >
                  <Icon size={24} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t">
          <button onClick={onConfirm} disabled={isProcessing} className="btn-primary w-full py-3 text-base">
            {isProcessing ? 'Processing…' : `Confirm ${method} Payment`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Receipt Modal ────────────────────────────────────────────────────────────
function ReceiptModal({ order, onClose, onNewOrder }: { order: Order; onClose: () => void; onNewOrder: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-stone-900">Order Complete! 🎉</h2>
            <p className="text-xs text-stone-500">{order.orderNumber}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => printReceipt(order)} className="btn-secondary text-xs px-3 py-1.5">
              <Printer size={13} /> Print
            </button>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-700"><X size={20} /></button>
          </div>
        </div>
        <div className="p-5 flex justify-center">
          <Receipt order={order} />
        </div>
        <div className="p-4 border-t sticky bottom-0 bg-white">
          <button onClick={onNewOrder} className="btn-primary w-full">
            <Plus size={16} /> New Order
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cart Item Row ────────────────────────────────────────────────────────────
function CartItemRow({ item, onQty, onRemove }: { item: CartItem; onQty: (id: string, qty: number) => void; onRemove: (id: string) => void }) {
  const unitPrice = item.basePrice + item.variantPrice + item.addonsPrice;
  return (
    <div className="p-3 border-b border-stone-100 last:border-0">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-stone-900 truncate">{item.name}{item.variant ? <span className="text-stone-400 font-normal"> · {item.variant}</span> : ''}</div>
          {item.selectedAddons.length > 0 && (
            <div className="text-xs text-stone-400 mt-0.5">{item.selectedAddons.map((a) => a.name).join(', ')}</div>
          )}
          <div className="text-xs text-amber-700 mt-0.5">${unitPrice.toFixed(2)} ea.</div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onQty(item.cartId, item.quantity - 1)} className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition"><Minus size={13} /></button>
          <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
          <button onClick={() => onQty(item.cartId, item.quantity + 1)} className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition"><Plus size={13} /></button>
        </div>
        <div className="flex items-center gap-1 ml-1">
          <span className="text-sm font-semibold w-16 text-right">${item.itemTotal.toFixed(2)}</span>
          <button onClick={() => onRemove(item.cartId)} className="text-stone-300 hover:text-red-500 transition ml-1"><Trash2 size={15} /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Main POS Page ────────────────────────────────────────────────────────────
export default function POSPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [note, setNote] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FIXED' | ''>('');
  const [discountValue, setDiscountValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [menuRes, catRes] = await Promise.all([fetch('/api/menu'), fetch('/api/categories')]);
        const [menu, cats] = await Promise.all([menuRes.json(), catRes.json()]);
        setMenuItems(menu);
        setCategories(cats);
      } catch {
        toast.error('Failed to load menu');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      if (!item.available) return false;
      if (selectedCategory !== 'all' && item.category.slug !== selectedCategory) return false;
      if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Calculations
  const subtotal = cart.reduce((s, i) => s + i.itemTotal, 0);
  const discountNum = Number(discountValue) || 0;
  const discountAmount =
    discountType === 'PERCENT' ? subtotal * (discountNum / 100) :
    discountType === 'FIXED' ? Math.min(discountNum, subtotal) : 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * TAX_RATE;
  const total = taxableAmount + taxAmount;

  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    setSelectedItem(null);
    toast.success(`${item.name} added to cart`);
  };

  const updateQty = (cartId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.cartId !== cartId));
      return;
    }
    setCart((prev) =>
      prev.map((i) => {
        if (i.cartId !== cartId) return i;
        const unit = i.basePrice + i.variantPrice + i.addonsPrice;
        return { ...i, quantity: qty, itemTotal: unit * qty };
      })
    );
  };

  const removeItem = (cartId: string) => setCart((prev) => prev.filter((i) => i.cartId !== cartId));

  const clearCart = () => {
    setCart([]);
    setNote('');
    setDiscountType('');
    setDiscountValue('');
  };

  const handlePayment = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setIsProcessing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            basePrice: i.basePrice,
            quantity: i.quantity,
            variant: i.variant ?? null,
            variantPrice: i.variantPrice,
            addons: i.selectedAddons.length ? i.selectedAddons : null,
            addonsPrice: i.addonsPrice,
            itemTotal: i.itemTotal,
          })),
          subtotal,
          taxRate: TAX_RATE,
          taxAmount,
          discountType: discountType || null,
          discountValue: discountType ? discountNum : null,
          discountAmount,
          total,
          paymentMethod,
          note: note.trim() || null,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const order: Order = await res.json();
      setCompletedOrder(order);
      setShowPayment(false);
      clearCart();
      toast.success('Order completed!');
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Menu Browser ── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
          {/* Search + category bar */}
          <div className="bg-white border-b border-stone-200 px-4 pt-4 pb-0">
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search menu…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
              <button onClick={() => setSelectedCategory('all')}
                className={clsx('shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition', selectedCategory === 'all' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200')}>
                All
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)}
                  className={clsx('shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition', selectedCategory === cat.slug ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200')}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Item grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <PageLoader />
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-stone-400">
                <span className="text-5xl mb-3">🔍</span>
                <p className="text-sm">No items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="card p-4 text-left hover:shadow-md hover:border-amber-200 transition-all active:scale-95"
                  >
                    <div className="text-3xl mb-2">{item.emoji ?? '☕'}</div>
                    <div className="font-semibold text-sm text-stone-900 leading-tight">{item.name}</div>
                    {item.description && <div className="text-xs text-stone-400 mt-1 line-clamp-2">{item.description}</div>}
                    <div className="text-amber-700 font-bold mt-2 text-sm">${item.price.toFixed(2)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Cart ── */}
        <div className="w-80 lg:w-96 flex flex-col bg-white border-l border-stone-200 shadow-xl">
          {/* Cart header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-stone-500" />
              <span className="font-semibold text-stone-900">Current Order</span>
              {cart.length > 0 && (
                <span className="ml-1 text-xs bg-amber-100 text-amber-700 font-semibold rounded-full px-2 py-0.5">{cart.length}</span>
              )}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs text-stone-400 hover:text-red-500 transition">Clear</button>
            )}
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-stone-300">
                <ShoppingCart size={40} className="mb-2" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs mt-1">Tap an item to add it</p>
              </div>
            ) : (
              cart.map((item) => (
                <CartItemRow key={item.cartId} item={item} onQty={updateQty} onRemove={removeItem} />
              ))
            )}
          </div>

          {/* Extras: note + discount */}
          {cart.length > 0 && (
            <div className="border-t border-stone-100 px-4 py-3 space-y-3">
              {/* Note */}
              <div className="flex items-start gap-2">
                <StickyNote size={15} className="text-stone-400 mt-2 shrink-0" />
                <textarea
                  placeholder="Order note (optional)…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="input resize-none text-xs"
                />
              </div>

              {/* Discount */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag size={15} className="text-stone-400" />
                  <span className="text-xs font-medium text-stone-600">Discount</span>
                </div>
                <div className="flex gap-2">
                  <select
                    value={discountType}
                    onChange={(e) => { setDiscountType(e.target.value as '' | 'PERCENT' | 'FIXED'); setDiscountValue(''); }}
                    className="input text-xs py-1.5 w-28"
                  >
                    <option value="">None</option>
                    <option value="PERCENT">% Off</option>
                    <option value="FIXED">$ Off</option>
                  </select>
                  {discountType && (
                    <input
                      type="number"
                      min={0}
                      max={discountType === 'PERCENT' ? 100 : undefined}
                      step="0.01"
                      placeholder={discountType === 'PERCENT' ? '10' : '5.00'}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="input text-xs py-1.5 flex-1"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Totals + Pay */}
          <div className="border-t border-stone-200 px-4 py-4 space-y-2">
            <div className="flex justify-between text-sm text-stone-500">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Discount {discountType === 'PERCENT' ? `(${discountValue}%)` : ''}</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-stone-500">
              <span>Tax ({(TAX_RATE * 100).toFixed(1)}%)</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-100">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => { if (cart.length === 0) { toast.error('Cart is empty'); return; } setShowPayment(true); }}
              disabled={cart.length === 0}
              className="btn-primary w-full py-3 mt-2 text-base"
            >
              <CreditCard size={18} /> Pay ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={addToCart} />}
      {showPayment && (
        <PaymentModal
          total={total}
          method={paymentMethod}
          onMethodChange={setPaymentMethod}
          onConfirm={handlePayment}
          onClose={() => setShowPayment(false)}
          isProcessing={isProcessing}
        />
      )}
      {completedOrder && (
        <ReceiptModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onNewOrder={() => setCompletedOrder(null)}
        />
      )}
    </div>
  );
}
