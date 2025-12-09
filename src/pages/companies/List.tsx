import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCompanies } from '../../api/companies';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody } from '../../components/ui/Table';
import { CompanyRow } from '../../components/companies/CompanyRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import type { CompanyType, Company } from '../../types/company';

// Tab configuration
const COMPANY_TABS = [
  { value: 'all', label: 'All Companies' },
  { value: 'Brokerage', label: 'Brokerages' },
  { value: 'Landlord', label: 'Landlords' },
  { value: 'Tenant', label: 'Tenants' },
  { value: 'Supplier', label: 'Suppliers' },
] as const;

type CompanyTabValue = typeof COMPANY_TABS[number]['value'];

export function CompaniesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get initial active tab from URL or default to all
  const getInitialTab = (): CompanyTabValue => {
    const urlTab = searchParams.get('type');
    const validTabs = COMPANY_TABS.map(t => t.value);
    if (urlTab && validTabs.includes(urlTab as CompanyTabValue)) {
      return urlTab as CompanyTabValue;
    }
    return 'all';
  };

  const [activeTab, setActiveTab] = useState<CompanyTabValue>(getInitialTab());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const { toasts, removeToast } = useToast();
  
  // Slide-over state for company details
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setIsSlideOverOpen(true);
  };
  
  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false);
  };

  // Get the type filter based on active tab
  const getTypeFilterForTab = (): CompanyType | undefined => {
    if (activeTab === 'all') return undefined;
    return activeTab as CompanyType;
  };

  // Sync active tab with URL
  useEffect(() => {
    const urlTab = searchParams.get('type');
    const validTabs = COMPANY_TABS.map(t => t.value);
    if (urlTab && validTabs.includes(urlTab as CompanyTabValue)) {
      if (activeTab !== urlTab) {
        setActiveTab(urlTab as CompanyTabValue);
      }
    }
  }, [searchParams, activeTab]);

  const { data, isLoading, error } = useCompanies({
    page: currentPage,
    pageSize: pageSize,
    filters: {
      type: getTypeFilterForTab(),
      query: searchQuery || undefined,
    },
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
  const startItem = data ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = data ? Math.min(currentPage * pageSize, data.total) : 0;

  const handleClearFilters = () => {
    setSearchQuery('');
    setIndustryFilter('all');
    setCityFilter('all');
    const params = new URLSearchParams();
    if (activeTab !== 'all') {
      params.set('type', activeTab);
    }
    setSearchParams(params);
  };

  const handleTabChange = (tab: string) => {
    const tabValue = tab as CompanyTabValue;
    setActiveTab(tabValue);
    const params = new URLSearchParams(searchParams);
    if (tabValue === 'all') {
      params.delete('type');
    } else {
      params.set('type', tabValue);
    }
    if (searchQuery) {
      params.set('query', searchQuery);
    }
    setSearchParams(params, { replace: false });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-2">Companies</h1>
            <p className="text-secondary text-sm">
              Manage brokerages, landlords, tenants, and supplier organizations
            </p>
          </div>
          <Button
            icon="fa-plus"
            onClick={() => navigate('/companies/new')}
          >
            Add Company
          </Button>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <Tabs key={activeTab} defaultTab={activeTab} onTabChange={handleTabChange}>
            <div className="flex items-center justify-between">
              <TabsList>
                {COMPANY_TABS.map((tab) => (
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
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary"></i>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative flex-shrink-0">
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Industries</option>
              <option value="real-estate">Real Estate</option>
              <option value="technology">Technology</option>
              <option value="finance">Finance</option>
              <option value="professional-services">Professional Services</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>
          <div className="relative flex-shrink-0">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Cities</option>
              <option value="london">London</option>
              <option value="manchester">Manchester</option>
              <option value="birmingham">Birmingham</option>
              <option value="leeds">Leeds</option>
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

      {/* Companies List */}
      <div className="flex-1 overflow-y-auto bg-[#F0F0F0] px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading companies</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="No companies found"
            description="Get started by adding a new company"
            icon="fa-building"
            action={{
              label: 'Add Company',
              onClick: () => navigate('/companies/new'),
            }}
          />
        ) : (
          <>
            <div className="bg-white rounded-lg border border-[#E6E6E6] overflow-hidden">
              {/* Top pagination info */}
              <div className="px-4 py-3 border-b border-[#E6E6E6] bg-[#FAFAFA]">
                <div className="text-sm text-secondary">
                  Showing {startItem}-{endItem} of {data.total || data.items.length} companies
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
                    <TableHeaderCell>Company</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Location</TableHeaderCell>
                    <TableHeaderCell>Website</TableHeaderCell>
                    <TableHeaderCell>Phone</TableHeaderCell>
                    <TableHeaderCell>Contacts</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((company) => (
                      <CompanyRow
                        key={company.id}
                        company={company}
                        onSelect={() => handleCompanySelect(company)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Bottom pagination info */}
              <div className="px-4 py-3 border-t border-[#E6E6E6] bg-[#FAFAFA]">
                <div className="text-sm text-secondary">
                  Showing {startItem}-{endItem} of {data.total || data.items.length} companies
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
                    <div className="text-secondary text-sm font-medium">Total Companies</div>
                    <i className="fa-solid fa-building text-primary"></i>
                  </div>
                  <div className="text-3xl font-semibold text-primary">{data.total || '-'}</div>
                  <div className="text-xs text-secondary mt-2">-</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">Brokerages</div>
                    <i className="fa-solid fa-briefcase text-primary"></i>
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
                    <div className="text-secondary text-sm font-medium">Suppliers</div>
                    <i className="fa-solid fa-truck text-primary"></i>
                  </div>
                  <div className="text-3xl font-semibold text-primary">-</div>
                  <div className="text-xs text-secondary mt-2">-</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-secondary">-</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      {/* Company Details Slide-Over Panel */}
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
                className={`pointer-events-auto w-screen max-w-2xl transform transition ease-in-out duration-500 sm:duration-700 bg-white shadow-xl ${isSlideOverOpen ? 'translate-x-0' : 'translate-x-full'}`}
              >
                {/* Company Details Content */}
                <div className="h-full overflow-y-auto">
                  {selectedCompany && (
                    <div>
                      {/* Header */}
                      <div className="bg-white border-b border-[#E6E6E6] px-6 py-4 sticky top-0 z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white text-lg font-semibold">
                              {selectedCompany.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <h2 className="text-xl font-semibold text-primary">{selectedCompany.name}</h2>
                              {selectedCompany.type && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                  selectedCompany.type === 'Brokerage' ? 'bg-black text-white' :
                                  selectedCompany.type === 'Landlord' ? 'bg-secondary text-white' :
                                  selectedCompany.type === 'Tenant' ? 'bg-accent text-white' :
                                  'bg-muted text-primary'
                                }`}>
                                  {selectedCompany.type}
                                </span>
                              )}
                            </div>
                          </div>
                          <button 
                            onClick={handleCloseSlideOver}
                            className="text-secondary hover:text-primary p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <i className="fa-solid fa-times text-lg"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        {/* Company Info */}
                        <div className="bg-[#FAFAFA] rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Company Information</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Industry</label>
                              <p className="text-sm text-primary">{selectedCompany.industry || '-'}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Location</label>
                              <p className="text-sm text-primary">{selectedCompany.city || '-'}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Website</label>
                              {selectedCompany.website ? (
                                <a 
                                  href={selectedCompany.website.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  {selectedCompany.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                </a>
                              ) : (
                                <p className="text-sm text-primary">-</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Phone</label>
                              <p className="text-sm text-primary">{selectedCompany.phone || '-'}</p>
                            </div>
                          </div>
                          {selectedCompany.description && (
                            <div className="mt-4 pt-4 border-t border-[#E6E6E6]">
                              <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-1">Description</label>
                              <p className="text-sm text-primary">{selectedCompany.description}</p>
                            </div>
                          )}
                        </div>

                        {/* Contacts Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">
                              Contacts ({selectedCompany.contacts?.length || selectedCompany.contactCount || 0})
                            </h3>
                            <button className="text-sm text-primary hover:underline flex items-center space-x-1">
                              <i className="fa-solid fa-plus text-xs"></i>
                              <span>Add Contact</span>
                            </button>
                          </div>
                          
                          {selectedCompany.contacts && selectedCompany.contacts.length > 0 ? (
                            <div className="space-y-3">
                              {selectedCompany.contacts.map((contact) => (
                                <div 
                                  key={contact.id} 
                                  className="bg-white border border-[#E6E6E6] rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                                  onClick={() => navigate(`/contacts/${contact.id}`)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                        {contact.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                      </div>
                                      <div>
                                        <div className="font-medium text-primary">{contact.name}</div>
                                        {contact.role && (
                                          <div className="text-xs text-secondary">{contact.role}</div>
                                        )}
                                      </div>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-secondary text-xs mt-3"></i>
                                  </div>
                                  {contact.email && (
                                    <div className="mt-3 pt-3 border-t border-[#E6E6E6] flex items-center space-x-4">
                                      <a 
                                        href={`mailto:${contact.email}`}
                                        className="text-sm text-secondary hover:text-primary flex items-center space-x-2"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <i className="fa-solid fa-envelope text-xs"></i>
                                        <span>{contact.email}</span>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-[#FAFAFA] rounded-lg p-8 text-center">
                              <i className="fa-solid fa-users text-3xl text-secondary mb-3"></i>
                              <p className="text-sm text-secondary">No contacts associated with this company</p>
                              <button className="mt-3 text-sm text-primary hover:underline">
                                Add first contact
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="pt-4 border-t border-[#E6E6E6]">
                          <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Quick Actions</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => navigate(`/companies/${selectedCompany.id}`)}
                              className="flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                            >
                              <i className="fa-solid fa-eye"></i>
                              <span>View Full Profile</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-[#E6E6E6] text-primary rounded-lg hover:bg-muted transition-colors">
                              <i className="fa-solid fa-envelope"></i>
                              <span>Send Email</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-[#E6E6E6] text-primary rounded-lg hover:bg-muted transition-colors">
                              <i className="fa-solid fa-phone"></i>
                              <span>Log Call</span>
                            </button>
                            <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-[#E6E6E6] text-primary rounded-lg hover:bg-muted transition-colors">
                              <i className="fa-solid fa-handshake"></i>
                              <span>Create Deal</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
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
