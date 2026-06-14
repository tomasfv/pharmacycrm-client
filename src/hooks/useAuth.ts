import { useAppSelector } from '@/store/hooks';

export function useAuth() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  return { isAuthenticated, user };
}
