import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  full_name: string;
  gender?: string;
  birthdate?: string;
  region?: string;
  strengths?: string;
  weaknesses?: string;
  partner_preferences?: string;
  bio?: string;
  is_premium: boolean;
  created_at: string;
}

export class SupabaseQueries {
  // Create user profile only if it doesn't exist
  static async createUserProfileIfNotExists(userId: string, profileData: Partial<UserProfile>) {
    // First check if profile already exists
    const existingProfile = await this.getUserProfile(userId);
    
    if (existingProfile) {
      console.log('User profile already exists, skipping creation');
      return existingProfile;
    }

    // Create new profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        full_name: profileData.full_name || '',
        gender: profileData.gender,
        birthdate: profileData.birthdate,
        region: profileData.region,
        strengths: profileData.strengths,
        weaknesses: profileData.weaknesses,
        partner_preferences: profileData.partner_preferences,
        bio: profileData.bio,
        is_premium: profileData.is_premium || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      throw new Error(error.message);
    }

    return data;
  }

  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error getting user profile:', error);
      throw new Error(error.message);
    }

    return data;
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw new Error(error.message);
    }

    return data;
  }

  // Delete user profile
  static async deleteUserProfile(userId: string) {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user profile:', error);
      throw new Error(error.message);
    }
  }
}
