declare namespace NodeJS {
  interface ProcessEnv {
    LENS_NETWORK: string;
    DATABASE_URL: string;
    LENS_DATABASE_URL: string;
    REDIS_URL: string;
    PRIVATE_KEY: string;
    EVER_ACCESS_KEY: string;
    EVER_ACCESS_SECRET: string;
    SHARED_SECRET: string;
    LIVEPEER_KEY: string;
    OPENROUTER_API_KEY: string;
    SUPABASE_URL: string;
    SUPABASE_KEY: string;

    // ✅ اضافه کن:
    INFURA_URL: string;
    REFERRAL_CONTRACT_ADDRESS: string;
    BALANCED_GAME_VAULT_ADDRESS: string;
    UNBALANCED_GAME_VAULT_ADDRESS: string;
    VIP_VAULT_ADDRESS: string;
    DEFAULT_LENS_HANDLE: string;
  }
}
