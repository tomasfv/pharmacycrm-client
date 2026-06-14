import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AppRouter } from '@/routes/AppRouter';
import { SnackbarProvider } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { restoreSession } from '@/features/auth/authSlice';
import { fetchNotifications } from '@/features/notifications/notificationsSlice';
import { fetchMedications } from '@/features/medications/medicationsSlice';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);
  return <>{children}</>;
}

function DataInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
      dispatch(fetchMedications());
    }
  }, [dispatch, isAuthenticated]);

  return <>{children}</>;
}

function AppContent() {
  return (
    <BrowserRouter>
      <SnackbarProvider>
        <AuthInitializer>
          <DataInitializer>
            <AppRouter />
          </DataInitializer>
        </AuthInitializer>
      </SnackbarProvider>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
