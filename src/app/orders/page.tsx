'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Receipt, printReceipt } from '@/components/Receipt';
import { PageLoader } from '@/components/LoadingSpinner';
import { Order, PaymentMethod } from '@/types';
import { ensureSeeded, getOrders } from '@/lib/store';
import { format } from 'date-fns';
import { Search, Printer, X, Filter, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

function PaymentBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    CASH: 'bg-green-100 text-green-800',
    CARD: 'bg-blue-100 text-blue-800',
    UPI: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[method] ?? 'bg-stone-100 text-stone-700'}`}>{method}</span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError('');
    try {
      ensureSeeded();
      setOrders(getOrders({
        paymentMethod: paymentFilter || undefined,
        startDate:     startDate    || undefined,
        endDate:       endDate      || undefined,
      }));
    } catch {
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, paymentFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = searchQuery
    ? orders.filter((o) => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    : orders;

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Order History</h1>
            <p className="text-sm text-stone-500">All paid orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Filter size={15} />
              <span className="font-medium">Filters</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500">From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input py-1.5 text-sm w-36" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-stone-500">To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input py-1.5 text-sm w-36" />
            </div>

            <div className="relative">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value as PaymentMethod | '')}
                className="input py-1.5 text-sm pr-8 w-36 appearance-none"
              >
                <option value="">All Methods</option>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>

            {(startDate || endDate || paymentFilter) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setPaymentFilter(''); }}
                className="text-xs text-stone-400 hover:text-red-500 transition"
              >
                Clear filters
              </button>
            )}

            <div className="ml-auto relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search order #…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9 py-1.5 text-sm w-48"
              />
            </div>
          </div>
        </div>

        {/* Summary row */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center gap-6 text-sm text-stone-500 px-1">
            <span><span className="font-semibold text-stone-800">{filtered.length}</span> orders</span>
            <span>Revenue: <span className="font-semibold text-amber-700">${totalRevenue.toFixed(2)}</span></span>
          </div>
        )}

        {/* Error */}
        {error && <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>}

        {/* Table */}
        {loading ? (
          <PageLoader />
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-stone-400">
            <span className="text-5xl mb-3">📋</span>
            <p className="text-sm">No orders found</p>
            {(startDate || endDate || paymentFilter) && (
              <p className="text-xs mt-1">Try adjusting the filters</p>
            )}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 text-stone-500 uppercase text-xs border-b border-stone-200">
                  <tr>
                    <th className="text-left px-5 py-3">Order #</th>
                    <th className="text-left px-5 py-3">Date &amp; Time</th>
                    <th className="text-left px-5 py-3">Items</th>
                    <th className="text-left px-5 py-3">Method</th>
                    <th className="text-right px-5 py-3">Subtotal</th>
                    <th className="text-right px-5 py-3">Total</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-5 py-3 font-mono font-semibold text-stone-800 whitespace-nowrap">{order.orderNumber}</td>
                      <td className="px-5 py-3 text-stone-500 whitespace-nowrap">{format(new Date(order.createdAt), 'MMM d, yyyy · h:mm a')}</td>
                      <td className="px-5 py-3 text-stone-500">
                        <span className="font-medium text-stone-700">{order.items.length}</span> item{order.items.length !== 1 ? 's' : ''}
                        <div className="text-xs text-stone-400 max-w-[180px] truncate">
                          {order.items.map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ''}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-5 py-3"><PaymentBadge method={order.paymentMethod} /></td>
                      <td className="px-5 py-3 text-right text-stone-500">${order.subtotal.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right font-semibold">${order.total.toFixed(2)}</td>
                      <td className="px-5 py-3">
                        <span className="badge-paid">Paid ✓</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="text-amber-600 hover:text-amber-800 text-xs font-medium whitespace-nowrap"
                          >
                            View
                          </button>
                          <button
                            onClick={() => printReceipt(order)}
                            className="text-stone-400 hover:text-stone-700 transition"
                            title="Print receipt"
                          >
                            <Printer size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-stone-900">Receipt</h3>
              <div className="flex gap-2">
                <button onClick={() => printReceipt(viewingOrder)} className="btn-secondary text-xs px-3 py-1.5">
                  <Printer size={13} /> Print
                </button>
                <button onClick={() => setViewingOrder(null)} className="text-stone-400 hover:text-stone-700">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-5 flex justify-center">
              <Receipt order={viewingOrder} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
