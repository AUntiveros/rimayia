import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { MOCK_USER } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (dni: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('rimiapp_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('rimiapp_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (dni: string, password: string): Promise<void> => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 800));

    if (dni === MOCK_USER.dni && password === MOCK_USER.password) {
      const userData: User = {
        dni: MOCK_USER.dni,
        name: MOCK_USER.name,
        isFirstTime: MOCK_USER.isFirstTime,
      };
      
      setUser(userData);
      localStorage.setItem('rimiapp_user', JSON.stringify(userData));
    } else {
      throw new Error('DNI o contraseña incorrectos');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rimiapp_user');
    localStorage.removeItem('rimiapp_tutorial_pending');
    localStorage.removeItem('rimi_setup_complete');
    localStorage.removeItem('rimiapp_communication_preference');
  };

  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem('rimiapp_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        isLoading,
      }}
    >
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
