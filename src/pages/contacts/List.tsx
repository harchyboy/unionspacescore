import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContacts } from '../../api/contacts';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import { MasterDetailLayout } from '../../components/layout/MasterDetailLayout';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { FilterSection } from '../../components/ui/FilterSection';
import { Table, TableHeader, TableHeaderCell, TableBody } from '../../components/ui/Table';
import { ContactRow } from '../../components/contacts/ContactRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ContactDetails } from './Details';
import type { ContactType, RelationshipHealth } from '../../types/contact';

const contactTypes: { value: ContactType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'flex-broker', label: 'Flex Broker' },
  { value: 'disposal-agent', label: 'Disposal Agent' },
  { value: 'tenant', label: 'Tenant/Prospect' },
  { value: 'landlord', label: 'Landlord' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'internal', label: 'Internal' },
];

const healthOptions: { value: RelationshipHealth | 'all'; label: string }[] = [
  { value: 'all', label: 'All Relationship Health' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'needs-attention', label: 'Needs Attention' },
];

export function ContactsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    searchParams.get('id') || null
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [typeFilter, setTypeFilter] = useState<ContactType | 'all'>(
    (searchParams.get('type') as ContactType | 'all') || 'all'
  );
  const [healthFilter, setHealthFilter] = useState<RelationshipHealth | 'all'>(
    (searchParams.get('health') as RelationshipHealth | 'all') || 'all'
  );
  const { toasts, showToast, removeToast } = useToast();

  const { data, isLoading, error } = useContacts({
    page: 1,
    pageSize: 50,
    filters: {
      type: typeFilter !== 'all' ? typeFilter : undefined,
      health: healthFilter !== 'all' ? healthFilter : undefined,
      query: searchQuery || undefined,
    },
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('query', value);
    } else {
      params.delete('query');
    }
    setSearchParams(params);
  };

  const handleTypeFilter = (value: string) => {
    const newType = value as ContactType | 'all';
    setTypeFilter(newType);
    const params = new URLSearchParams(searchParams);
    if (newType !== 'all') {
      params.set('type', newType);
    } else {
      params.delete('type');
    }
    setSearchParams(params);
  };

  const handleHealthFilter = (value: string) => {
    const newHealth = value as RelationshipHealth | 'all';
    setHealthFilter(newHealth);
    const params = new URLSearchParams(searchParams);
    if (newHealth !== 'all') {
      params.set('health', newHealth);
    } else {
      params.delete('health');
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setHealthFilter('all');
    setSearchParams({});
  };

  const handleSelectContact = (id: string) => {
    setSelectedContactId(id);
    const params = new URLSearchParams(searchParams);
    params.set('id', id);
    setSearchParams(params);
  };

  const handleBackToList = () => {
    setSelectedContactId(null);
    const params = new URLSearchParams(searchParams);
    params.delete('id');
    setSearchParams(params);
  };

  const showDetail = !!selectedContactId;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-2">Contacts</h1>
            <p className="text-secondary text-sm">
              Manage brokers, tenants, landlords, and supplier relationships
            </p>
          </div>
          <Button
            icon="fa-plus"
            onClick={() => navigate('/contacts/new')}
          >
            Add Contact
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-4 mt-6">
          <button className="px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary">
            All Contacts
          </button>
          <button className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border-b-2 border-transparent hover:border-secondary transition-all-smooth">
            Flex Brokers
          </button>
          <button className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border-b-2 border-transparent hover:border-secondary transition-all-smooth">
            Disposal Agents
          </button>
          <button className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border-b-2 border-transparent hover:border-secondary transition-all-smooth">
            Tenants
          </button>
          <button className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border-b-2 border-transparent hover:border-secondary transition-all-smooth">
            Suppliers
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterSection onClear={handleClearFilters}>
        <Select
          options={contactTypes}
          value={typeFilter}
          onChange={(e) => handleTypeFilter(e.target.value)}
          className="w-48"
        />
        <Select
          options={healthOptions}
          value={healthFilter}
          onChange={(e) => handleHealthFilter(e.target.value)}
          className="w-56"
        />
      </FilterSection>

      {/* Master-Detail Layout */}
      <MasterDetailLayout
        master={
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive">Error loading contacts</p>
              </div>
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                title="No contacts found"
                description="Get started by adding a new contact"
                icon="fa-users"
                action={{
                  label: 'Add Contact',
                  onClick: () => navigate('/contacts/new'),
                }}
              />
            ) : (
              <div className="bg-white rounded-lg border border-[#E6E6E6] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableHeaderCell>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary"
                      />
                    </TableHeaderCell>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Company</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell>Phone</TableHeaderCell>
                    <TableHeaderCell>Last Activity</TableHeaderCell>
                    <TableHeaderCell>Open Items</TableHeaderCell>
                    <TableHeaderCell>Health</TableHeaderCell>
                    <TableHeaderCell align="right">Actions</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((contact) => (
                      <ContactRow
                        key={contact.id}
                        contact={contact}
                        isSelected={selectedContactId === contact.id}
                        onSelect={handleSelectContact}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        }
        detail={
          selectedContactId ? (
            <div className="flex-1 overflow-y-auto">
              <ContactDetails id={selectedContactId} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-secondary">
              <div className="text-center">
                <i className="fa-solid fa-hand-pointer text-4xl mb-4"></i>
                <p>Select a contact from the list to view details</p>
              </div>
            </div>
          )
        }
        showDetail={showDetail}
        onBack={handleBackToList}
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

