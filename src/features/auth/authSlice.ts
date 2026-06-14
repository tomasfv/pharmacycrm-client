import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { User } from '@/types';
import { mockUsers } from '@/mock';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

function loadUser(): User | null {
  try {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('auth_user');
    return null;
  }
}

const existingUser = loadUser();

const initialState: AuthState = {
  user: existingUser,
  isAuthenticated: !!existingUser,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const user = mockUsers.find((u) => u.email === email);
    if (user && password === 'PharmaCare2026') {
      localStorage.setItem('auth_user', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid email or password');
  },
);

export const logoutAction = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('auth_user');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(logoutAction.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export default authSlice.reducer;
