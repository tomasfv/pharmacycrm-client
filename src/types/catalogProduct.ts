import { CatalogCategory } from './catalogCategory';

export interface CatalogProduct {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  description?: string;
  inStock: boolean;
  category?: CatalogCategory;
  createdAt: string;
}
