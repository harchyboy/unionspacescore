import { useState } from 'react';
import type { Property, Unit } from '../../../types/property';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../../components/ui/Table';
import { Chip } from '../../../components/ui/Chip';

interface UnitsTabProps {
  property: Property;
}

export function UnitsTab({ property }: UnitsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredUnits = property.units.filter((unit) => {
    if (!statusFilter) return true;
    return unit.status === statusFilter;
  });

  const getStatusVariant = (status: Unit['status']) => {
    switch (status) {
      case 'Available':
        return 'accent';
      case 'Under Offer':
        return 'primary';
      case 'Let':
        return 'secondary';
      case 'Closed':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#252525]">Units</h2>
        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-[#fafafa] border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-[#252525] focus:outline-none focus:ring-2 focus:ring-[#252525]"
            aria-label="Filter units"
          >
            <option value="">All Units</option>
            <option value="Available">Available</option>
            <option value="Under Offer">Under Offer</option>
            <option value="Let">Let</option>
            <option value="Closed">Closed</option>
          </select>
          <button className="bg-[#252525] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Unit</span>
          </button>
        </div>
      </div>

      {filteredUnits.length === 0 ? (
        <div className="text-center py-12 text-[#8e8e8e]">No units found</div>
      ) : (
        <Table>
          <TableHeader>
            <TableHeaderCell>Unit</TableHeaderCell>
            <TableHeaderCell>Floor</TableHeaderCell>
            <TableHeaderCell>Size</TableHeaderCell>
            <TableHeaderCell>Desks</TableHeaderCell>
            <TableHeaderCell>Fit-out</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Price</TableHeaderCell>
            <TableHeaderCell>Lease</TableHeaderCell>
            <TableHeaderCell>Pipeline</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {filteredUnits.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell>
                  <div className="text-sm font-semibold text-[#252525]">{unit.code}</div>
                </TableCell>
                <TableCell>{unit.floor}</TableCell>
                <TableCell>{unit.sizeSqFt.toLocaleString()} sq ft</TableCell>
                <TableCell>{unit.desks}</TableCell>
                <TableCell>
                  <Chip variant="default">{unit.fitOut}</Chip>
                </TableCell>
                <TableCell>
                  <Chip variant={getStatusVariant(unit.status)}>{unit.status}</Chip>
                </TableCell>
                <TableCell>
                  {unit.pricePsf && unit.pricePcm && (
                    <div className="text-sm font-medium text-[#252525]">
                      £{unit.pricePsf} psf · £{unit.pricePcm.toLocaleString()} pcm
                    </div>
                  )}
                </TableCell>
                <TableCell>{unit.lease || '-'}</TableCell>
                <TableCell>
                  {unit.pipelineStage && (
                    <Chip variant={unit.pipelineStage === 'Closed' ? 'secondary' : 'accent'}>
                      {unit.pipelineStage}
                    </Chip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

