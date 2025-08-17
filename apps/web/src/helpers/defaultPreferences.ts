import type { Preferences } from "@hey/types/api";

/**
 * Default preferences to use when the API is unavailable
 */
export const DEFAULT_PREFERENCES: Preferences = {
  appIcon: 0,
  includeLowScore: false
};

/**
 * Check if preferences are valid
 */
export const isValidPreferences = (preferences: any): preferences is Preferences => {
  return (
    preferences &&
    typeof preferences === "object" &&
    typeof preferences.appIcon === "number" &&
    typeof preferences.includeLowScore === "boolean"
  );
};

/**
 * Get preferences with fallback to defaults
 */
export const getPreferencesWithFallback = (preferences: any): Preferences => {
  if (isValidPreferences(preferences)) {
    return preferences;
  }
  
  console.warn("🔍 Invalid preferences received, using defaults:", preferences);
  return DEFAULT_PREFERENCES;
};
