import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContacts } from '../../api/contacts';
import { useCompanies } from '../../api/companies';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody } from '../../components/ui/Table';
import { ContactRow } from '../../components/contacts/ContactRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { ContactDetails } from './Details';
import type { ContactType, RelationshipHealth, Contact } from '../../types/contact';
import type { ContactTabValue } from '../../constants/contacts';
import {
  CONTACT_TAB_BROKERS,
  CONTACT_TAB_DISPOSAL_AGENTS,
  CONTACT_TAB_TENANT_REPS,
  CONTACT_TAB_SUPPLIERS,
  CONTACT_TABS,
} from '../../constants/contacts';

// Map tab value to contact type (direct mapping since tabs use ContactType values)
function getContactTypeForTab(tab: string): ContactType | null {
  if (tab === CONTACT_TAB_BROKERS || tab === CONTACT_TAB_DISPOSAL_AGENTS || tab === CONTACT_TAB_TENANT_REPS || tab === CONTACT_TAB_SUPPLIERS) {
    return tab as ContactType;
  }
  return null;
}

export function ContactsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial active tab from URL or default to brokers
  const getInitialTab = (): ContactTabValue => {
    const urlTab = searchParams.get('contactType');
    if (urlTab === CONTACT_TAB_BROKERS || urlTab === CONTACT_TAB_DISPOSAL_AGENTS || urlTab === CONTACT_TAB_TENANT_REPS || urlTab === CONTACT_TAB_SUPPLIERS) {
      return urlTab as ContactTabValue;
    }
    return CONTACT_TAB_BROKERS; // Default to brokers
  };

  const [activeTab, setActiveTab] = useState<ContactTabValue>(getInitialTab());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [firmFilter, setFirmFilter] = useState<string>('all');
  const [submarketFilter, setSubmarketFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<RelationshipHealth | 'all'>(
    (searchParams.get('health') as RelationshipHealth | 'all') || 'all'
  );
  const { toasts, removeToast } = useToast();
  
  // Fetch companies for the filter dropdown (synced from Zoho CRM)
  const { data: companiesData, isLoading: companiesLoading } = useCompanies({
    pageSize: 200, // Fetch up to 200 companies for the filter dropdown
  });
  
  // Slide-over state for contact details
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  
  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setIsSlideOverOpen(true);
  };
  
  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false);
    // Don't clear selectedContact immediately to preserve content during close animation
  };

  // Get the contact type filter based on active tab
  const getTypeFilterForTab = (): ContactType | undefined => {
    return getContactTypeForTab(activeTab) || undefined;
  };

  // Sync active tab with URL on mount and when URL changes
  useEffect(() => {
    const urlTab = searchParams.get('contactType');
    if (urlTab === CONTACT_TAB_BROKERS || urlTab === CONTACT_TAB_DISPOSAL_AGENTS || urlTab === CONTACT_TAB_TENANT_REPS || urlTab === CONTACT_TAB_SUPPLIERS) {
      if (activeTab !== urlTab) {
        setActiveTab(urlTab as ContactTabValue);
      }
    } else if (!urlTab) {
      // If no URL param, set default and update URL
      setActiveTab(CONTACT_TAB_BROKERS);
      const params = new URLSearchParams(searchParams);
      params.set('contactType', CONTACT_TAB_BROKERS);
      setSearchParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data, isLoading, error } = useContacts({
    page: currentPage,
    pageSize: pageSize,
    filters: {
      type: getTypeFilterForTab(),
      health: healthFilter !== 'all' ? healthFilter : undefined,
      query: searchQuery || undefined,
      company: firmFilter !== 'all' ? firmFilter : undefined,
    },
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, healthFilter, searchQuery, firmFilter]);
  
  // Sort companies alphabetically for the dropdown
  const sortedCompanies = useMemo(() => {
    if (!companiesData?.items) return [];
    return [...companiesData.items].sort((a, b) => 
      a.name.localeCompare(b.name)
    );
  }, [companiesData]);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
  const startItem = data ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = data ? Math.min(currentPage * pageSize, data.total) : 0;

  const handleHealthFilter = (value: string) => {
    const newHealth = value as RelationshipHealth | 'all';
    setHealthFilter(newHealth);
    const params = new URLSearchParams(searchParams);
    if (newHealth !== 'all') {
      params.set('health', newHealth);
    } else {
      params.delete('health');
    }
    // Preserve contactType in URL
    params.set('contactType', activeTab);
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFirmFilter('all');
    setSubmarketFilter('all');
    setActivityFilter('all');
    setHealthFilter('all');
    const params = new URLSearchParams();
    params.set('contactType', activeTab);
    setSearchParams(params);
  };

  const handleTabChange = (tab: string) => {
    const tabValue = tab as ContactTabValue;
    setActiveTab(tabValue);
    const params = new URLSearchParams(searchParams);
    params.set('contactType', tabValue);
    // Preserve other filters
    if (searchQuery) {
      params.set('query', searchQuery);
    }
    if (healthFilter !== 'all') {
      params.set('health', healthFilter);
    }
    setSearchParams(params, { replace: false });
  };

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
          <div className="flex items-center space-x-2">
            <Button
              icon="fa-plus"
              onClick={() => navigate('/contacts/new')}
            >
              Add Contact
            </Button>
            <Button
              variant="outline"
              icon="fa-refresh"
              onClick={async () => {
                try {
                  // Call the sync endpoint (no API key needed for manual sync)
                  const response = await fetch('/api/sync', { method: 'POST' });
                  const result = await response.json();
                  if (response.ok) {
                    alert(`Sync complete! ${result.results?.contacts?.synced || 0} contacts synced from Zoho CRM.`);
                    // Force a refresh of the contacts list
                    window.location.reload();
                  } else {
                    alert(`Sync failed: ${result.message || result.error || 'Unknown error'}`);
                  }
                } catch (error) {
                  console.error('Sync failed', error);
                  alert('Sync failed. Check the console for details.');
                }
              }}
            >
              Update
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <Tabs key={activeTab} defaultTab={activeTab} onTabChange={handleTabChange}>
            <div className="flex items-center justify-between">
              <TabsList>
                {CONTACT_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="flex items-center space-x-4">
                <button className="text-secondary hover:text-primary text-sm flex items-center space-x-1">
                  <i className="fa-solid fa-filter"></i>
                  <span>Filters</span>
                </button>
                <button className="text-secondary hover:text-primary text-sm flex items-center space-x-1">
                  <i className="fa-solid fa-download"></i>
                  <span>Export</span>
                </button>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            <select
              value={firmFilter}
              onChange={(e) => setFirmFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={companiesLoading}
            >
              <option value="all">All Companies</option>
              {sortedCompanies.map((company) => (
                <option key={company.id} value={company.name}>
                  {company.name}
                </option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          <div className="relative flex-shrink-0">
            <select
              value={submarketFilter}
              onChange={(e) => setSubmarketFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Submarkets</option>
              <option value="city-core">City Core</option>
              <option value="shoreditch">Shoreditch</option>
              <option value="mayfair">Mayfair</option>
              <option value="canary-wharf">Canary Wharf</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          <div className="relative flex-shrink-0">
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Activity</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          <div className="relative flex-shrink-0">
            <select
              value={healthFilter}
              onChange={(e) => handleHealthFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Relationship Health</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="needs-attention">Needs Attention</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-secondary hover:text-primary text-sm ml-2 flex-shrink-0 flex items-center space-x-1"
          >
            <i className="fa-solid fa-rotate-left text-xs"></i>
            <span>Clear all</span>
          </button>
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto bg-[#F0F0F0] px-8 py-6">
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
          <>
            <div className="bg-white rounded-lg border border-[#E6E6E6] overflow-hidden">
              {/* Top pagination info */}
              <div className="px-4 py-3 border-b border-[#E6E6E6] bg-[#FAFAFA]">
                <div className="text-sm text-secondary">
                  Showing {startItem}-{endItem} of {data.total || data.items.length} {
                    activeTab === 'Broker' ? 'brokers' :
                    activeTab === 'Disposal Agent' ? 'disposal agents' :
                    activeTab === 'Tenant' ? 'tenant reps' :
                    activeTab === 'Supplier' ? 'suppliers' :
                    'contacts'
                  }
                </div>
              </div>
              <div className="overflow-x-auto">
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
                    <TableHeaderCell>Open Items</TableHeaderCell>
                    <TableHeaderCell>Health</TableHeaderCell>
                    <TableHeaderCell align="right">Actions</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((contact) => (
                      <ContactRow
                        key={contact.id}
                        contact={contact}
                        onSelect={() => handleContactSelect(contact)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Bottom pagination info */}
              <div className="px-4 py-3 border-t border-[#E6E6E6] bg-[#FAFAFA]">
                <div className="text-sm text-secondary">
                  Showing {startItem}-{endItem} of {data.total || data.items.length} {
                    activeTab === 'Broker' ? 'brokers' :
                    activeTab === 'Disposal Agent' ? 'disposal agents' :
                    activeTab === 'Tenant' ? 'tenant reps' :
                    activeTab === 'Supplier' ? 'suppliers' :
                    'contacts'
                  }
                </div>
              </div>
            </div>

            {/* Pagination & Bulk Actions Bar */}
            <div className="mt-6 flex items-center justify-end">
              <div className="flex items-center space-x-4">
                {/* Pagination Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                    <span className="ml-1">Previous</span>
                  </Button>
                  <span className="text-sm text-secondary px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <span className="mr-1">Next</span>
                    <i className="fa-solid fa-chevron-right"></i>
                  </Button>
                </div>
                {/* Bulk Actions */}
                <div className="flex items-center space-x-2 border-l border-[#E6E6E6] pl-4">
                  <Button variant="outline" size="sm" icon="fa-envelope">
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm" icon="fa-tag">
                    Add Tags
                  </Button>
                  <Button variant="outline" size="sm" icon="fa-file-export">
                    Export Selected
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">
                      Total {
                        activeTab === 'Broker' ? 'Brokers' :
                        activeTab === 'Disposal Agent' ? 'Disposal Agents' :
                        activeTab === 'Tenant' ? 'Tenant Reps' :
                        activeTab === 'Supplier' ? 'Suppliers' :
                        'Contacts'
                      }
                    </div>
                    <i className="fa-solid fa-users text-primary"></i>
                  </div>
                  <div className="text-3xl font-semibold text-primary">{data.total || '-'}</div>
                  <div className="text-xs text-secondary mt-2">-</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">Active Brokers</div>
                    <i className="fa-solid fa-handshake text-primary"></i>
                  </div>
                  <div className="text-3xl font-semibold text-primary">-</div>
                  <div className="text-xs text-secondary mt-2">-</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">Active Tenants</div>
                    <i className="fa-solid fa-user-tie text-primary"></i>
                  </div>
                  <div className="text-3xl font-semibold text-primary">-</div>
                  <div className="text-xs text-secondary mt-2">-</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">Avg Response Time</div>
                    <i className="fa-solid fa-clock text-primary"></i>
                  </div>
                  <div className="text-3xl font-semibold text-primary">-</div>
                  <div className="text-xs text-secondary mt-2">-</div>
                </CardContent>
              </Card>
            </div>

            {/* Top Broker Performance & Relationship Health */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Top Broker Performance</CardTitle>
                    <button className="text-sm text-secondary hover:text-primary">View All</button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.items
                      .filter((c) => c.type === 'Broker')
                      .slice(0, 4)
                      .map((contact, idx) => (
                        <div
                          key={contact.id}
                          className={`flex items-center justify-between ${
                            idx < 3 ? 'pb-3 border-b border-[#E6E6E6]' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {contact.avatar ? (
                              <img
                                src={contact.avatar}
                                alt={contact.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {contact.firstName[0]}
                                {contact.lastName[0]}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-primary">
                                {contact.fullName}
                              </div>
                              <div className="text-xs text-secondary">{contact.company}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-primary">£1.2M</div>
                            <div className="text-xs text-secondary">8 conversions</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Relationship Health</CardTitle>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg">
                        30D
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-secondary hover:text-primary border border-[#E6E6E6] rounded-lg">
                        90D
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-60 flex items-center justify-center text-secondary">
                    <div className="text-center">
                      <i className="fa-solid fa-chart-bar text-4xl mb-2"></i>
                      <p>Chart placeholder</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4 pb-4 border-b border-[#E6E6E6]">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-envelope text-white text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-primary font-medium">
                        Email logged with James Parker
                      </div>
                      <div className="text-xs text-secondary mt-1">
                        Viewing scheduled for 99 Bishopsgate - 3rd floor suite
                      </div>
                      <div className="text-xs text-secondary mt-1">2 hours ago</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 pb-4 border-b border-[#E6E6E6]">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-user-plus text-white text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-primary font-medium">New contact added</div>
                      <div className="text-xs text-secondary mt-1">
                        Emma Wilson from CleanPro Services added as Supplier
                      </div>
                      <div className="text-xs text-secondary mt-1">5 hours ago</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 pb-4 border-b border-[#E6E6E6]">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-phone text-white text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-primary font-medium">Call logged with Sarah Chen</div>
                      <div className="text-xs text-secondary mt-1">
                        Discussed floorplan updates for Principal Place
                      </div>
                      <div className="text-xs text-secondary mt-1">1 day ago</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-handshake text-white text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-primary font-medium">Deal closed with Michael Roberts</div>
                      <div className="text-xs text-secondary mt-1">
                        TechCorp Ltd signed for The Leadenhall Building
                      </div>
                      <div className="text-xs text-secondary mt-1">3 days ago</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Communication Insights */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Communication Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-semibold text-primary mb-2">284</div>
                    <div className="text-sm text-secondary">Emails This Month</div>
                    <div className="text-xs text-green-600 mt-1">+12% vs last month</div>
                  </div>
                  <div className="text-center border-l border-r border-[#E6E6E6]">
                    <div className="text-3xl font-semibold text-primary mb-2">127</div>
                    <div className="text-sm text-secondary">Calls Logged</div>
                    <div className="text-xs text-green-600 mt-1">+8% vs last month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-semibold text-primary mb-2">45</div>
                    <div className="text-sm text-secondary">Meetings Scheduled</div>
                    <div className="text-xs text-red-600 mt-1">-3% vs last month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Contact Details Slide-Over Panel */}
      <div className={`relative z-50 ${isSlideOverOpen ? 'z-50' : '-z-10'}`} aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
        {/* Background backdrop */}
        <div 
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out ${isSlideOverOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={handleCloseSlideOver}
        />

        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div 
                className={`pointer-events-auto w-screen max-w-7xl transform transition ease-in-out duration-500 sm:duration-700 bg-white shadow-xl ${isSlideOverOpen ? 'translate-x-0' : 'translate-x-full'}`}
              >
                
                {/* Contact Details Content */}
                <div className="h-full overflow-y-auto">
                  {selectedContact && (
                    <ContactDetails 
                      contact={selectedContact} 
                      onBack={handleCloseSlideOver}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

