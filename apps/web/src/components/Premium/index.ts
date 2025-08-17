// Premium Registration Components
export { default as PremiumDashboard } from './PremiumDashboard';
export { default as PremiumRegistrationModal } from './PremiumRegistrationModal';
export { default as UserStatusDisplay } from './UserStatusDisplay';
export { default as NetworkStatusDisplay } from './NetworkStatusDisplay';
export { default as ProfileDiscoveryDisplay } from './ProfileDiscoveryDisplay';

// Re-export types from hooks
export type {
  UserStatus,
  ProfileLinkingResult,
  AutoLinkResult,
  LensProfile,
  ProfileDiscoveryResult,
  NetworkInfo,
  NetworkValidationResult,
  PremiumRegistrationRequest,
  PremiumRegistrationResult
} from '../../hooks/usePremiumRegistration';
