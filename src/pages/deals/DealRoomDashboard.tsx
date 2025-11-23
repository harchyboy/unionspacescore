import { useState, useMemo } from 'react';
import { useDeals } from '../../api/deals';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table, TableHeader, TableHeaderCell, TableBody } from '../../components/ui/Table';
import { DealRow } from '../../components/deals/DealRow';
import { DealCard } from '../../components/deals/DealCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { DealRoomFilters, DealRoomDeal, DealRoomStage, DealType } from '../../types/dealRoomDashboard';

type SortField = 'stage' | 'owner' | 'property' | 'value' | 'nextStep' | 'updated';
type SortOrder = 'asc' | 'desc';

const STAGE_OPTIONS: { value: DealRoomStage | 'all'; label: string }[] = [
  { value: 'all', label: 'All Stages' },
  { value: 'Inquiry', label: 'Inquiry' },
  { value: 'Viewing', label: 'Viewing' },
  { value: 'Heads of Terms', label: 'Heads of Terms' },
  { value: 'Legals', label: 'Legals' },
  { value: 'Signed', label: 'Signed' },
  { value: 'Lost', label: 'Lost' },
];

const DEAL_TYPE_OPTIONS: { value: DealType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'All inclusive', label: 'All inclusive' },
  { value: 'Bolt on', label: 'Bolt on' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function sortDeals(deals: DealRoomDeal[], sortField: SortField, sortOrder: SortOrder): DealRoomDeal[] {
  const sorted = [...deals];

  sorted.sort((a, b) => {
    let aValue: string | number | Date | undefined;
    let bValue: string | number | Date | undefined;

    switch (sortField) {
      case 'stage':
        aValue = a.stage;
        bValue = b.stage;
        break;
      case 'owner':
        aValue = a.owner.name;
        bValue = b.owner.name;
        break;
      case 'property':
        aValue = a.property.name;
        bValue = b.property.name;
        break;
      case 'value':
        aValue = a.commercial.monthlyRent || a.commercial.totalAnnualValue || 0;
        bValue = b.commercial.monthlyRent || b.commercial.totalAnnualValue || 0;
        break;
      case 'nextStep':
        // For "most urgent first", sort by next step date (ascending), then by updated date if no next step
        if (a.nextStep?.date && b.nextStep?.date) {
          aValue = new Date(a.nextStep.date);
          bValue = new Date(b.nextStep.date);
        } else if (a.nextStep?.date) {
          return -1; // a has date, b doesn't - a comes first
        } else if (b.nextStep?.date) {
          return 1; // b has date, a doesn't - b comes first
        } else {
          // Neither has date, sort by updated date (most recent first)
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          return bValue.getTime() - aValue.getTime();
        }
        break;
      case 'updated':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      default:
        return 0;
    }

    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

export function DealRoomDashboard() {
  const [filters, setFilters] = useState<DealRoomFilters>({
    stage: 'all',
    owner: 'all',
    dealType: 'all',
    property: 'all',
    search: '',
  });
  const [sortField, setSortField] = useState<SortField>('nextStep');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useDeals(filters);

  // Get unique owners and properties for filter options
  const ownerOptions = useMemo(() => {
    if (!data?.deals) return [];
    const owners = new Map<string, string>();
    data.deals.forEach((deal) => {
      owners.set(deal.owner.id, deal.owner.name);
    });
    return Array.from(owners.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [data?.deals]);

  const propertyOptions = useMemo(() => {
    if (!data?.deals) return [];
    const properties = new Map<string, string>();
    data.deals.forEach((deal) => {
      properties.set(deal.property.id, deal.property.name);
    });
    return Array.from(properties.entries()).map(([id, name]) => ({ value: id, label: name }));
  }, [data?.deals]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key: keyof DealRoomFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedDeals = useMemo(() => {
    if (!data?.deals) return [];
    return sortDeals(data.deals, sortField, sortOrder);
  }, [data?.deals, sortField, sortOrder]);

  const handleCreateDeal = () => {
    // Stub for now
    console.log('Create new deal clicked');
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F0F0F0]">
      {/* Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-2">Deals</h1>
            <p className="text-secondary text-sm">All live deals in the pipeline</p>
          </div>
          <Button icon="fa-plus" onClick={handleCreateDeal}>
            Create new deal
          </Button>
        </div>
      </div>

      {/* Metrics Strip */}
      {data?.summary && (
        <div className="bg-white border-b border-[#E6E6E6] px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-secondary mb-1">Total Open Deals</div>
              <div className="text-2xl font-semibold text-primary">{data.summary.totalOpenDeals}</div>
            </div>
            <div>
              <div className="text-sm text-secondary mb-1">Total Monthly Value</div>
              <div className="text-2xl font-semibold text-primary">
                {formatCurrency(data.summary.totalMonthlyValue)}
              </div>
            </div>
            <div>
              <div className="text-sm text-secondary mb-1">Average Days in Stage</div>
              <div className="text-2xl font-semibold text-primary">
                {data.summary.averageDaysInStage} days
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              placeholder="Search deal name, tenant or requirement code..."
              onSearch={handleSearch}
              value={searchQuery}
            />
          </div>
          <Select
            options={STAGE_OPTIONS}
            value={filters.stage || 'all'}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
            className="w-48"
          />
          <Select
            options={[
              { value: 'all', label: 'All Owners' },
              ...ownerOptions,
            ]}
            value={filters.owner || 'all'}
            onChange={(e) => handleFilterChange('owner', e.target.value)}
            className="w-48"
          />
          <Select
            options={DEAL_TYPE_OPTIONS}
            value={filters.dealType || 'all'}
            onChange={(e) => handleFilterChange('dealType', e.target.value)}
            className="w-48"
          />
          <Select
            options={[
              { value: 'all', label: 'All Properties' },
              ...propertyOptions,
            ]}
            value={filters.property || 'all'}
            onChange={(e) => handleFilterChange('property', e.target.value)}
            className="w-48"
          />
          {(filters.stage !== 'all' ||
            filters.owner !== 'all' ||
            filters.dealType !== 'all' ||
            filters.property !== 'all' ||
            filters.search) && (
            <button
              onClick={() => {
                setFilters({
                  stage: 'all',
                  owner: 'all',
                  dealType: 'all',
                  property: 'all',
                  search: '',
                });
                setSearchQuery('');
              }}
              className="text-secondary hover:text-primary text-sm"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error loading deals</p>
          </div>
        ) : !sortedDeals || sortedDeals.length === 0 ? (
          <EmptyState
            title="No deals found"
            description="Get started by creating a new deal"
            icon="fa-handshake"
            action={{
              label: 'Create new deal',
              onClick: handleCreateDeal,
            }}
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg border border-[#E6E6E6] overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableHeaderCell>Deal Name</TableHeaderCell>
                    <TableHeaderCell
                      className="cursor-pointer hover:bg-[#fafafa]"
                      onClick={() => handleSort('property')}
                    >
                      Property
                      {sortField === 'property' && (
                        <i
                          className={`fa-solid fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-2 text-xs`}
                        ></i>
                      )}
                    </TableHeaderCell>
                    <TableHeaderCell>Tenant</TableHeaderCell>
                    <TableHeaderCell
                      className="cursor-pointer hover:bg-[#fafafa]"
                      onClick={() => handleSort('stage')}
                    >
                      Stage
                      {sortField === 'stage' && (
                        <i
                          className={`fa-solid fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-2 text-xs`}
                        ></i>
                      )}
                    </TableHeaderCell>
                    <TableHeaderCell
                      className="cursor-pointer hover:bg-[#fafafa]"
                      onClick={() => handleSort('owner')}
                    >
                      Owner
                      {sortField === 'owner' && (
                        <i
                          className={`fa-solid fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-2 text-xs`}
                        ></i>
                      )}
                    </TableHeaderCell>
                    <TableHeaderCell
                      className="text-right cursor-pointer hover:bg-[#fafafa]"
                      onClick={() => handleSort('value')}
                    >
                      Commercial
                      {sortField === 'value' && (
                        <i
                          className={`fa-solid fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-2 text-xs`}
                        ></i>
                      )}
                    </TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell
                      className="cursor-pointer hover:bg-[#fafafa]"
                      onClick={() => handleSort('nextStep')}
                    >
                      Next Step
                      {sortField === 'nextStep' && (
                        <i
                          className={`fa-solid fa-sort-${sortOrder === 'asc' ? 'up' : 'down'} ml-2 text-xs`}
                        ></i>
                      )}
                    </TableHeaderCell>
                    <TableHeaderCell align="right">Actions</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {sortedDeals.map((deal, index) => (
                      <DealRow key={deal.id} deal={deal} index={index} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {sortedDeals.map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

