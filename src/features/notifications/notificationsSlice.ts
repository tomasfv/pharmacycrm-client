import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsApi } from '@/api/notifications';
import type { Notification } from '@/types';

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await notificationsApi.getAll();
      return data.data as Notification[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  },
);

export const markAsRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await notificationsApi.markAsRead(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark notification as read');
    }
  },
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsApi.markAllAsRead();
      return true;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read');
    }
  },
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => { state.loading = false; state.notifications = action.payload; })
      .addCase(fetchNotifications.rejected, (state) => { state.loading = false; })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification) notification.read = true;
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => { n.read = true; });
      });
  },
});

export const selectUnreadCount = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter((n) => !n.read).length;

export default notificationsSlice.reducer;
