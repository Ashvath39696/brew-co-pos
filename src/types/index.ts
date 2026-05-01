export interface VariantOption {
  label: string;
  priceModifier: number;
}

export interface Variant {
  name: string;
  options: VariantOption[];
}

export interface Addon {
  name: string;
  price: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  categoryId: number;
  category: Category;
  available: boolean;
  variants?: Variant[] | null;
  addons?: Addon[] | null;
  emoji?: string | null;
  gstRate: number; // 0, 0.05, 0.12, 0.18
}

export interface CartItem {
  cartId: string;
  menuItemId: number;
  name: string;
  basePrice: number;
  quantity: number;
  variant?: string;
  variantPrice: number;
  selectedAddons: Addon[];
  addonsPrice: number;
  itemTotal: number;
  gstRate: number;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI';
export type DiscountType = 'PERCENT' | 'FIXED';
export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export interface OrderItem {
  id: number;
  menuItemId: number;
  name: string;
  basePrice: number;
  quantity: number;
  variant?: string | null;
  variantPrice: number;
  addons?: Addon[] | null;
  addonsPrice: number;
  itemTotal: number;
  gstRate: number;    // GST rate for this item (e.g. 0.05 = 5%)
  gstAmount: number;  // GST rupee amount for this item (post-discount)
}

export interface Order {
  id: number;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  taxRate: number;    // 0 when per-item GST is used
  taxAmount: number;  // total GST (CGST + SGST combined)
  discountType?: DiscountType | null;
  discountValue?: number | null;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  note?: string | null;
  createdAt: string;
  paidAt?: string | null;
}

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  avgOrderValue: number;
  totalItemsSold: number;
  topItems: { name: string; qty: number; revenue: number }[];
  revenueByMethod: { method: string; amount: number }[];
  recentOrders: Order[];
}

export interface ShopSettings {
  shopName: string;
  gstin: string;       // 15-char GST Identification Number
  address: string;
  phone: string;
  currency: string;    // '₹' | '$' | '€'
  taxLabel: 'CGST/SGST' | 'IGST'; // intra-state vs inter-state
  licenseKey: string;  // monthly license key for payment control
}
