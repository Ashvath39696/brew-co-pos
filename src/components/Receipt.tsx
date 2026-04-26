'use client';

import { Order } from '@/types';
import { format } from 'date-fns';

interface ReceiptProps {
  order: Order;
  /** When true, renders in print-visible wrapper */
  forPrint?: boolean;
}

export function Receipt({ order, forPrint }: ReceiptProps) {
  const content = (
    <div className="font-mono text-xs text-stone-900 w-[280px]">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="text-base font-bold">BREW &amp; CO.</div>
        <div>123 Coffee Lane, Bean City</div>
        <div>Tel: (555) 012-3456</div>
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
                  {item.name}
                  {item.variant ? ` (${item.variant})` : ''}
                </span>
                <span>${item.itemTotal.toFixed(2)}</span>
              </div>
              {(item.addons && (item.addons as { name: string; price: number }[]).length > 0) && (
                <div className="pl-2 text-stone-500">
                  {(item.addons as { name: string; price: number }[]).map((a) => (
                    <div key={a.name}>+ {a.name} (+${a.price.toFixed(2)})</div>
                  ))}
                </div>
              )}
              <div className="text-stone-500 pl-2">
                {item.quantity} × ${unitPrice.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-dashed border-stone-400 pt-2 space-y-0.5">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>
              Discount
              {order.discountType === 'PERCENT' ? ` (${order.discountValue}%)` : ''}
            </span>
            <span>-${order.discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax ({(order.taxRate * 100).toFixed(1)}%)</span>
          <span>${order.taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-sm border-t border-stone-400 pt-1 mt-1">
          <span>TOTAL</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment method */}
      <div className="border-t border-dashed border-stone-400 mt-2 pt-2">
        <div className="flex justify-between">
          <span>Payment</span>
          <span className="font-semibold">{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span>Status</span>
          <span className="font-semibold text-green-700">PAID ✓</span>
        </div>
      </div>

      {/* Note */}
      {order.note && (
        <div className="border-t border-dashed border-stone-400 mt-2 pt-2 italic text-stone-500">
          Note: {order.note}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-dashed border-stone-400 mt-3 pt-2 text-center text-stone-500">
        <div>Thank you for visiting!</div>
        <div>See you again soon ☕</div>
        <div className="mt-1">www.brewandco.coffee</div>
      </div>
    </div>
  );

  if (forPrint) {
    return (
      <div id="print-receipt" className="p-4">
        {content}
      </div>
    );
  }

  return content;
}

export function printReceipt(order: Order) {
  const win = window.open('', '_blank', 'width=420,height=680');
  if (!win) return;

  const items = order.items
    .map((item) => {
      const unitPrice = item.basePrice + item.variantPrice + item.addonsPrice;
      const addonsHtml = item.addons
        ? (item.addons as { name: string; price: number }[])
            .map((a) => `<div style="padding-left:12px;color:#666">+ ${a.name} (+$${a.price.toFixed(2)})</div>`)
            .join('')
        : '';
      return `
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;font-weight:600">
            <span>${item.name}${item.variant ? ` (${item.variant})` : ''}</span>
            <span>$${item.itemTotal.toFixed(2)}</span>
          </div>
          ${addonsHtml}
          <div style="color:#666;padding-left:12px">${item.quantity} × $${unitPrice.toFixed(2)}</div>
        </div>`;
    })
    .join('');

  const discountRow =
    order.discountAmount > 0
      ? `<div style="display:flex;justify-content:space-between;color:green">
           <span>Discount${order.discountType === 'PERCENT' ? ` (${order.discountValue}%)` : ''}</span>
           <span>-$${order.discountAmount.toFixed(2)}</span>
         </div>`
      : '';

  const noteSection = order.note
    ? `<div style="border-top:1px dashed #999;margin-top:8px;padding-top:8px;color:#666;font-style:italic">Note: ${order.note}</div>`
    : '';

  win.document.write(`<!DOCTYPE html><html><head><title>Receipt ${order.orderNumber}</title>
    <style>
      body { font-family: 'Courier New', monospace; font-size: 12px; width: 280px; margin: 0 auto; padding: 16px; }
      .divider { border-top: 1px dashed #999; margin: 8px 0; }
      .row { display: flex; justify-content: space-between; }
      .center { text-align: center; }
      .bold { font-weight: 700; }
      .total-row { font-size: 14px; font-weight: 700; }
    </style>
  </head><body>
    <div class="center bold" style="font-size:15px">BREW &amp; CO.</div>
    <div class="center">123 Coffee Lane, Bean City</div>
    <div class="center">Tel: (555) 012-3456</div>
    <div class="divider"></div>
    <div class="center bold">${order.orderNumber}</div>
    <div class="center">${new Date(order.createdAt).toLocaleString()}</div>
    <div class="divider"></div>
    ${items}
    <div class="divider"></div>
    <div class="row"><span>Subtotal</span><span>$${order.subtotal.toFixed(2)}</span></div>
    ${discountRow}
    <div class="row"><span>Tax (${(order.taxRate * 100).toFixed(1)}%)</span><span>$${order.taxAmount.toFixed(2)}</span></div>
    <div class="divider"></div>
    <div class="row total-row"><span>TOTAL</span><span>$${order.total.toFixed(2)}</span></div>
    <div class="divider"></div>
    <div class="row"><span>Payment</span><span class="bold">${order.paymentMethod}</span></div>
    <div class="row"><span>Status</span><span class="bold" style="color:green">PAID ✓</span></div>
    ${noteSection}
    <div class="divider"></div>
    <div class="center" style="color:#666">Thank you for visiting!<br>See you again soon ☕<br>www.brewandco.coffee</div>
  </body></html>`);
  win.document.close();
  setTimeout(() => { win.print(); }, 300);
}
