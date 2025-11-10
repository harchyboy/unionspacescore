import type { Property } from '../../../types/property';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../../components/ui/Table';
import { Chip } from '../../../components/ui/Chip';

interface AvailabilityTabProps {
  property: Property;
}

export function AvailabilityTab({ property }: AvailabilityTabProps) {
  const availableUnits = property.units.filter((u) => u.status === 'Available' || u.status === 'Under Offer');

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 bg-white rounded-lg border border-[#E6E6E6] p-6">
        <h2 className="text-xl font-semibold text-[#252525] mb-4">Availability</h2>
        {availableUnits.length === 0 ? (
          <div className="text-center py-12 text-[#8e8e8e]">No available units</div>
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>Unit</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Earliest</TableHeaderCell>
              <TableHeaderCell>Notes</TableHeaderCell>
              <TableHeaderCell align="right">Actions</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {availableUnits.map((unit) => (
                <TableRow key={unit.id}>
                  <TableCell>
                    <div className="text-sm font-semibold text-[#252525]">{unit.code}</div>
                  </TableCell>
                  <TableCell>
                    <Chip variant={unit.status === 'Available' ? 'accent' : 'primary'}>
                      {unit.status}
                    </Chip>
                  </TableCell>
                  <TableCell>1 Dec 2025</TableCell>
                  <TableCell>{unit.fitOut} fitted</TableCell>
                  <TableCell align="right">
                    <button className="text-sm text-[#252525] underline">Book Viewing</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <h2 className="text-xl font-semibold text-[#252525] mb-4">Viewing Timeline</h2>
        <div className="text-sm text-[#8e8e8e]">No viewings scheduled</div>
      </div>
    </div>
  );
}

