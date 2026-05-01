'use client';

import { useEffect, useState } from 'react';
import { getShopSettings } from '@/lib/store';
import { checkLicense } from '@/lib/license';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';

export function LicenseBanner() {
  const [status, setStatus] = useState<'valid'|'grace'|'expired'|null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const { licenseKey } = getShopSettings();
    checkLicense(licenseKey).then(setStatus);
  }, []);

  if (!status || status === 'valid' || dismissed) return null;

  const isExpired = status === 'expired';
  const bg  = isExpired ? 'bg-red-600' : 'bg-amber-500';
  const msg = isExpired
    ? 'License expired. Contact your service provider to renew.'
    : 'License grace period — please renew your subscription soon.';

  return (
    <div className={`${bg} text-white text-sm px-4 py-2 flex items-center justify-between gap-3`}>
      <div className="flex items-center gap-2">
        <AlertTriangle size={15} className="shrink-0" />
        <span>{msg}</span>
        <Link href="/settings" className="underline font-semibold whitespace-nowrap">
          Enter key →
        </Link>
      </div>
      {!isExpired && (
        <button onClick={() => setDismissed(true)} className="text-white/80 hover:text-white shrink-0">
          <X size={15} />
        </button>
      )}
    </div>
  );
}
