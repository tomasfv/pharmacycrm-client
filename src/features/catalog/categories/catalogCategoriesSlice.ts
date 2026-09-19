import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { catalogCategoriesApi } from '@/api/catalogCategories';
import type { CatalogCategory } from '@/types';

interface CatalogCategoriesState {
  categories: CatalogCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CatalogCategoriesState = {
  categories: [],
  loading: false,
  error: null,
};

export const fetchCatalogCategories = createAsyncThunk(
  'catalogCategories/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await catalogCategoriesApi.getAll();
      return data.data as CatalogCategory[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch categories');
    }
  },
);

export const addCatalogCategory = createAsyncThunk(
  'catalogCategories/add',
  async (categoryData: { name: string; image?: string }, { rejectWithValue }) => {
    try {
      const { data } = await catalogCategoriesApi.create(categoryData);
      return data.data as CatalogCategory;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create category');
    }
  },
);

export const updateCatalogCategory = createAsyncThunk(
  'catalogCategories/update',
  async (category: CatalogCategory, { rejectWithValue }) => {
    try {
      const { data } = await catalogCategoriesApi.update(category.id, { name: category.name, image: category.image });
      return data.data as CatalogCategory;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update category');
    }
  },
);

export const deleteCatalogCategory = createAsyncThunk(
  'catalogCategories/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await catalogCategoriesApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete category');
    }
  },
);

const catalogCategoriesSlice = createSlice({
  name: 'catalogCategories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogCategories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCatalogCategories.fulfilled, (state, action) => { state.loading = false; state.categories = action.payload; })
      .addCase(fetchCatalogCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(addCatalogCategory.fulfilled, (state, action) => { state.categories.push(action.payload); })
      .addCase(updateCatalogCategory.fulfilled, (state, action) => {
        const idx = state.categories.findIndex((c) => c.id === action.payload.id);
        if (idx >= 0) state.categories[idx] = action.payload;
      })
      .addCase(deleteCatalogCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter((c) => c.id !== action.payload);
      });
  },
});

export default catalogCategoriesSlice.reducer;
