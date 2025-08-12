import GameVaultABI from "../abi/gameVault.json";
import ReferralABI from "../abi/referral.json";
import TetherABI from "../abi/tether.json";

// Environment detection
export const IS_PRODUCTION = import.meta.env.VITE_IS_PRODUCTION === "true";
export const HEY_API_URL = IS_PRODUCTION
  ? "https://api.hey.xyz"
  : import.meta.env.VITE_API_URL || "http://localhost:3010";

// 1. The definitive public RPC URL for Arbitrum One
export const ARBITRUM_RPC_URL = "https://arb1.arbitrum.io/rpc";
export const ARBITRUM_CHAIN_ID = 42161;

// 2. Mainnet Contract Addresses
export const MAINNET_CONTRACTS = {
  BALANCED_GAME_VAULT: "0x65f83111e525C8a577C90298377e56E72C24aCb2", // TODO: Add Mainnet GameVault Address
  REFERRAL: "0x3bC03e9793d2E67298fb30871a08050414757Ca7",
  UNBALANCED_GAME_VAULT: "0x10E7F9feB9096DCBb94d59D6874b07657c965981", // TODO: Add Mainnet Unbalanced GameVault Address
  USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"
};

// 3. Testnet Contract Addresses (using Arbitrum Sepolia as an example)
export const TESTNET_CONTRACTS = {
  GAME_VAULT: "0x...", // TODO: Add Testnet GameVault Address
  REFERRAL: "0x...", // TODO: Add Testnet Referral Address
  UNBALANCED_GAME_VAULT: "0x...", // TODO: Add Testnet Unbalanced GameVault Address
  USDT: "0x..." // TODO: Add Testnet USDT Address
};

// 4. Exported ABIs
export const ABIS = {
  GAME_VAULT: GameVaultABI,
  REFERRAL: ReferralABI,
  USDT: TetherABI
};

// 5. Individual ABI exports for direct use
export const REFERRAL_ABI = ReferralABI;
export const USDT_ABI = TetherABI;
export const GAME_VAULT_ABI = GameVaultABI;
