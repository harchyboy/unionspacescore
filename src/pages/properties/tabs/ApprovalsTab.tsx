import type { Property } from '../../../types/property';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell } from '../../../components/ui/Table';
import { Chip } from '../../../components/ui/Chip';
import { Button } from '../../../components/ui/Button';

interface ApprovalsTabProps {
  property: Property;
}

export function ApprovalsTab(_props: ApprovalsTabProps) {
  // Props available for future use
  void _props;
  // Mock approval data
  const approvals = [
    {
      id: '1',
      requester: 'John Smith',
      role: 'Deal Manager',
      requestedTerms: '5 year lease, break at year 3',
      status: 'Pending',
      requestedAt: '2024-12-10',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#252525]">Approvals</h2>
        <Button variant="primary" size="md">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Request Approval</span>
        </Button>
      </div>

      {approvals.length === 0 ? (
        <div className="text-center py-12 text-[#8e8e8e]">No approval requests</div>
      ) : (
        <Table>
          <TableHeader>
            <TableHeaderCell>Requester</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Requested Terms</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Requested</TableHeaderCell>
            <TableHeaderCell align="right">Actions</TableHeaderCell>
          </TableHeader>
          <TableBody>
            {approvals.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell>{approval.requester}</TableCell>
                <TableCell>{approval.role}</TableCell>
                <TableCell>{approval.requestedTerms}</TableCell>
                <TableCell>
                  <Chip variant={approval.status === 'Pending' ? 'warning' : 'success'}>
                    {approval.status}
                  </Chip>
                </TableCell>
                <TableCell>{approval.requestedAt}</TableCell>
                <TableCell align="right">
                  <button className="text-sm text-[#252525] underline">View Timeline</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

