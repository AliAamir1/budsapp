import apiClient from "@/lib/api-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { supabase } from "./supabase";
import { SupabaseQueries } from "./supabase-queries";

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

  static async signInWithGoogle() {
    const redirectUrl = Linking.createURL("auth/callback");

    console.log("Starting Google OAuth with redirect URL:", redirectUrl);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.url) {
      throw new Error("No url found");
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
    console.log("OAuth result:", result);

    if (result.type !== "success") {
      throw new Error(`OAuth status: ${result.type}`);
    }

    // Extract tokens from the URL if present
    if (!result.url) {
      throw new Error("No url found");
    }
    console.log("result.url", result.url);

    // Parse the URL fragment to extract tokens
    const urlParts = result.url.split("#");
    if (urlParts.length < 2) {
      throw new Error("No fragment found in URL");
    }

    const fragment = urlParts[1];
    const params = new URLSearchParams(fragment);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    console.log("accessToken", accessToken ? "found" : "not found");
    console.log("refreshToken", refreshToken ? "found" : "not found");

    if (!accessToken || !refreshToken) {
      throw new Error("No tokens found in URL fragment");
    }

    // Set the session in Supabase
    const { data: sessionData, error: sessionError } =
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

    if (sessionError) {
      console.error("Error setting session:", sessionError);
      throw new Error(sessionError.message);
    }

    // Store tokens
    await AsyncStorage.setItem("supabase_access_token", accessToken);
    await AsyncStorage.setItem("supabase_refresh_token", refreshToken);
    await AsyncStorage.setItem("access_token", accessToken);
    await AsyncStorage.setItem("refresh_token", refreshToken);

    console.log("Session set successfully:", sessionData);

    if (!sessionData.user) {
      throw new Error("No user found");
    }

    const userProfile = await SupabaseQueries.createUserProfileIfNotExists(
      sessionData.user.id,
      {
        full_name:
          sessionData.user.user_metadata?.full_name ||
          sessionData.user.email?.split("@")[0] ||
          "User",
      }
    );
    console.log("User profile created:", userProfile);

    const userData = await apiClient.getCurrentUserProfile();
    console.log("userData", userData);

    console.log("dumyData", userData);
    await AsyncStorage.setItem("user_data", JSON.stringify(userData.data.user));

    return userData;
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
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    await AsyncStorage.removeItem("user_data");
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
