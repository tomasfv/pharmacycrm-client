export interface CatalogOrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CatalogOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: 'pickup' | 'delivery';
  paymentMethod: 'cash' | 'card';
  items: CatalogOrderItem[];
  total: number;
  createdAt: string;
}
