import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Notification } from '@/types';
import { mockNotifications } from '@/mock';

interface NotificationsState {
  notifications: Notification[];
  loading: boolean;
}

const initialState: NotificationsState = {
  notifications: mockNotifications,
  loading: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAsRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find(
        (n) => n.id === action.payload,
      );
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead(state) {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
  },
});

export const { markAsRead, markAllAsRead } = notificationsSlice.actions;

export const selectUnreadCount = (state: { notifications: NotificationsState }) =>
  state.notifications.notifications.filter((n) => !n.read).length;

export default notificationsSlice.reducer;
