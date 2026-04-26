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
}

export interface Order {
  id: number;
  orderNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
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
