// Premium Registration Components
export { default as PremiumDashboard } from './PremiumDashboard';
export { default as PremiumRegistrationModal } from './PremiumRegistrationModal';
export { default as UserStatusDisplay } from './UserStatusDisplay';
export { default as NetworkStatusDisplay } from './NetworkStatusDisplay';
export { default as ProfileDiscoveryDisplay } from './ProfileDiscoveryDisplay';

// Premium UI Components
export { default as ProBadge } from './ProBadge';
export { default as JoinProBanner } from './JoinProBanner';
export { default as ProfileSelectionModal } from './ProfileSelectionModal';

// Premium Provider Components
export { default as PremiumProvider } from './PremiumProvider';
export { default as SimplePremiumProvider } from './SimplePremiumProvider';

// Premium Page Components
export { default as PremiumPage } from './PremiumPage';
export { default as PremiumTestPage } from './PremiumTestPage';
export { default as ProDashboard } from './ProDashboard';

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
