import { CatalogCategory } from './catalogCategory';

export interface CatalogProductVariation {
  id?: string;
  productId?: string;
  label: string;
  price: number;
  inStock: boolean;
  sortOrder?: number;
}

export interface CatalogProduct {
  id: string;
  sku?: string;
  name: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  description?: string;
  inStock: boolean;
  category?: CatalogCategory;
  variations?: CatalogProductVariation[];
  createdAt: string;
}

export interface CatalogBatchError {
  index: number;
  sku: string;
  message: string;
}

export interface CatalogBatchResult {
  created: number;
  updated: number;
  unchanged: number;
  errors: CatalogBatchError[];
}
