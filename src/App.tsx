import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AppRouter } from '@/routes/AppRouter';
import { SnackbarProvider } from '@/components/ui';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <SnackbarProvider>
          <AppRouter />
        </SnackbarProvider>
      </BrowserRouter>
    </Provider>
  );
}
