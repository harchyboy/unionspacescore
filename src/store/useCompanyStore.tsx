import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Company, CreateCompanyInput } from '../types/company';

const STORAGE_KEY = 'union.companies.mock';

// Helper utilities
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// Seed fixtures
function seedCompanies(): Company[] {
  return [
    {
      id: 'comp-1',
      name: 'Knight Frank',
      type: 'Agency',
      relationshipOwner: 'Tom Davies',
      status: 'Active',
      totalViewingsYTD: 45,
      totalDealsYTD: 12,
      totalRevenueYTD: 1250000,
    },
    {
      id: 'comp-2',
      name: 'Moorgate Estate Ltd',
      type: 'Landlord',
      relationshipOwner: 'Sarah Mitchell',
      status: 'Active',
      totalViewingsYTD: 28,
      totalDealsYTD: 8,
      totalRevenueYTD: 890000,
    },
    {
      id: 'comp-3',
      name: 'CleanPro Services',
      type: 'Supplier',
      relationshipOwner: 'David Chen',
      status: 'Active',
      totalViewingsYTD: 15,
      totalDealsYTD: 5,
      totalRevenueYTD: 125000,
    },
    {
      id: 'comp-4',
      name: 'TechCorp Ltd',
      type: 'Client',
      relationshipOwner: 'James Patterson',
      status: 'Active',
      totalViewingsYTD: 32,
      totalDealsYTD: 10,
      totalRevenueYTD: 2100000,
    },
  ];
}

function loadCompanies(): Company[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load companies from localStorage:', error);
  }
  return seedCompanies();
}

function saveCompanies(companies: Company[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  } catch (error) {
    console.error('Failed to save companies to localStorage:', error);
  }
}

interface CompanyStoreContextType {
  companies: Company[];
  addCompany: (companyInput: CreateCompanyInput) => void;
  getCompanyById: (id: string) => Company | undefined;
}

const CompanyStoreContext = createContext<CompanyStoreContextType | undefined>(undefined);

export function CompanyStoreProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(loadCompanies);

  // Save to localStorage whenever companies change
  useEffect(() => {
    saveCompanies(companies);
  }, [companies]);

  const addCompany = useCallback((companyInput: CreateCompanyInput) => {
    const newCompany: Company = {
      id: uid(),
      ...companyInput,
      totalViewingsYTD: 0,
      totalDealsYTD: 0,
      totalRevenueYTD: 0,
    };
    setCompanies((prev) => [...prev, newCompany]);
  }, []);

  const getCompanyById = useCallback(
    (id: string) => {
      return companies.find((c) => c.id === id);
    },
    [companies]
  );

  return (
    <CompanyStoreContext.Provider
      value={{
        companies,
        addCompany,
        getCompanyById,
      }}
    >
      {children}
    </CompanyStoreContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCompanyStore() {
  const context = useContext(CompanyStoreContext);
  if (!context) {
    throw new Error('useCompanyStore must be used within CompanyStoreProvider');
  }
  return context;
}

