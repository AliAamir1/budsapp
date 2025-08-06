import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  gender?: string;
  birthdate?: string;
  region?: string;
  course?: string;
  examDate?: string;
  partner_preferences?: any;
  bio?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  examPreferences?: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  setAuthState: (authenticated: boolean, user?: User) => void;
  refreshAuthState: () => Promise<void>;
  getCurrentUserId: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const refreshAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userDataString = await AsyncStorage.getItem('user_data');
      
      if (token && userDataString) {
        const userData = JSON.parse(userDataString);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthState = (authenticated: boolean, userData?: User) => {
    setIsAuthenticated(authenticated);
    if (authenticated && userData) {
      setUser(userData);
      // Store user data in AsyncStorage
      AsyncStorage.setItem('user_data', JSON.stringify(userData));
    } else {
      setUser(null);
      // Clear user data from AsyncStorage
      AsyncStorage.removeItem('user_data');
    }
  };

  const getCurrentUserId = (): string | null => {
    return user?.id || null;
  };

  useEffect(() => {
    refreshAuthState();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      setAuthState, 
      refreshAuthState, 
      getCurrentUserId 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};