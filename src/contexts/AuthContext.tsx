import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  clinicId: string | null;
  userId: string | null;
  fullName: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('clinic_auth_token');
    const storedClinicId = localStorage.getItem('clinic_id');
    const storedUserId = localStorage.getItem('user_id');
    const storedFullName = localStorage.getItem('full_name');
    
    if (token && storedClinicId) {
      setIsAuthenticated(true);
      setUsername(token);
      setClinicId(storedClinicId);
      setUserId(storedUserId);
      setFullName(storedFullName);
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

      // Verifica se data é um array válido com resultados
      if (!data || !Array.isArray(data) || data.length === 0) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      const userData = data[0];
      
      localStorage.setItem('clinic_auth_token', username);
      localStorage.setItem('clinic_id', userData.clinic_id);
      localStorage.setItem('user_id', userData.user_id);
      localStorage.setItem('full_name', userData.full_name);
      
      setIsAuthenticated(true);
      setUsername(username);
      setClinicId(userData.clinic_id);
      setUserId(userData.user_id);
      setFullName(userData.full_name);
      
      return { success: true };
    } catch (err) {
      console.error('Login exception:', err);
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('clinic_auth_token');
    localStorage.removeItem('clinic_id');
    localStorage.removeItem('user_id');
    localStorage.removeItem('full_name');
    setIsAuthenticated(false);
    setUsername(null);
    setClinicId(null);
    setUserId(null);
    setFullName(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, clinicId, userId, fullName, login, logout, isLoading }}>
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
