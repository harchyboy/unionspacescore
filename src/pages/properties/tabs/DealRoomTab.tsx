import type { Property } from '../../../types/property';

interface DealRoomTabProps {
  property: Property;
}

export function DealRoomTab(_props: DealRoomTabProps) {
  // Mock deal room items
  const items = [
    { id: '1', type: 'HoTs', title: 'Heads of Terms - Unit 99B-5-B', updatedAt: '2024-12-15' },
    { id: '2', type: 'Redlines', title: 'Lease Redlines v2', updatedAt: '2024-12-14' },
    { id: '3', type: 'Contract', title: 'Draft Lease Agreement', updatedAt: '2024-12-13' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <h2 className="text-xl font-semibold text-[#252525] mb-4">Deal Room</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 bg-[#fafafa] rounded-lg hover:bg-[#e6e6e6] transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#252525] rounded flex items-center justify-center">
                  <span className="text-white text-sm">
                    {item.type === 'HoTs' ? '📄' : item.type === 'Redlines' ? '✏️' : '📋'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#252525]">{item.title}</div>
                  <div className="text-xs text-[#8e8e8e]">Updated {item.updatedAt}</div>
                </div>
              </div>
              <button className="text-sm text-[#252525] underline">View</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <h2 className="text-xl font-semibold text-[#252525] mb-4">Tasks</h2>
        <div className="text-sm text-[#8e8e8e]">No tasks assigned</div>
      </div>
    </div>
  );
}

