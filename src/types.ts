export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  company?: string;
  avatar?: string;
  status?: 'Active' | 'Inactive' | 'Lead';
  lastContacted?: string;
  notes?: string;
  
  // Extended fields for different contact types
  contactType?: string;
  cityRegion?: string;
  
  // Broker specific
  brokerageTerritory?: string;
  specialisms?: string;
  preferredSubmarkets?: string;
  referralSource?: string;
  commissionStructure?: string;
  
  // Disposal Agent specific
  landlordRoster?: string;
  instructionTypes?: string;
  
  // Supplier specific
  serviceCategory?: string;
  coverageAreas?: string;
  rateCard?: string;
  leadTime?: string;
  
  // Landlord specific
  portfolioSize?: string;
  assetClasses?: string;
  geographicFocus?: string;
  propertyCount?: string;
  
  // Tenant/Client specific
  companySize?: string;
  industrySector?: string;
  minSize?: string;
  maxSize?: string;
  budgetMin?: string;
  budgetMax?: string;
  
  // Preferences
  emailLoggingConsent?: boolean;
  confidentialRequirement?: boolean;
  communicationCadence?: string;
  
  [key: string]: unknown;
}
