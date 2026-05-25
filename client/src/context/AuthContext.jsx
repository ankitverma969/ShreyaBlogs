import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../services/adminService.js';
import { AuthContext } from './authContext.js';

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    adminService
      .me()
      .then(({ data }) => setAdmin(data.admin))
      .catch(() => setAdmin(null))
      .finally(() => setIsAuthLoading(false));
  }, []);

  async function login(credentials) {
    const { data } = await adminService.login(credentials);
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
    }
    setAdmin(data.admin);
    return data;
  }

  async function logout() {
    await adminService.logout();
    localStorage.removeItem('adminToken');
    setAdmin(null);
  }

  const value = useMemo(
    () => ({
      admin,
      isAuthLoading,
      login,
      logout,
      isAuthenticated: Boolean(admin)
    }),
    [admin, isAuthLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
