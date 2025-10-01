import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('clinic_auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .rpc('authenticate_clinic_user', {
          p_username: username,
          p_password: password
        });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Erro ao fazer login' };
      }

      if (!data) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      localStorage.setItem('clinic_auth_token', username);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error('Login exception:', err);
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('clinic_auth_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
