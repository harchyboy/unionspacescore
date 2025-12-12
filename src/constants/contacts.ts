import type { Contact } from '../types/contact';

// Tab values that map to ContactType (matching Zoho CRM values)
export const CONTACT_TAB_BROKERS = 'Broker' as const;
export const CONTACT_TAB_DISPOSAL_AGENTS = 'Disposal Agent' as const;
export const CONTACT_TAB_TENANT_REPS = 'Tenant' as const;
export const CONTACT_TAB_SUPPLIERS = 'Supplier' as const;

// Tab configuration matching ContactType enum
export const CONTACT_TABS = [
  { value: CONTACT_TAB_BROKERS, label: 'Brokers' },
  { value: CONTACT_TAB_DISPOSAL_AGENTS, label: 'Disposal Agents' },
  { value: CONTACT_TAB_TENANT_REPS, label: 'Traditional Tenant Reps' },
  { value: CONTACT_TAB_SUPPLIERS, label: 'Suppliers' },
] as const;

export type ContactTabValue = typeof CONTACT_TABS[number]['value'];

// Helper function to determine contact category
export function getContactCategory(contact: Contact): ContactTabValue | null {
  if (contact.type === CONTACT_TAB_BROKERS) {
    return CONTACT_TAB_BROKERS;
  }
  if (contact.type === CONTACT_TAB_DISPOSAL_AGENTS) {
    return CONTACT_TAB_DISPOSAL_AGENTS;
  }
  if (contact.type === CONTACT_TAB_TENANT_REPS) {
    return CONTACT_TAB_TENANT_REPS;
  }
  if (contact.type === CONTACT_TAB_SUPPLIERS) {
    return CONTACT_TAB_SUPPLIERS;
  }
  return null;
}

