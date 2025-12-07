// Feature flags for controlling which modules are enabled
// Set via environment variables or defaults

export const FEATURES = {
  OVERVIEW: 'overview',
  DEALS: 'deals',
  DEAL_ROOM: 'deal_room',
  PROPERTIES: 'properties',
  UNITS: 'units',
  ONBOARDING: 'onboarding',
  SERVICES: 'services',
  TICKETS: 'tickets',
  SUPPLIERS: 'suppliers',
  CONTACTS: 'contacts',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
} as const;

export type Feature = (typeof FEATURES)[keyof typeof FEATURES];

// Get enabled features from environment or enable all by default
function getEnabledFeatures(): Set<Feature> {
  const envFeatures = import.meta.env.VITE_ENABLED_FEATURES;
  
  if (envFeatures) {
    // Parse comma-separated list of features
    const features = envFeatures.split(',').map((f: string) => f.trim().toLowerCase());
    return new Set(features as Feature[]);
  }
  
  // Default: enable all features
  return new Set(Object.values(FEATURES));
}

const enabledFeatures = getEnabledFeatures();

export function isFeatureEnabled(feature: Feature): boolean {
  return enabledFeatures.has(feature);
}

export function isContactsOnlyMode(): boolean {
  const envMode = import.meta.env.VITE_CONTACTS_ONLY;
  return envMode === 'true' || envMode === '1';
}

