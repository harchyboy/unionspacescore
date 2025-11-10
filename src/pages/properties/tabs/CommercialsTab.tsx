import type { Property } from '../../../types/property';

interface CommercialsTabProps {
  property: Property;
}

export function CommercialsTab({ property: _property }: CommercialsTabProps) {
  return (
    <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
      <h2 className="text-xl font-semibold text-[#252525] mb-6">Commercials</h2>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-[#252525] mb-4">Pricing</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">Price per sq ft</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                placeholder="Enter price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">Service Charge</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                placeholder="Enter service charge"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">Business Rates</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                placeholder="Enter business rates"
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#252525] mb-4">Additional Costs</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">Insurance</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                placeholder="Enter insurance"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#252525] mb-2">Utilities</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
                placeholder="Enter utilities"
              />
            </div>
            <div className="pt-4 border-t border-[#E6E6E6]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-[#252525]">Total Occupancy Cost</div>
                <div className="text-lg font-semibold text-[#252525]">£0.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-[#E6E6E6]">
        <h3 className="text-lg font-semibold text-[#252525] mb-4">Fit Out Budget</h3>
        <textarea
          className="w-full px-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#252525]"
          rows={4}
          placeholder="Enter fit out budget notes..."
        />
      </div>
    </div>
  );
}

