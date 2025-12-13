import type { Property } from '../../../types/property';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../../components/ui/Table';
import { Chip } from '../../../components/ui/Chip';
import { Button } from '../../../components/ui/Button';

interface RiskTabProps {
  property: Property;
}

export function RiskTab(_props: RiskTabProps) {
  // Props available for future use
  void _props;
  // Mock risk data
  const risks = [
    {
      id: '1',
      risk: 'EPC expiry',
      driver: 'Compliance',
      rating: 'Medium',
      mitigation: 'Renew EPC before expiry',
      owner: 'Property Manager',
      dueDate: '2024-12-31',
      status: 'Open',
    },
  ];

  const getRatingVariant = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'accent';
      default:
        return 'default';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#252525]">Risk Register</h2>
        <Button variant="primary" size="md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Risk</span>
        </Button>
      </div>

      {risks.length === 0 ? (
        <div className="text-center py-12 text-[#8e8e8e]">No risks registered</div>
      ) : (
        <Table>
          <TableHeader>
            <TableHeaderCell>Risk</TableHeaderCell>
            <TableHeaderCell>Driver</TableHeaderCell>
            <TableHeaderCell>Rating</TableHeaderCell>
            <TableHeaderCell>Mitigation</TableHeaderCell>
            <TableHeaderCell>Owner</TableHeaderCell>
            <TableHeaderCell>Due Date</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell align="right">Actions</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {risks.map((risk) => (
              <TableRow key={risk.id}>
                <TableCell>{risk.risk}</TableCell>
                <TableCell>{risk.driver}</TableCell>
                <TableCell>
                  <Chip variant={getRatingVariant(risk.rating)}>{risk.rating}</Chip>
                </TableCell>
                <TableCell>{risk.mitigation}</TableCell>
                <TableCell>{risk.owner}</TableCell>
                <TableCell>{risk.dueDate}</TableCell>
                <TableCell>
                  <Chip variant={risk.status === 'Open' ? 'warning' : 'success'}>
                    {risk.status}
                  </Chip>
                </TableCell>
                <TableCell align="right">
                  <button className="text-sm text-[#252525] underline">Edit</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

