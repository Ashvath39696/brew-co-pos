'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { ShopSettings } from '@/types';
import { getShopSettings, saveShopSettings } from '@/lib/store';
import { checkLicense, expectedKeyForMonth } from '@/lib/license';
import { Save, KeyRound, Store, Copy } from 'lucide-react';

const CURRENCY_OPTIONS = ['₹', '$', '€', '£', 'AED'];

export default function SettingsPage() {
  const [form, setForm] = useState<ShopSettings>({
    shopName: '', gstin: '', address: '', phone: '',
    currency: '₹', taxLabel: 'CGST/SGST', licenseKey: '',
  });
  const [licenseStatus, setLicenseStatus] = useState<'valid'|'grace'|'expired'|''>('');
  const [devKey, setDevKey] = useState('');

  useEffect(() => {
    setForm(getShopSettings());
  }, []);

  useEffect(() => {
    if (!form.licenseKey) { setLicenseStatus(''); return; }
    checkLicense(form.licenseKey).then(setLicenseStatus);
  }, [form.licenseKey]);

  // For the developer: show what the current month's expected key is
  useEffect(() => {
    const now = new Date();
    const ym  = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}`;
    expectedKeyForMonth(ym).then(setDevKey);
  }, []);

  const handleSave = () => {
    if (form.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstin)) {
      toast.error('Invalid GSTIN format (should be 15 chars, e.g. 29ABCDE1234F1Z5)');
      return;
    }
    saveShopSettings(form);
    toast.success('Settings saved');
  };

  const statusColor = licenseStatus === 'valid' ? 'text-green-700 bg-green-50 border-green-200'
    : licenseStatus === 'grace' ? 'text-amber-700 bg-amber-50 border-amber-200'
    : licenseStatus === 'expired' ? 'text-red-700 bg-red-50 border-red-200'
    : 'text-stone-400';

  const statusLabel = licenseStatus === 'valid' ? '✓ Valid for this month'
    : licenseStatus === 'grace' ? '⚠ Grace period — please renew'
    : licenseStatus === 'expired' ? '✗ Expired — contact your service provider'
    : '';

  return (
    <div className="flex flex-col h-screen">
      <Navbar />

      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
          <p className="text-sm text-stone-500">Shop information and billing configuration</p>
        </div>

        {/* Shop Info */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-stone-800 mb-1">
            <Store size={16} /> Shop Information
          </div>

          <div>
            <label className="label">Shop Name</label>
            <input value={form.shopName} onChange={e => setForm({...form, shopName: e.target.value})}
              className="input" placeholder="Brew & Co." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="input" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="label">Currency Symbol</label>
              <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}
                className="input">
                {CURRENCY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Address (shown on receipt)</label>
            <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})}
              className="input resize-none" rows={2} placeholder="123 Main Street, City, State - 560001" />
          </div>
        </div>

        {/* GST Settings */}
        <div className="card p-5 space-y-4">
          <div className="font-semibold text-stone-800 mb-1">GST / Tax Settings</div>

          <div>
            <label className="label">GSTIN (15-digit GST Identification Number)</label>
            <input value={form.gstin}
              onChange={e => setForm({...form, gstin: e.target.value.toUpperCase()})}
              className="input font-mono tracking-wider uppercase"
              placeholder="29ABCDE1234F1Z5" maxLength={15} />
            <p className="text-xs text-stone-400 mt-1">Leave blank if not registered. Printed on receipts when filled.</p>
          </div>

          <div>
            <label className="label">Tax Type</label>
            <select value={form.taxLabel} onChange={e => setForm({...form, taxLabel: e.target.value as ShopSettings['taxLabel']})}
              className="input">
              <option value="CGST/SGST">CGST + SGST (intra-state — same state as customer)</option>
              <option value="IGST">IGST (inter-state — different state)</option>
            </select>
            <p className="text-xs text-stone-400 mt-1">
              Most small restaurants use CGST+SGST. Each is 50% of the total GST rate.
            </p>
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
            <div className="font-semibold">GST rate per item</div>
            <div>Go to <strong>Menu</strong> → Edit any item → set its GST rate (0%, 5%, 12%, or 18%).</div>
            <div>Typical rates for a coffee shop: Coffee/Tea/Pastries = 5%, Cold beverages/Snacks = 12%.</div>
          </div>
        </div>

        {/* License Key */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-stone-800 mb-1">
            <KeyRound size={16} /> License Key
          </div>

          <div>
            <label className="label">Monthly License Key</label>
            <input value={form.licenseKey}
              onChange={e => setForm({...form, licenseKey: e.target.value.toUpperCase()})}
              className="input font-mono tracking-wider uppercase"
              placeholder="Enter key provided by your service provider" />
            {licenseStatus && (
              <div className={`mt-2 rounded-lg border px-3 py-2 text-xs font-medium ${statusColor}`}>
                {statusLabel}
              </div>
            )}
          </div>

          {/* Developer section — shows current expected key so you can copy/send it */}
          <details className="text-xs text-stone-400 border border-dashed border-stone-200 rounded-lg p-3">
            <summary className="cursor-pointer font-medium text-stone-500 select-none">
              Developer: generate this month&apos;s key
            </summary>
            <div className="mt-3 space-y-2">
              <p>This month&apos;s valid key (send this to your client when they pay):</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-stone-100 px-3 py-2 rounded font-mono text-sm text-stone-800 select-all">
                  {devKey || 'Computing…'}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(devKey); toast.success('Copied!'); }}
                  className="p-2 rounded-lg hover:bg-stone-100 text-stone-500"
                  title="Copy key"
                >
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-amber-600">
                ⚠ Keep <code>APP_SECRET</code> in <code>src/lib/license.ts</code> private and change it before deploying.
              </p>
            </div>
          </details>
        </div>

        <button onClick={handleSave} className="btn-primary w-full py-3 text-base">
          <Save size={18} /> Save Settings
        </button>
      </div>
    </div>
  );
}
