import { createClient } from "@supabase/supabase-js";

// Use Vite environment variables (not Next.js process.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if environment variables are available
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true
        }
      })
    : null;

// Helper functions for common operations
export const supabaseHelpers = {
  // Get user session
  async getSession() {
    if (!supabase) {
      throw new Error(
        "Supabase client not initialized - missing environment variables"
      );
    }
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  // Check if Supabase is available
  isAvailable() {
    return supabase !== null;
  },

  // Sign in with wallet
  async signInWithWallet(walletAddress: string) {
    if (!supabase) {
      throw new Error(
        "Supabase client not initialized - missing environment variables"
      );
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${walletAddress}@wallet.local`,
      password: walletAddress // In production, use proper authentication
    });
    if (error) throw error;
    return data;
  },

  // Sign out
  async signOut() {
    if (!supabase) {
      throw new Error(
        "Supabase client not initialized - missing environment variables"
      );
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
