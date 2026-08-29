import { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';

type RootState = {
  auth: ReturnType<typeof authReducer>;
};

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  route?: string;
  store?: ReturnType<typeof configureStore<{ auth: ReturnType<typeof authReducer> }>>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {} as RootState,
    route = '/login',
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: preloadedState as RootState,
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
