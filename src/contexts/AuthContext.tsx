
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('yardpack_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Demo login logic - replace with actual authentication
    if (email === 'admin@yardpack.com' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        email: 'admin@yardpack.com',
        name: 'Admin User',
        role: 'admin'
      };
      setUser(adminUser);
      localStorage.setItem('yardpack_user', JSON.stringify(adminUser));
      setIsLoading(false);
      return true;
    } else if (email === 'customer@example.com' && password === 'customer123') {
      const customerUser: User = {
        id: '2',
        email: 'customer@example.com',
        name: 'John Doe',
        role: 'customer'
      };
      setUser(customerUser);
      localStorage.setItem('yardpack_user', JSON.stringify(customerUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('yardpack_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
