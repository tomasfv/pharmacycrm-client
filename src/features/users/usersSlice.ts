import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersApi } from '@/api/users';
import type { User } from '@/types';

interface UsersState {
  users: User[];
  loading: boolean;
}

const initialState: UsersState = {
  users: [],
  loading: false,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await usersApi.getAll();
      return data.data as User[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
    }
  },
);

export const addUser = createAsyncThunk(
  'users/add',
  async (userData: { name: string; email: string; password: string; role?: string }, { rejectWithValue }) => {
    try {
      const { data } = await usersApi.create(userData);
      return data.data as User;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create user');
    }
  },
);

export const updateUser = createAsyncThunk(
  'users/update',
  async (user: Partial<User> & { id: string; password?: string }, { rejectWithValue }) => {
    try {
      const { id, ...rest } = user;
      const { data } = await usersApi.update(id, rest);
      return data.data as User;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update user');
    }
  },
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await usersApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
    }
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.users = action.payload; })
      .addCase(fetchUsers.rejected, (state) => { state.loading = false; })
      .addCase(addUser.fulfilled, (state, action) => { state.users.unshift(action.payload); })
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.users.findIndex((u) => u.id === action.payload.id);
        if (idx >= 0) state.users[idx] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      });
  },
});

export default usersSlice.reducer;
