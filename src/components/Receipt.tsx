'use client';

import { Order } from '@/types';
import { getShopSettings } from '@/lib/store';
import { format } from 'date-fns';

interface ReceiptProps { order: Order }

export function Receipt({ order }: ReceiptProps) {
  const s    = getShopSettings();
  const cgst = order.taxAmount / 2;
  const sgst = order.taxAmount / 2;
  const cur  = s.currency;

  return (
    <div className="font-mono text-xs text-stone-900 w-[280px]">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="text-base font-bold">{s.shopName.toUpperCase()}</div>
        {s.address && <div>{s.address}</div>}
        {s.phone   && <div>Tel: {s.phone}</div>}
        {s.gstin   && <div className="text-stone-500">GSTIN: {s.gstin}</div>}
        <div className="border-t border-dashed border-stone-400 mt-2 pt-2">
          <span className="font-semibold">{order.orderNumber}</span>
        </div>
        <div>{format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}</div>
      </div>

      {/* Items */}
      <div className="border-t border-dashed border-stone-400 pt-2 mb-2">
        {order.items.map((item) => {
          const unitPrice = item.basePrice + item.variantPrice + item.addonsPrice;
          return (
            <div key={item.id} className="mb-2">
              <div className="flex justify-between font-semibold">
                <span className="flex-1 pr-2">
                  {item.name}{item.variant ? ` (${item.variant})` : ''}
                </span>
                <span>{cur}{item.itemTotal.toFixed(2)}</span>
              </div>
              {(item.addons && (item.addons as { name: string; price: number }[]).length > 0) && (
                <div className="pl-2 text-stone-500">
                  {(item.addons as { name: string; price: number }[]).map((a) => (
                    <div key={a.name}>+ {a.name} (+{cur}{a.price.toFixed(2)})</div>
                  ))}
                </div>
              )}
              <div className="text-stone-500 pl-2">
                {item.quantity} × {cur}{unitPrice.toFixed(2)}
                {item.gstRate > 0 && <span className="ml-1 text-stone-400">[GST {(item.gstRate*100).toFixed(0)}%]</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-dashed border-stone-400 pt-2 space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal (excl. GST)</span>
          <span>{cur}{order.subtotal.toFixed(2)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Discount{order.discountType === 'PERCENT' ? ` (${order.discountValue}%)` : ''}</span>
            <span>-{cur}{order.discountAmount.toFixed(2)}</span>
          </div>
        )}
        {order.taxAmount > 0 && (
          <>
            {s.taxLabel === 'IGST' ? (
              <div className="flex justify-between text-stone-600">
                <span>IGST</span><span>{cur}{order.taxAmount.toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-stone-600">
                  <span>CGST</span><span>{cur}{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>SGST</span><span>{cur}{sgst.toFixed(2)}</span>
                </div>
              </>
            )}
          </>
        )}
        <div className="flex justify-between font-bold text-sm border-t border-stone-400 pt-1 mt-1">
          <span>TOTAL</span>
          <span>{cur}{order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="border-t border-dashed border-stone-400 mt-2 pt-2">
        <div className="flex justify-between">
          <span>Payment</span><span className="font-semibold">{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span>Status</span><span className="font-semibold text-green-700">PAID ✓</span>
        </div>
      </div>

      {order.note && (
        <div className="border-t border-dashed border-stone-400 mt-2 pt-2 italic text-stone-500">
          Note: {order.note}
        </div>
      )}

      <div className="border-t border-dashed border-stone-400 mt-3 pt-2 text-center text-stone-500">
        <div>Thank you for visiting!</div>
        <div>See you again soon ☕</div>
      </div>
    </div>
  );
}

export function printReceipt(order: Order) {
  const s    = getShopSettings();
  const cgst = order.taxAmount / 2;
  const sgst = order.taxAmount / 2;
  const cur  = s.currency;

  const win = window.open('', '_blank', 'width=420,height=720');
  if (!win) return;

  const items = order.items.map((item) => {
    const unitPrice = item.basePrice + item.variantPrice + item.addonsPrice;
    const addonsHtml = item.addons
      ? (item.addons as { name: string; price: number }[])
          .map((a) => `<div style="padding-left:12px;color:#666">+ ${a.name} (+${cur}${a.price.toFixed(2)})</div>`)
          .join('')
      : '';
    return `
      <div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-weight:600">
          <span>${item.name}${item.variant ? ` (${item.variant})` : ''}</span>
          <span>${cur}${item.itemTotal.toFixed(2)}</span>
        </div>
        ${addonsHtml}
        <div style="color:#666;padding-left:12px">${item.quantity} × ${cur}${unitPrice.toFixed(2)}${item.gstRate > 0 ? ` [GST ${(item.gstRate*100).toFixed(0)}%]` : ''}</div>
      </div>`;
  }).join('');

  const discountRow = order.discountAmount > 0
    ? `<div style="display:flex;justify-content:space-between;color:green">
         <span>Discount${order.discountType === 'PERCENT' ? ` (${order.discountValue}%)` : ''}</span>
         <span>-${cur}${order.discountAmount.toFixed(2)}</span>
       </div>`
    : '';

  const gstRows = order.taxAmount > 0
    ? s.taxLabel === 'IGST'
      ? `<div style="display:flex;justify-content:space-between"><span>IGST</span><span>${cur}${order.taxAmount.toFixed(2)}</span></div>`
      : `<div style="display:flex;justify-content:space-between"><span>CGST</span><span>${cur}${cgst.toFixed(2)}</span></div>
         <div style="display:flex;justify-content:space-between"><span>SGST</span><span>${cur}${sgst.toFixed(2)}</span></div>`
    : '';

  const noteSection = order.note
    ? `<div style="border-top:1px dashed #999;margin-top:8px;padding-top:8px;color:#666;font-style:italic">Note: ${order.note}</div>`
    : '';

  win.document.write(`<!DOCTYPE html><html><head><title>Receipt ${order.orderNumber}</title>
    <style>
      body { font-family:'Courier New',monospace; font-size:12px; width:280px; margin:0 auto; padding:16px; }
      .divider { border-top:1px dashed #999; margin:8px 0; }
      .row { display:flex; justify-content:space-between; }
      .center { text-align:center; }
      .bold { font-weight:700; }
      .total-row { font-size:14px; font-weight:700; }
      .small { color:#666; font-size:11px; }
    </style>
  </head><body>
    <div class="center bold" style="font-size:15px">${s.shopName.toUpperCase()}</div>
    ${s.address ? `<div class="center">${s.address}</div>` : ''}
    ${s.phone   ? `<div class="center">Tel: ${s.phone}</div>` : ''}
    ${s.gstin   ? `<div class="center small">GSTIN: ${s.gstin}</div>` : ''}
    <div class="divider"></div>
    <div class="center bold">${order.orderNumber}</div>
    <div class="center">${new Date(order.createdAt).toLocaleString()}</div>
    <div class="divider"></div>
    ${items}
    <div class="divider"></div>
    <div class="row"><span>Subtotal (excl. GST)</span><span>${cur}${order.subtotal.toFixed(2)}</span></div>
    ${discountRow}
    ${gstRows}
    <div class="divider"></div>
    <div class="row total-row"><span>TOTAL</span><span>${cur}${order.total.toFixed(2)}</span></div>
    <div class="divider"></div>
    <div class="row"><span>Payment</span><span class="bold">${order.paymentMethod}</span></div>
    <div class="row"><span>Status</span><span class="bold" style="color:green">PAID ✓</span></div>
    ${noteSection}
    <div class="divider"></div>
    <div class="center small">Thank you for visiting!<br>See you again soon ☕</div>
  </body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); }, 300);
}
