'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { PageLoader } from '@/components/LoadingSpinner';
import { MenuItem, Category, Addon, Variant } from '@/types';
import { ensureSeeded, getMenuItems, getCategories, createMenuItem, updateMenuItem, deleteMenuItem } from '@/lib/store';
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import clsx from 'clsx';

const PRESET_ADDONS: Addon[] = [
  { name: 'Extra Shot', price: 0.75 },
  { name: 'Oat Milk', price: 0.6 },
  { name: 'Almond Milk', price: 0.6 },
  { name: 'Soy Milk', price: 0.6 },
  { name: 'Whipped Cream', price: 0.5 },
  { name: 'Vanilla Syrup', price: 0.5 },
  { name: 'Caramel Syrup', price: 0.5 },
];

const SIZE_VARIANTS: Variant[] = [
  { name: 'Size', options: [{ label: 'Small', priceModifier: -0.5 }, { label: 'Medium', priceModifier: 0 }, { label: 'Large', priceModifier: 0.75 }] },
];

interface FormState {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  available: boolean;
  emoji: string;
  hasSizeVariants: boolean;
  selectedAddons: string[];
}

const emptyForm: FormState = {
  name: '', description: '', price: '', categoryId: '',
  available: true, emoji: '', hasSizeVariants: false, selectedAddons: [],
};

function ItemFormModal({
  categories, editItem, onClose, onSaved,
}: {
  categories: Category[];
  editItem: MenuItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = Boolean(editItem);

  const [form, setForm] = useState<FormState>(() => {
    if (!editItem) return { ...emptyForm, categoryId: String(categories[0]?.id ?? '') };
    const existingAddons = (editItem.addons as Addon[] | null) ?? [];
    const existingVariants = (editItem.variants as Variant[] | null) ?? [];
    return {
      name: editItem.name,
      description: editItem.description ?? '',
      price: String(editItem.price),
      categoryId: String(editItem.categoryId),
      available: editItem.available,
      emoji: editItem.emoji ?? '',
      hasSizeVariants: existingVariants.length > 0,
      selectedAddons: existingAddons.map((a) => a.name),
    };
  });

  const [saving, setSaving] = useState(false);

  const toggleAddon = (name: string) =>
    setForm((f) => ({
      ...f,
      selectedAddons: f.selectedAddons.includes(name)
        ? f.selectedAddons.filter((a) => a !== name)
        : [...f.selectedAddons, name],
    }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.categoryId) {
      toast.error('Name, price, and category are required');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        categoryId: Number(form.categoryId),
        available: form.available,
        emoji: form.emoji.trim() || null,
        variants: form.hasSizeVariants ? SIZE_VARIANTS : null,
        addons: form.selectedAddons.length
          ? PRESET_ADDONS.filter((a) => form.selectedAddons.includes(a.name))
          : null,
      };

      if (isEdit) {
        updateMenuItem(editItem!.id, body);
      } else {
        createMenuItem(body);
      }

      toast.success(isEdit ? 'Item updated' : 'Item created');
      onSaved();
      onClose();
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold">{isEdit ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700"><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name + Emoji */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="label">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="e.g. Cappuccino" required />
            </div>
            <div>
              <label className="label">Emoji</label>
              <input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} className="input text-center text-xl" placeholder="☕" maxLength={2} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input resize-none" rows={2} placeholder="Short description…" />
          </div>

          {/* Price + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Price (USD) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input type="number" step="0.01" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input pl-7" placeholder="4.50" required />
              </div>
            </div>
            <div>
              <label className="label">Category *</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input" required>
                <option value="">Select…</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* Variants */}
          <div className="rounded-lg border border-stone-200 p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={clsx('w-10 h-6 rounded-full transition-colors relative', form.hasSizeVariants ? 'bg-amber-500' : 'bg-stone-300')}>
                <div className={clsx('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', form.hasSizeVariants ? 'translate-x-4' : 'translate-x-0.5')} />
              </div>
              <input type="checkbox" className="sr-only" checked={form.hasSizeVariants} onChange={(e) => setForm({ ...form, hasSizeVariants: e.target.checked })} />
              <div>
                <div className="font-medium text-sm">Size Variants</div>
                <div className="text-xs text-stone-400">Small (-$0.50) · Medium · Large (+$0.75)</div>
              </div>
            </label>
          </div>

          {/* Add-ons */}
          <div>
            <label className="label">Available Add-ons</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_ADDONS.map((addon) => {
                const checked = form.selectedAddons.includes(addon.name);
                return (
                  <label key={addon.name} className="flex items-center gap-2 cursor-pointer text-sm">
                    <div className={clsx('w-4 h-4 rounded border-2 flex items-center justify-center transition shrink-0',
                      checked ? 'bg-amber-500 border-amber-500' : 'border-stone-300')}>
                      {checked && <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-white" fill="none"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleAddon(addon.name)} />
                    <span className="text-stone-700">{addon.name}</span>
                    <span className="text-stone-400 text-xs">+${addon.price.toFixed(2)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Available */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={clsx('w-10 h-6 rounded-full transition-colors relative', form.available ? 'bg-green-500' : 'bg-stone-300')}>
                <div className={clsx('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform', form.available ? 'translate-x-4' : 'translate-x-0.5')} />
              </div>
              <input type="checkbox" className="sr-only" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
              <span className="text-sm font-medium text-stone-700">{form.available ? 'In Stock' : 'Out of Stock'}</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    try {
      ensureSeeded();
      setMenuItems(getMenuItems());
      setCategories(getCategories());
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleAvailable = (item: MenuItem) => {
    try {
      updateMenuItem(item.id, { available: !item.available });
      setMenuItems((prev) => prev.map((i) => i.id === item.id ? { ...i, available: !i.available } : i));
      toast.success(item.available ? 'Marked as out of stock' : 'Marked as in stock');
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const deleteItem = (id: number) => {
    setDeletingId(id);
    try {
      deleteMenuItem(id);
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category.slug !== selectedCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Menu Management</h1>
            <p className="text-sm text-stone-500">{menuItems.length} items across {categories.length} categories</p>
          </div>
          <button onClick={() => { setEditItem(null); setShowForm(true); }} className="btn-primary">
            <Plus size={16} /> Add Item
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 flex-wrap">
            <button onClick={() => setSelectedCategory('all')}
              className={clsx('rounded-full px-4 py-1.5 text-sm font-medium transition', selectedCategory === 'all' ? 'bg-amber-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50')}>
              All ({menuItems.length})
            </button>
            {categories.map((cat) => {
              const count = menuItems.filter((i) => i.category.slug === cat.slug).length;
              return (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)}
                  className={clsx('rounded-full px-4 py-1.5 text-sm font-medium transition', selectedCategory === cat.slug ? 'bg-amber-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50')}>
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
          <div className="ml-auto relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input type="text" placeholder="Search items…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="input pl-9 py-1.5 text-sm w-48" />
          </div>
        </div>

        {loading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-stone-400">
            <span className="text-5xl mb-3">🍽️</span>
            <p className="text-sm">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className={clsx('card p-4 flex flex-col gap-3', !item.available && 'opacity-60')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.emoji ?? '☕'}</span>
                    <div>
                      <div className="font-semibold text-stone-900 leading-tight">{item.name}</div>
                      <div className="text-xs text-stone-400">{item.category.name}</div>
                    </div>
                  </div>
                  <span className="text-amber-700 font-bold text-sm shrink-0">${item.price.toFixed(2)}</span>
                </div>

                {item.description && (
                  <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>
                )}

                <div className="flex flex-wrap gap-1">
                  {(item.variants as Variant[] | null)?.length ? (
                    <span className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">Sizes</span>
                  ) : null}
                  {(item.addons as Addon[] | null)?.length ? (
                    <span className="text-xs bg-violet-50 text-violet-700 rounded-full px-2 py-0.5">{(item.addons as Addon[]).length} add-ons</span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                  {/* Availability toggle */}
                  <button onClick={() => toggleAvailable(item)} className="flex items-center gap-1.5 text-xs font-medium transition">
                    {item.available ? (
                      <><ToggleRight size={18} className="text-green-500" /><span className="text-green-700">In Stock</span></>
                    ) : (
                      <><ToggleLeft size={18} className="text-stone-400" /><span className="text-stone-500">Out of Stock</span></>
                    )}
                  </button>
                  {/* Actions */}
                  <div className="flex gap-1">
                    <button onClick={() => { setEditItem(item); setShowForm(true); }} className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition">
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${item.name}"?`)) deleteItem(item.id); }}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <ItemFormModal
          categories={categories}
          editItem={editItem}
          onClose={() => { setShowForm(false); setEditItem(null); }}
          onSaved={fetchData}
        />
      )}
    </div>
  );
}
