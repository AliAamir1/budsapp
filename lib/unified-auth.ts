import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupabaseAuth } from './supabase-auth';

export interface AuthTokens {
  // Node.js backend tokens
  accessToken?: string;
  refreshToken?: string;
  // Supabase tokens
  supabaseAccessToken?: string;
  supabaseRefreshToken?: string;
}

export class UnifiedAuth {
  // Node.js Backend Authentication
  static async setBackendTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.setItem('access_token', accessToken);
    await AsyncStorage.setItem('refresh_token', refreshToken);
  }

  static async getBackendTokens(): Promise<{ accessToken?: string; refreshToken?: string }> {
    const accessToken = await AsyncStorage.getItem('access_token');
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    return { accessToken: accessToken || undefined, refreshToken: refreshToken || undefined };
  }

  static async clearBackendTokens() {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user_data');
  }

  // Supabase Authentication
  static async setSupabaseTokens(accessToken: string, refreshToken: string) {
    await AsyncStorage.setItem('supabase_access_token', accessToken);
    await AsyncStorage.setItem('supabase_refresh_token', refreshToken);
  }

  static async getSupabaseTokens(): Promise<{ accessToken?: string; refreshToken?: string }> {
    const accessToken = await AsyncStorage.getItem('supabase_access_token');
    const refreshToken = await AsyncStorage.getItem('supabase_refresh_token');
    return { accessToken: accessToken || undefined, refreshToken: refreshToken || undefined };
  }

  static async clearSupabaseTokens() {
    await AsyncStorage.removeItem('supabase_access_token');
    await AsyncStorage.removeItem('supabase_refresh_token');
    await AsyncStorage.removeItem('supabase_user_data');
  }

  // Unified logout - clears both auth systems
  static async logout() {
    await this.clearBackendTokens();
    await this.clearSupabaseTokens();
  }

  // Check if user is authenticated with backend
  static async isBackendAuthenticated(): Promise<boolean> {
    const tokens = await this.getBackendTokens();
    return !!(tokens.accessToken && tokens.refreshToken);
  }

  // Check if user is authenticated with Supabase
  static async isSupabaseAuthenticated(): Promise<boolean> {
    try {
      return await SupabaseAuth.isAuthenticated();
    } catch (error) {
      return false;
    }
  }

  // Initialize Supabase auth if needed for chat
  static async initializeSupabaseAuth() {
    // Check if we need to create a Supabase session for chat functionality
    const isSupabaseAuth = await this.isSupabaseAuthenticated();
    const isBackendAuth = await this.isBackendAuthenticated();
    
    if (isBackendAuth && !isSupabaseAuth) {
      // User is authenticated with backend but not Supabase
      // We could create a Supabase session here if needed
      // For now, we'll just use anonymous auth for chat
      console.log('User authenticated with backend, using anonymous Supabase for chat');
    }
  }

  // Get current user ID from backend auth
  static async getBackendUserId(): Promise<string | null> {
    try {
      const userDataString = await AsyncStorage.getItem('user_data');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return userData.id || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Get current user ID from Supabase auth
  static async getSupabaseUserId(): Promise<string | null> {
    try {
      const user = await SupabaseAuth.getCurrentUser();
      return user?.id || null;
    } catch (error) {
      return null;
    }
  }
} 