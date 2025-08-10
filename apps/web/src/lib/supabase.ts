import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  // Sign in with OAuth provider
  signInWithOAuth: async (provider: 'google' | 'github' | 'discord') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Reset password
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });
    return { data, error };
  },

  // Update password
  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    });
    return { data, error };
  }
};

// Profile helpers
export const profiles = {
  // Get user profile
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Update user profile
  updateProfile: async (userId: string, updates: any) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  // Get profile by username
  getProfileByUsername: async (username: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    return { data, error };
  },

  // Search profiles
  searchProfiles: async (query: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(10);
    return { data, error };
  }
};

// Game helpers
export const games = {
  // Create new game
  createGame: async (gameData: any) => {
    const { data, error } = await supabase
      .from('games')
      .insert(gameData)
      .select()
      .single();
    return { data, error };
  },

  // Get user games
  getUserGames: async (userId: string, status?: string) => {
    let query = supabase
      .from('games')
      .select(`
        *,
        player1:profiles!player1_id(id, username, display_name, avatar_url),
        player2:profiles!player2_id(id, username, display_name, avatar_url),
        winner:profiles!winner_id(id, username, display_name, avatar_url)
      `)
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Update game
  updateGame: async (gameId: string, updates: any) => {
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', gameId)
      .select()
      .single();
    return { data, error };
  },

  // Get game by ID
  getGame: async (gameId: string) => {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        player1:profiles!player1_id(id, username, display_name, avatar_url),
        player2:profiles!player2_id(id, username, display_name, avatar_url),
        winner:profiles!winner_id(id, username, display_name, avatar_url)
      `)
      .eq('id', gameId)
      .single();
    return { data, error };
  }
};

// Transaction helpers
export const transactions = {
  // Create transaction
  createTransaction: async (transactionData: any) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();
    return { data, error };
  },

  // Get user transactions
  getUserTransactions: async (userId: string, limit = 50) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  // Update transaction status
  updateTransactionStatus: async (transactionId: string, status: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', transactionId)
      .select()
      .single();
    return { data, error };
  }
};

// Premium subscription helpers
export const premium = {
  // Create subscription
  createSubscription: async (subscriptionData: any) => {
    const { data, error } = await supabase
      .from('premium_subscriptions')
      .insert(subscriptionData)
      .select()
      .single();
    return { data, error };
  },

  // Get user subscriptions
  getUserSubscriptions: async (userId: string) => {
    const { data, error } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Check if user has active premium
  hasActivePremium: async (userId: string) => {
    const { data, error } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .single();
    return { hasPremium: !!data, data, error };
  }
};

// Game statistics helpers
export const statistics = {
  // Get user statistics
  getUserStatistics: async (userId: string) => {
    const { data, error } = await supabase
      .from('game_statistics')
      .select('*')
      .eq('user_id', userId);
    return { data, error };
  },

  // Get user statistics by game type
  getUserGameStatistics: async (userId: string, gameType: string) => {
    const { data, error } = await supabase
      .from('game_statistics')
      .select('*')
      .eq('user_id', userId)
      .eq('game_type', gameType)
      .single();
    return { data, error };
  },

  // Update game statistics
  updateGameStatistics: async (userId: string, gameType: string, result: string, betAmount: number, wonAmount: number) => {
    const { data, error } = await supabase.rpc('update_game_statistics', {
      p_user_id: userId,
      p_game_type: gameType,
      p_result: result,
      p_bet_amount: betAmount,
      p_won_amount: wonAmount
    });
    return { data, error };
  }
};

// Storage helpers
export const storage = {
  // Upload file
  uploadFile: async (bucket: string, path: string, file: File) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  // Get public URL
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  deleteFile: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    return { data, error };
  },

  // List files
  listFiles: async (bucket: string, path: string) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path);
    return { data, error };
  }
};

// Realtime helpers
export const realtime = {
  // Subscribe to table changes
  subscribeToTable: (table: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`table:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  },

  // Subscribe to specific row changes
  subscribeToRow: (table: string, rowId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`row:${table}:${rowId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table, filter: `id=eq.${rowId}` }, callback)
      .subscribe();
  },

  // Unsubscribe from channel
  unsubscribe: (channel: any) => {
    supabase.removeChannel(channel);
  }
};

export default supabase;
