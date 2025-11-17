/**
 * Feature flags configuration
 * Controls which features/modules are enabled in the application
 * 
 * Set VITE_ENABLED_FEATURES environment variable to a comma-separated list of features:
 * - "contacts" - Contacts module only
 * - "all" - All features (default)
 * 
 * Example for contacts-only: VITE_ENABLED_FEATURES=contacts
 */

const enabledFeaturesEnv = import.meta.env.VITE_ENABLED_FEATURES || 'all';
const enabledFeatures = enabledFeaturesEnv.split(',').map((f) => f.trim().toLowerCase());

export const FEATURES = {
  DEALS: 'deals',
  LEADS: 'leads',
  PROPERTIES: 'properties',
  UNITS: 'units',
  DEAL_ROOM: 'deal-room',
  ONBOARDING: 'onboarding',
  SERVICES: 'services',
  TICKETS: 'tickets',
  SUPPLIERS: 'suppliers',
  CONTACTS: 'contacts',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  OVERVIEW: 'overview',
} as const;

export type Feature = (typeof FEATURES)[keyof typeof FEATURES];

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: Feature): boolean {
  // If "all" is specified, enable everything
  if (enabledFeatures.includes('all')) {
    return true;
  }
  
  // Check if the specific feature is enabled
  return enabledFeatures.includes(feature.toLowerCase());
}

/**
 * Check if contacts-only mode is enabled
 */
export function isContactsOnlyMode(): boolean {
  return enabledFeatures.length === 1 && enabledFeatures[0] === 'contacts';
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): Feature[] {
  if (enabledFeatures.includes('all')) {
    return Object.values(FEATURES);
  }
  return enabledFeatures.filter((f) => 
    Object.values(FEATURES).includes(f as Feature)
  ) as Feature[];
}

