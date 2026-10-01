export type MainCategory = 'Books' | 'Stationery';

export interface Product {
  id: string;
  sku: string;
  title: string;
  authorOrBrand: string;
  category: MainCategory;
  subcategory: string;
  price: number;
  originalPrice?: number;
  stock: number;
  semesterTag: string;
  bindingOrMaterial: string;
  description: string;
  specs: Record<string, string>;
  coverStyle: {
    bgHex: string;
    accentHex: string;
    textHex: string;
    editionLabel: string;
    codeLabel: string;
  };
  imageUrl?: string;
}

export interface ComboItemRef {
  productId: string;
  quantity: number;
  label: string;
}

export interface StudentCombo {
  id: string;
  title: string;
  subtitle: string;
  targetGroup: string;
  description: string;
  items: ComboItemRef[];
  regularPrice: number;
  comboPrice: number;
  imageUrl: string;
}

export interface CartItem {
  id: string; // productId or comboId
  type: 'product' | 'combo';
  title: string;
  subtitle: string;
  categoryLabel: string;
  unitPrice: number;
  quantity: number;
  sku: string;
  includedItems?: string[];
}

export type OrderStatus =
  | 'Order Placed'
  | 'Packed at Campus Store'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderLineItem {
  id: string;
  title: string;
  categoryLabel: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  paymentMethod: 'Campus Smart Card' | 'UPI Instant Pay' | 'Cash on Delivery';
  items: OrderLineItem[];
  subtotal: number;
  comboSavings: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  department: string;
  semester: string;
  role: 'student' | 'admin';
}

export interface CategoryTree {
  Books: string[];
  Stationery: string[];
}
