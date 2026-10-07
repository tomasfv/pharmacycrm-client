import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { catalogOrdersApi } from '@/api/catalogOrders';
import type { CatalogOrder } from '@/types';

interface CatalogOrdersState {
  orders: CatalogOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: CatalogOrdersState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchCatalogOrders = createAsyncThunk(
  'catalogOrders/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await catalogOrdersApi.getAll();
      return data.data as CatalogOrder[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  },
);

export const deleteCatalogOrder = createAsyncThunk(
  'catalogOrders/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await catalogOrdersApi.remove(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete order');
    }
  },
);

const catalogOrdersSlice = createSlice({
  name: 'catalogOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCatalogOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; })
      .addCase(fetchCatalogOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(deleteCatalogOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter((o) => o.id !== action.payload);
      });
  },
});

export default catalogOrdersSlice.reducer;
