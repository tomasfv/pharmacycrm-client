import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import '@testing-library/jest-dom/jest-globals';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/renderWithProviders';
import { LoginPage } from '../LoginPage';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { post: jest.fn() },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'auth.signIn': 'Sign in to your account',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.signInButton': 'Sign In',
        'auth.demoCredentials': 'Demo: admin@pharmacare.com / PharmaCare2026',
      };
      return translations[key] || key;
    },
  }),
}));

import apiClient from '@/api/client';

const mockPost = jest.mocked(apiClient).post;

function fillForm(email: string, password: string) {
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
}

describe('LoginPage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders the login form with email, password and sign in button', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    renderWithProviders(<LoginPage />);
    fillForm('', 'PharmaCare2026');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('shows validation error for short password', async () => {
    renderWithProviders(<LoginPage />);
    fillForm('admin@pharmacare.com', '123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('successful login: calls API, stores token, navigates to /dashboard', async () => {
    mockPost.mockResolvedValueOnce({
      data: {
        data: {
          token: 'fake-jwt-token',
          user: { id: 1, email: 'admin@pharmacare.com', name: 'Admin', role: 'admin' },
        },
      },
    });

    const { store } = renderWithProviders(<LoginPage />);

    fillForm('admin@pharmacare.com', 'PharmaCare2026');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@pharmacare.com',
        password: 'PharmaCare2026',
      });
    });

    await waitFor(() => {
      expect(store.getState().auth.isAuthenticated).toBe(true);
    });

    expect(localStorage.getItem('auth_token')).toBe('fake-jwt-token');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('failed login: shows API error message', async () => {
    mockPost.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } },
    });

    renderWithProviders(<LoginPage />);

    fillForm('wrong@email.com', 'wrongpassword');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows loading state while login is in progress', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let resolveLogin!: (value: any) => void;
    mockPost.mockImplementationOnce(
      () => new Promise((resolve) => { resolveLogin = resolve; }),
    );

    renderWithProviders(<LoginPage />);

    fillForm('admin@pharmacare.com', 'PharmaCare2026');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
    });

    resolveLogin({
      data: {
        data: {
          token: 'fake-jwt-token',
          user: { id: 1, email: 'admin@pharmacare.com', name: 'Admin', role: 'admin' },
        },
      },
    });
  });
});
