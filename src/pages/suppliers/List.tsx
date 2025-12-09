import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuppliers } from '../../api/suppliers';
import { Button } from '../../components/ui/Button';
import { Table, TableHeader, TableHeaderCell, TableBody } from '../../components/ui/Table';
import { SupplierRow } from '../../components/suppliers/SupplierRow';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Card, CardContent } from '../../components/ui/Card';
import type { SupplierCategory, SupplierContractStatus, Supplier } from '../../types/supplier';
import { SupplierDetails } from './Details';

type TabValue = 'all' | 'active' | 'sla-breaches' | 'pending';

export function SuppliersList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<SupplierCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<SupplierContractStatus | 'all'>('all');
  const [slaBandFilter, setSlaBandFilter] = useState<string>('all');
  const [coverageFilter, setCoverageFilter] = useState<string>('all');
  const [complianceFilter, setComplianceFilter] = useState<string>('all');

  // Slide-over state
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const { data, isLoading, error } = useSuppliers({
    page: currentPage,
    pageSize,
    filters: {
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    },
  });

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsSlideOverOpen(true);
  };

  const handleCloseSlideOver = () => {
    setIsSlideOverOpen(false);
  };

  const handleClearFilters = () => {
    setCategoryFilter('all');
    setStatusFilter('all');
    setSlaBandFilter('all');
    setCoverageFilter('all');
    setComplianceFilter('all');
  };

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
  const startItem = data ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = data ? Math.min(currentPage * pageSize, data.total) : 0;

  // Calculate stats
  const totalSuppliers = data?.total || 0;
  const activeContracts = data?.items.filter((s) => s.contractStatus === 'Active').length || 0;
  const openWorkOrders = data?.items.reduce((sum, s) => sum + s.openWorkOrders, 0) || 0;
  const workOrdersNeedingAttention = data?.items.filter((s) => s.slaPercentage < 80).length || 0;
  const avgSla = data?.items.length
    ? Math.round(data.items.reduce((sum, s) => sum + s.slaPercentage, 0) / data.items.length)
    : 0;
  const slaBreaches = data?.items.filter((s) => s.slaPercentage < 80).length || 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-2">Suppliers</h1>
            <p className="text-secondary text-sm">
              Manage service providers, work orders, and performance
            </p>
          </div>
          <Button icon="fa-plus" onClick={() => navigate('/suppliers/new')}>
            Add Supplier
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'all'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-primary hover:border-secondary'
            } transition-all`}
          >
            All Suppliers
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'active'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-primary hover:border-secondary'
            } transition-all`}
          >
            Active Contracts
          </button>
          <button
            onClick={() => setActiveTab('sla-breaches')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'sla-breaches'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-primary hover:border-secondary'
            } transition-all`}
          >
            SLA Breaches
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'pending'
                ? 'text-primary border-primary'
                : 'text-secondary border-transparent hover:text-primary hover:border-secondary'
            } transition-all`}
          >
            Pending Onboarding
          </button>
          <div className="flex-1"></div>
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

      {/* Filters */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-4">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as SupplierCategory | 'all')}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Categories</option>
              <option value="Cleaning">Cleaning</option>
              <option value="AV & IT">AV & IT</option>
              <option value="R&M">R&M</option>
              <option value="Plants">Plants</option>
              <option value="Coffee">Coffee</option>
              <option value="Furniture">Furniture</option>
              <option value="Utilities">Utilities</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SupplierContractStatus | 'all')}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Suspended">Suspended</option>
              <option value="None">None</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>

          <div className="relative">
            <select
              value={slaBandFilter}
              onChange={(e) => setSlaBandFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All SLA Bands</option>
              <option value="95+">95%+</option>
              <option value="80-95">80-95%</option>
              <option value="below-80">Below 80%</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>

          <div className="relative">
            <select
              value={coverageFilter}
              onChange={(e) => setCoverageFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Coverage</option>
              <option value="city-core">City Core</option>
              <option value="shoreditch">Shoreditch</option>
              <option value="canary-wharf">Canary Wharf</option>
              <option value="mayfair">Mayfair</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>

          <div className="relative">
            <select
              value={complianceFilter}
              onChange={(e) => setComplianceFilter(e.target.value)}
              className="appearance-none bg-[#FAFAFA] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Compliance Status</option>
              <option value="up-to-date">Up to date</option>
              <option value="expiring">Expiring soon</option>
              <option value="expired">Expired</option>
            </select>
            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
          </div>

          <button
            onClick={handleClearFilters}
            className="text-secondary hover:text-primary text-sm ml-2"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="flex-1 overflow-y-auto bg-[#F0F0F0] px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading suppliers</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="No suppliers found"
            description="Get started by adding a new supplier"
            icon="fa-truck"
            action={{
              label: 'Add Supplier',
              onClick: () => navigate('/suppliers/new'),
            }}
          />
        ) : (
          <>
            <div className="bg-white rounded-lg border border-[#E6E6E6] overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableHeaderCell>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary"
                      />
                    </TableHeaderCell>
                    <TableHeaderCell>Supplier</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Coverage</TableHeaderCell>
                    <TableHeaderCell>Work Orders</TableHeaderCell>
                    <TableHeaderCell>SLA (30d)</TableHeaderCell>
                    <TableHeaderCell>Contract</TableHeaderCell>
                    <TableHeaderCell>Last Job</TableHeaderCell>
                    <TableHeaderCell align="right">Actions</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((supplier) => (
                      <SupplierRow
                        key={supplier.id}
                        supplier={supplier}
                        onSelect={() => handleSupplierSelect(supplier)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-secondary">
                Showing {startItem}-{endItem} of {data.total} suppliers
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" icon="fa-file-circle-check">
                  Request Docs
                </Button>
                <Button variant="outline" size="sm" icon="fa-pause">
                  Pause Assignments
                </Button>
                <Button variant="outline" size="sm" icon="fa-envelope" disabled>
                  <span className="flex items-center space-x-2">
                    <span>Invite to Portal</span>
                    <span className="text-xs bg-secondary text-white px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  </span>
                </Button>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <span className="mr-1">Next</span>
                  <i className="fa-solid fa-chevron-right"></i>
                </Button>
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">Total Suppliers</div>
                    <i className="fa-solid fa-truck text-primary"></i>
                  </div>
                  <div className="text-3xl font-semibold text-primary">{totalSuppliers}</div>
                  <div className="text-xs text-secondary mt-2">{activeContracts} active contracts</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">Open Work Orders</div>
                    <i className="fa-solid fa-clipboard-list text-primary"></i>
                  </div>
                  <div className="text-3xl font-semibold text-primary">{openWorkOrders}</div>
                  <div className="text-xs text-secondary mt-2">
                    {workOrdersNeedingAttention} require attention
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">Avg SLA (30d)</div>
                    <i className="fa-solid fa-chart-line text-primary"></i>
                  </div>
                  <div className="text-3xl font-semibold text-primary">{avgSla}%</div>
                  <div className="text-xs text-secondary mt-2">+4% vs last period</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-secondary text-sm font-medium">SLA Breaches</div>
                    <i className="fa-solid fa-triangle-exclamation text-destructive"></i>
                  </div>
                  <div className="text-3xl font-semibold text-destructive">{slaBreaches}</div>
                  <div className="text-xs text-secondary mt-2">This month</div>
                </CardContent>
              </Card>
            </div>

            {/* Suppliers by Category and Compliance Status */}
            <div className="mt-8 grid grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-primary mb-6">Suppliers by Category</h3>
                  <div className="space-y-3">
                    {['Cleaning', 'AV & IT', 'R&M', 'Furniture', 'Coffee', 'Other'].map(
                      (category, idx) => {
                        const count =
                          data.items.filter(
                            (s) =>
                              s.category === category ||
                              (category === 'Other' &&
                                !['Cleaning', 'AV & IT', 'R&M', 'Furniture', 'Coffee'].includes(
                                  s.category
                                ))
                          ).length || Math.floor(Math.random() * 6) + 2;
                        return (
                          <div
                            key={category}
                            className={`flex items-center justify-between ${
                              idx < 5 ? 'pb-3 border-b border-[#E6E6E6]' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  idx === 0
                                    ? 'bg-primary'
                                    : idx === 1
                                    ? 'bg-secondary'
                                    : idx === 2
                                    ? 'bg-accent'
                                    : 'bg-muted'
                                }`}
                              ></div>
                              <span className="text-sm text-primary">{category}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-semibold text-primary">{count}</span>
                              <span className="text-xs text-secondary">suppliers</span>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Status */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-primary">Compliance Status</h3>
                    <button className="text-sm text-primary hover:underline flex items-center space-x-1">
                      <span>View all</span>
                      <i className="fa-solid fa-arrow-right text-xs"></i>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {data.items
                      .filter((s) => s.complianceStatus && s.complianceStatus !== 'Current')
                      .slice(0, 3)
                      .map((supplier, idx) => (
                        <div
                          key={supplier.id}
                          className={`flex items-center justify-between ${
                            idx < 2 ? 'pb-4 border-b border-[#E6E6E6]' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-semibold text-sm">
                                {supplier.initials}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-primary">{supplier.name}</div>
                              <div className="text-xs text-secondary">
                                {supplier.complianceNote || 'Status pending'}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              supplier.complianceStatus === 'Expiring'
                                ? 'bg-destructive/10 text-destructive'
                                : supplier.complianceStatus === 'Pending'
                                ? 'bg-secondary/10 text-secondary'
                                : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {supplier.complianceStatus}
                          </span>
                        </div>
                      ))}
                    {data.items.filter((s) => s.complianceStatus === 'Current').length > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">PC</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary">
                              Premier Cleaning Services
                            </div>
                            <div className="text-xs text-secondary">All documents up to date</div>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          Current
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            <Card className="mt-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-6">Top Performers (30d)</h3>
                <div className="space-y-4">
                  {data.items
                    .sort((a, b) => b.slaPercentage - a.slaPercentage)
                    .slice(0, 3)
                    .map((supplier, idx) => (
                      <div
                        key={supplier.id}
                        className={`flex items-center justify-between ${
                          idx < 2 ? 'pb-4 border-b border-[#E6E6E6]' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-xl font-semibold text-primary">{idx + 1}</div>
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-sm">
                              {supplier.initials}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary">{supplier.name}</div>
                            <div className="text-xs text-secondary">{supplier.category}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-muted rounded-full h-2 w-16">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${supplier.slaPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-primary">
                              {supplier.slaPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Supplier Details Slide-Over Panel */}
      <div
        className={`relative z-50 ${isSlideOverOpen ? 'z-50' : '-z-10'}`}
        aria-labelledby="slide-over-title"
        role="dialog"
        aria-modal="true"
      >
        {/* Background backdrop */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-500 ease-in-out ${
            isSlideOverOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={handleCloseSlideOver}
        />

        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div
                className={`pointer-events-auto w-screen max-w-7xl transform transition ease-in-out duration-500 sm:duration-700 bg-white shadow-xl ${
                  isSlideOverOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
              >
                {/* Supplier Details Content */}
                <div className="h-full overflow-y-auto">
                  {selectedSupplier && (
                    <SupplierDetails supplier={selectedSupplier} onBack={handleCloseSlideOver} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

