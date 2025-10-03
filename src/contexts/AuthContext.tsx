import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserData {
  clinicId: string;
  userId: string;
  username: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userData: UserData | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserData = localStorage.getItem('clinic_user_data');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('clinic_user_data');
      }
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

      if (!data || data.length === 0) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      const user = data[0];
      const userDataObj: UserData = {
        clinicId: user.clinic_id,
        userId: user.user_id,
        username: user.username,
        fullName: user.full_name || user.username,
        role: user.role
      };

      localStorage.setItem('clinic_user_data', JSON.stringify(userDataObj));
      setUserData(userDataObj);
      setIsAuthenticated(true);
      return { success: true };
    } catch (err) {
      console.error('Login exception:', err);
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const logout = () => {
    localStorage.removeItem('clinic_user_data');
    setUserData(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, login, logout, isLoading }}>
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
