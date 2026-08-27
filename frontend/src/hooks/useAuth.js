import { useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../services/api';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, logout } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && !user) {
        try {
          const { data } = await api.get('/auth/me');
          setAuth(data, useAuthStore.getState().token);
        } catch {
          logout();
        }
      }
    };
    fetchUser();
  }, []);

  return { user, isAuthenticated };
};
