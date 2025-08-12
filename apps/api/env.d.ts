declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    LENS_DATABASE_URL: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;
    NEXT_PUBLIC_LENS_NETWORK: string;
    PRIVATE_KEY: string;
    SHARED_SECRET: string;
    REFERRAL_CONTRACT_ADDRESS: string;
    BALANCED_GAME_VAULT_ADDRESS: string;
    UNBALANCED_GAME_VAULT_ADDRESS: string;
    VIP_VAULT_ADDRESS: string;
    DEFAULT_LENS_HANDLE: string;
    USDT_CONTRACT_ADDRESS: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    INFURA_URL: string;
    JWT_SECRET: string;
  }
}
