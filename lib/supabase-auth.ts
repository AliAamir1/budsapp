import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

export interface SupabaseUser {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export class SupabaseAuth {
  // Sign in with email and password
  static async signIn(email: string, password: string) {
    console.log("supabase signIn", email, password);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log("supabase signIn", data, error);
    if (error) {
      throw new Error(error.message);
    }

    // Store the Supabase session token with different keys
    if (data.session) {
      await AsyncStorage.setItem(
        "supabase_access_token",
        data.session.access_token
      );
      await AsyncStorage.setItem(
        "supabase_refresh_token",
        data.session.refresh_token
      );
    }
    return data;
  }

  // Sign up with email and password
  static async signUp(email: string, password: string, userData?: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Store the Supabase session token if available
    if (data.session) {
      await AsyncStorage.setItem(
        "supabase_access_token",
        data.session.access_token
      );
      await AsyncStorage.setItem(
        "supabase_refresh_token",
        data.session.refresh_token
      );
    }

    return data;
  }

  // Sign out
  static async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    // Clear stored Supabase tokens
    await AsyncStorage.removeItem("supabase_access_token");
    await AsyncStorage.removeItem("supabase_refresh_token");
    await AsyncStorage.removeItem("supabase_user_data");
  }

  // Get current session
  static async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return session;
  }

  // Get current user
  static async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  // Refresh session
  static async refreshSession() {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      throw new Error(error.message);
    }

    // Update stored Supabase tokens
    if (data.session) {
      await AsyncStorage.setItem(
        "supabase_access_token",
        data.session.access_token
      );
      await AsyncStorage.setItem(
        "supabase_refresh_token",
        data.session.refresh_token
      );
    }

    return data;
  }
}
