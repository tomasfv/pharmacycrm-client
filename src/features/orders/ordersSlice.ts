import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ordersApi } from '@/api/orders';
import type { Order } from '@/types';

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk<Order[], string | undefined>(
  'orders/fetchOrders',
  async (patientId, { rejectWithValue }) => {
    try {
      const { data } = await ordersApi.getByPatientId(patientId ?? '');
      return data.data as Order[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  },
);

export const addOrder = createAsyncThunk(
  'orders/addOrder',
  async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const { data } = await ordersApi.create(orderData as Record<string, unknown>);
      return data.data as Order;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create order');
    }
  },
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.orders = action.payload; })
      .addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(addOrder.fulfilled, (state, action) => { state.orders.unshift(action.payload); });
  },
});

export default ordersSlice.reducer;
