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
  [key: string]: unknown;
}

