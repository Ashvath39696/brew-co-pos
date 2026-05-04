'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { PageLoader } from '@/components/LoadingSpinner';
import { Receipt } from '@/components/Receipt';
import { printReceipt } from '@/components/Receipt';
import { DashboardStats, Order } from '@/types';
import { ensureSeeded, getDashboardStats, getShopSettings } from '@/lib/store';
import { format } from 'date-fns';
import { TrendingUp, ShoppingBag, CreditCard, Package, RefreshCw, Printer, X } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-stone-500">{label}</p>
        <p className="text-2xl font-bold text-stone-900">{value}</p>
        {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function PaymentBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    CASH: 'bg-green-100 text-green-800',
    CARD: 'bg-blue-100 text-blue-800',
    UPI: 'bg-purple-100 text-purple-800',
  };
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[method] ?? 'bg-stone-100 text-stone-700'}`}>{method}</span>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [currency, setCurrency] = useState('₹');

  const fetchStats = () => {
    setLoading(true);
    setError('');
    try {
      ensureSeeded();
      setStats(getDashboardStats());
      setCurrency(getShopSettings().currency);
    } catch {
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const maxQty = stats?.topItems[0]?.qty ?? 1;
  const maxMethodRevenue = Math.max(...(stats?.revenueByMethod.map((r) => r.amount) ?? [1]));

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
            <p className="text-sm text-stone-500">{format(new Date(), 'EEEE, MMMM d yyyy')} · Today&apos;s summary</p>
          </div>
          <button onClick={fetchStats} className="btn-secondary gap-2" disabled={loading}>
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
        )}

        {loading && !stats ? (
          <PageLoader />
        ) : stats ? (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={TrendingUp} label="Today's Revenue" value={`${currency}${stats.todayRevenue.toFixed(2)}`} sub="All paid orders" color="bg-amber-600" />
              <StatCard icon={ShoppingBag} label="Today's Orders" value={String(stats.todayOrders)} sub="Completed" color="bg-blue-600" />
              <StatCard icon={CreditCard} label="Avg Order Value" value={`${currency}${stats.avgOrderValue.toFixed(2)}`} sub="Per order" color="bg-violet-600" />
              <StatCard icon={Package} label="Items Sold" value={String(stats.totalItemsSold)} sub="Units today" color="bg-emerald-600" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Items */}
              <div className="card p-5">
                <h2 className="font-semibold text-stone-800 mb-4">Top Selling Items Today</h2>
                {stats.topItems.length === 0 ? (
                  <div className="text-sm text-stone-400 py-8 text-center">No sales yet today</div>
                ) : (
                  <div className="space-y-3">
                    {stats.topItems.map((item) => (
                      <div key={item.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-stone-800">{item.name}</span>
                          <span className="text-stone-500">{item.qty} sold · <span className="text-amber-700 font-medium">{currency}{item.revenue.toFixed(2)}</span></span>
                        </div>
                        <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${(item.qty / maxQty) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Revenue by method */}
              <div className="card p-5">
                <h2 className="font-semibold text-stone-800 mb-4">Revenue by Payment Method</h2>
                {stats.revenueByMethod.every((r) => r.amount === 0) ? (
                  <div className="text-sm text-stone-400 py-8 text-center">No sales yet today</div>
                ) : (
                  <div className="space-y-4">
                    {stats.revenueByMethod.map(({ method, amount }) => {
                      const colors: Record<string, string> = { CASH: 'bg-green-500', CARD: 'bg-blue-500', UPI: 'bg-violet-500' };
                      return (
                        <div key={method}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-stone-800">{method}</span>
                            <span className="font-semibold text-stone-700">{currency}{amount.toFixed(2)}</span>
                          </div>
                          <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${colors[method] ?? 'bg-stone-500'} transition-all duration-500`}
                              style={{ width: `${maxMethodRevenue > 0 ? (amount / maxMethodRevenue) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-800">Recent Orders</h2>
              </div>
              {stats.recentOrders.length === 0 ? (
                <div className="py-12 text-center text-sm text-stone-400">No orders yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50 text-stone-500 uppercase text-xs">
                      <tr>
                        <th className="text-left px-5 py-3">Order</th>
                        <th className="text-left px-5 py-3">Date</th>
                        <th className="text-left px-5 py-3">Items</th>
                        <th className="text-left px-5 py-3">Method</th>
                        <th className="text-right px-5 py-3">Total</th>
                        <th className="px-5 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {stats.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                          <td className="px-5 py-3 font-mono font-medium">{order.orderNumber}</td>
                          <td className="px-5 py-3 text-stone-500">{format(new Date(order.createdAt), 'MMM d, h:mm a')}</td>
                          <td className="px-5 py-3 text-stone-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</td>
                          <td className="px-5 py-3"><PaymentBadge method={order.paymentMethod} /></td>
                          <td className="px-5 py-3 text-right font-semibold">{currency}{order.total.toFixed(2)}</td>
                          <td className="px-5 py-3">
                            <button onClick={() => setViewingOrder(order)} className="text-amber-600 hover:text-amber-800 text-xs font-medium">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* Order detail modal */}
      {viewingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Receipt</h3>
              <div className="flex gap-2">
                <button onClick={() => printReceipt(viewingOrder)} className="btn-secondary text-xs px-3 py-1.5">
                  <Printer size={13} /> Print
                </button>
                <button onClick={() => setViewingOrder(null)} className="text-stone-400 hover:text-stone-700">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <Receipt order={viewingOrder} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
