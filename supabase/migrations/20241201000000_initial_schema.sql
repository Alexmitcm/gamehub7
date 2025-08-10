-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE game_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE user_tier AS ENUM ('free', 'premium', 'vip');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    lens_handle VARCHAR(100),
    wallet_address VARCHAR(42),
    user_tier user_tier DEFAULT 'free',
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    total_games INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    total_losses INTEGER DEFAULT 0,
    total_earnings DECIMAL(20,8) DEFAULT 0,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table
CREATE TABLE public.games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_type VARCHAR(50) NOT NULL,
    status game_status DEFAULT 'pending',
    player1_id UUID REFERENCES public.profiles(id) NOT NULL,
    player2_id UUID REFERENCES public.profiles(id),
    bet_amount DECIMAL(20,8) NOT NULL,
    game_data JSONB,
    winner_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    status transaction_status DEFAULT 'pending',
    blockchain_tx_hash VARCHAR(66),
    game_id UUID REFERENCES public.games(id),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Premium subscriptions table
CREATE TABLE public.premium_subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    subscription_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    amount DECIMAL(20,8) NOT NULL,
    duration_days INTEGER NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral rewards table
CREATE TABLE public.referral_rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES public.profiles(id) NOT NULL,
    referred_id UUID REFERENCES public.profiles(id) NOT NULL,
    reward_amount DECIMAL(20,8) NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game statistics table
CREATE TABLE public.game_statistics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    game_type VARCHAR(50) NOT NULL,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    total_bet DECIMAL(20,8) DEFAULT 0,
    total_won DECIMAL(20,8) DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    last_played TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_type)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_wallet_address ON public.profiles(wallet_address);
CREATE INDEX idx_profiles_lens_handle ON public.profiles(lens_handle);
CREATE INDEX idx_games_player1_id ON public.games(player1_id);
CREATE INDEX idx_games_player2_id ON public.games(player2_id);
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_premium_subscriptions_user_id ON public.premium_subscriptions(user_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_statistics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Games policies
CREATE POLICY "Users can view games they're involved in" ON public.games
    FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can create games" ON public.games
    FOR INSERT WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Users can update games they're involved in" ON public.games
    FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Premium subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON public.premium_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON public.premium_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Referral rewards policies
CREATE POLICY "Users can view their referral rewards" ON public.referral_rewards
    FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Game statistics policies
CREATE POLICY "Users can view their own game statistics" ON public.game_statistics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own game statistics" ON public.game_statistics
    FOR UPDATE USING (auth.uid() = user_id);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update game statistics
CREATE OR REPLACE FUNCTION public.update_game_statistics(
    p_user_id UUID,
    p_game_type VARCHAR(50),
    p_result VARCHAR(10),
    p_bet_amount DECIMAL(20,8),
    p_won_amount DECIMAL(20,8)
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.game_statistics (user_id, game_type, games_played, games_won, games_lost, total_bet, total_won, win_rate, last_played)
    VALUES (
        p_user_id,
        p_game_type,
        1,
        CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
        CASE WHEN p_result = 'loss' THEN 1 ELSE 0 END,
        p_bet_amount,
        p_won_amount,
        CASE WHEN p_result = 'win' THEN 100.0 ELSE 0.0 END,
        NOW()
    )
    ON CONFLICT (user_id, game_type)
    DO UPDATE SET
        games_played = game_statistics.games_played + 1,
        games_won = game_statistics.games_won + CASE WHEN p_result = 'win' THEN 1 ELSE 0 END,
        games_lost = game_statistics.games_lost + CASE WHEN p_result = 'loss' THEN 1 ELSE 0 END,
        total_bet = game_statistics.total_bet + p_bet_amount,
        total_won = game_statistics.total_won + p_won_amount,
        win_rate = CASE 
            WHEN (game_statistics.games_won + CASE WHEN p_result = 'win' THEN 1 ELSE 0 END) > 0 
            THEN ((game_statistics.games_won + CASE WHEN p_result = 'win' THEN 1 ELSE 0 END)::DECIMAL / (game_statistics.games_played + 1) * 100)
            ELSE 0 
        END,
        last_played = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
