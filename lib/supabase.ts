import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: async (key: string) => {
        // Use Supabase-specific keys for auth storage
        const supabaseKey = key.startsWith('supabase') ? key : `supabase_${key}`;
        return await AsyncStorage.getItem(supabaseKey);
      },
      setItem: async (key: string, value: string) => {
        const supabaseKey = key.startsWith('supabase') ? key : `supabase_${key}`;
        return await AsyncStorage.setItem(supabaseKey, value);
      },
      removeItem: async (key: string) => {
        const supabaseKey = key.startsWith('supabase') ? key : `supabase_${key}`;
        return await AsyncStorage.removeItem(supabaseKey);
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Chat types
export interface Chat {
  id: string;
  created_at: string;
  recipient_one: string;
  recipient_two: string;
  last_message?: string;
  recipient_two_name?: string;
  recipient_one_name?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  chat_id: string;
}

export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  status: 'pending' | 'matched' | 'rejected';
} 