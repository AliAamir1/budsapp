import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { UnifiedAuth } from './unified-auth';

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
      // Check backend authentication (primary auth system)
      const isBackendAuth = await UnifiedAuth.isBackendAuthenticated();
      const userDataString = await AsyncStorage.getItem('user_data');
      
      if (isBackendAuth && userDataString) {
        const userData = JSON.parse(userDataString);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Initialize Supabase auth for chat functionality
        await UnifiedAuth.initializeSupabaseAuth();
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
      
      // Initialize Supabase auth for chat functionality
      UnifiedAuth.initializeSupabaseAuth();
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