import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyStore } from '../../store/useCompanyStore';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../components/ui/Table';
import type { CompanyType, CompanyStatus } from '../../types/company';

export function CompaniesList() {
  const navigate = useNavigate();
  const { companies } = useCompanyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<CompanyType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || company.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || company.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [companies, searchQuery, typeFilter, statusFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#F0F0F0]">
      {/* Page Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-primary mb-2">Companies</h1>
            <p className="text-secondary text-sm">
              Manage company relationships and track performance
            </p>
          </div>
          <Button
            icon="fa-plus"
            onClick={() => navigate('/contacts/companies/new')}
          >
            Add company
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-6 flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <SearchInput
              placeholder="Search by company name..."
              onSearch={setSearchQuery}
            />
          </div>
          <Select
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'Agency', label: 'Agency' },
              { value: 'Landlord', label: 'Landlord' },
              { value: 'Supplier', label: 'Supplier' },
              { value: 'Client', label: 'Client' },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as CompanyType | 'all')}
            className="w-48"
          />
          <Select
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Dormant', label: 'Dormant' },
              { value: 'Prospect', label: 'Prospect' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CompanyStatus | 'all')}
            className="w-48"
          />
        </div>
      </div>

      {/* Companies Table */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="bg-white rounded-lg border border-[#E6E6E6] overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableHeaderCell>Company name</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Relationship owner</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell align="right">Total viewings YTD</TableHeaderCell>
                <TableHeaderCell align="right">Total deals YTD</TableHeaderCell>
                <TableHeaderCell align="right">Revenue YTD</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-secondary">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow
                      key={company.id}
                      onClick={() => navigate(`/contacts/companies/${company.id}`)}
                      className="cursor-pointer hover:bg-muted transition-colors"
                    >
                      <TableCell className="font-medium text-primary">
                        {company.name}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 bg-muted text-primary text-xs font-medium rounded">
                          {company.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-secondary">
                        {company.relationshipOwner}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                            company.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : company.status === 'Dormant'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {company.status}
                        </span>
                      </TableCell>
                      <TableCell align="right" className="text-secondary">
                        {company.totalViewingsYTD}
                      </TableCell>
                      <TableCell align="right" className="text-secondary">
                        {company.totalDealsYTD}
                      </TableCell>
                      <TableCell align="right" className="font-medium text-primary">
                        {formatCurrency(company.totalRevenueYTD)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

