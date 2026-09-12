import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { catalogProductsApi } from '@/api/catalogProducts';
import type { CatalogProduct } from '@/types';

interface CatalogProductsState {
  products: CatalogProduct[];
  loading: boolean;
  error: string | null;
}

const initialState: CatalogProductsState = {
  products: [],
  loading: false,
  error: null,
};

export const fetchCatalogProducts = createAsyncThunk(
  'catalogProducts/fetch',
  async (params: { categoryId?: string } | undefined, { rejectWithValue }) => {
    try {
      const { data } = await catalogProductsApi.getAll(params);
      return data.data as CatalogProduct[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  },
);

export const addCatalogProduct = createAsyncThunk(
  'catalogProducts/add',
  async (productData: Omit<CatalogProduct, 'id' | 'createdAt' | 'category'>, { rejectWithValue }) => {
    try {
      const { data } = await catalogProductsApi.create(productData as Record<string, unknown>);
      return data.data as CatalogProduct;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create product');
    }
  },
);

export const updateCatalogProduct = createAsyncThunk(
  'catalogProducts/update',
  async (product: CatalogProduct, { rejectWithValue }) => {
    try {
      const { id, category, ...rest } = product;
      const { data } = await catalogProductsApi.update(id, rest as Record<string, unknown>);
      return data.data as CatalogProduct;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update product');
    }
  },
);

export const deleteCatalogProduct = createAsyncThunk(
  'catalogProducts/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await catalogProductsApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete product');
    }
  },
);

const catalogProductsSlice = createSlice({
  name: 'catalogProducts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCatalogProducts.fulfilled, (state, action) => { state.loading = false; state.products = action.payload; })
      .addCase(fetchCatalogProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(addCatalogProduct.fulfilled, (state, action) => { state.products.push(action.payload); })
      .addCase(updateCatalogProduct.fulfilled, (state, action) => {
        const idx = state.products.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.products[idx] = action.payload;
      })
      .addCase(deleteCatalogProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      });
  },
});

export default catalogProductsSlice.reducer;
