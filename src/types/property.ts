export type PropertyId = string;

export interface Unit {
  id: string;
  code: string; // e.g. 99B-3-A
  floor: string; // e.g. 3rd
  sizeSqFt: number;
  desks: number;
  fitOut: 'Shell' | 'Cat A' | 'Cat A+';
  status: 'Available' | 'Under Offer' | 'Let' | 'Closed';
  pricePsf?: number;
  pricePcm?: number;
  lease?: string; // text summary
  pipelineStage?: 'New' | 'Viewing' | 'HoTs' | 'Legals' | 'Closed';
}

export interface Property {
  id: PropertyId;
  name: string;
  addressLine: string;
  postcode: string;
  city: string;
  country: string;
  geo?: { lat: number; lng: number };
  submarket?: string;
  totalSizeSqFt?: number;
  floorCount?: number;
  lifts?: string;
  builtYear?: number;
  refurbishedYear?: number;
  parking?: string;
  amenities: string[];
  images?: string[];
  dataHealth?: number;
  marketing: {
    visibility: 'Private' | 'Public';
    status: 'Draft' | 'Broker-Ready' | 'On Market';
    fitOut: 'Shell' | 'Cat A' | 'Cat A+';
    brokerSet?: string;
    valveSyncStatus?: 'synced' | 'pending' | 'error';
    valveSyncError?: string;
    lastSyncedAt?: string;
  };
  compliance?: {
    epc?: { rating: string; ref?: string; issued?: string; expires?: string };
    hsCertified?: boolean;
    breeam?: string;
  };
  contacts?: {
    agent?: { name: string; firm?: string; email?: string; phone?: string };
    landlord?: { name: string; pmContact?: string };
  };
  units: Unit[];
  stats?: {
    occupancyPct: number;
    totalUnits: number;
    available: number;
    underOffer: number;
    let: number;
  };
  updatedAt?: string;
}

