export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          lens_handle: string | null
          wallet_address: string | null
          user_tier: 'free' | 'premium' | 'vip'
          referral_code: string | null
          referred_by: string | null
          total_games: number
          total_wins: number
          total_losses: number
          total_earnings: string
          premium_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          lens_handle?: string | null
          wallet_address?: string | null
          user_tier?: 'free' | 'premium' | 'vip'
          referral_code?: string | null
          referred_by?: string | null
          total_games?: number
          total_wins?: number
          total_losses?: number
          total_earnings?: string
          premium_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          lens_handle?: string | null
          wallet_address?: string | null
          user_tier?: 'free' | 'premium' | 'vip'
          referral_code?: string | null
          referred_by?: string | null
          total_games?: number
          total_wins?: number
          total_losses?: number
          total_earnings?: string
          premium_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      games: {
        Row: {
          id: string
          game_type: string
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          player1_id: string
          player2_id: string | null
          bet_amount: string
          game_data: Json | null
          winner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_type: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          player1_id: string
          player2_id?: string | null
          bet_amount: string
          game_data?: Json | null
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_type?: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          player1_id?: string
          player2_id?: string | null
          bet_amount?: string
          game_data?: Json | null
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "games_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: string
          amount: string
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          blockchain_tx_hash: string | null
          game_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: string
          amount: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          blockchain_tx_hash?: string | null
          game_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: string
          amount?: string
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          blockchain_tx_hash?: string | null
          game_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          }
        ]
      }
      premium_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription_type: string
          status: string
          amount: string
          duration_days: number
          starts_at: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_type: string
          status?: string
          amount: string
          duration_days: number
          starts_at?: string
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_type?: string
          status?: string
          amount?: string
          duration_days?: number
          starts_at?: string
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "premium_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      referral_rewards: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          reward_amount: string
          reward_type: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          reward_amount: string
          reward_type: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          reward_amount?: string
          reward_type?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_rewards_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      game_statistics: {
        Row: {
          id: string
          user_id: string
          game_type: string
          games_played: number
          games_won: number
          games_lost: number
          total_bet: string
          total_won: string
          win_rate: string
          last_played: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_type: string
          games_played?: number
          games_won?: number
          games_lost?: number
          total_bet?: string
          total_won?: string
          win_rate?: string
          last_played?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_type?: string
          games_played?: number
          games_won?: number
          games_lost?: number
          total_bet?: string
          total_won?: string
          win_rate?: string
          last_played?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_statistics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_game_statistics: {
        Args: {
          p_user_id: string
          p_game_type: string
          p_result: string
          p_bet_amount: string
          p_won_amount: string
        }
        Returns: undefined
      }
    }
    Enums: {
      game_status: 'pending' | 'active' | 'completed' | 'cancelled'
      transaction_status: 'pending' | 'completed' | 'failed' | 'refunded'
      user_tier: 'free' | 'premium' | 'vip'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
