export interface PropertyUnit {
  id: string;
  code?: string;
  floor?: string;
  sizeSqFt?: number;
  desks?: number;
  fitOut?: string;
  status?: string;
  pricePsf?: number;
  pricePcm?: number;
  pipelineStage?: string;
  lease?: string;
}

export interface PropertyStats {
  occupancyPct?: number;
  totalUnits?: number;
  available?: number;
  underOffer?: number;
  let?: number;
}

export interface PropertyMarketing {
  visibility?: string;
  status?: string;
  fitOut?: string;
}

export interface PropertyCompliance {
  epc?: {
    rating?: string;
    ref?: string;
    issued?: string;
    expires?: string;
  };
  hsCertified?: boolean;
  breeam?: string;
}

export interface PropertyContact {
  name?: string;
  firm?: string;
  email?: string;
  phone?: string;
  pmContact?: string;
}

export interface PropertyContacts {
  agent?: PropertyContact;
  landlord?: PropertyContact;
  [key: string]: PropertyContact | undefined;
}

export interface Property {
  id: string;
  name: string;
  addressLine?: string;
  postcode?: string;
  city?: string;
  country?: string;
  geo?: {
    lat: number;
    lng: number;
  };
  submarket?: string;
  totalSizeSqFt?: number;
  floorCount?: number;
  lifts?: string;
  builtYear?: number;
  refurbishedYear?: number;
  parking?: string;
  amenities?: string[];
  marketing?: PropertyMarketing;
  compliance?: PropertyCompliance;
  contacts?: PropertyContacts;
  units?: PropertyUnit[];
  stats?: PropertyStats;
  updatedAt?: string;
  [key: string]: unknown;
}

