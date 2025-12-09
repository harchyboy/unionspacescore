import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

const tabs = [
  { id: 'commercials', label: 'Commercials' },
  { id: 'viewings', label: 'Viewings' },
  { id: 'artifacts', label: 'Deal Artifacts' },
  { id: 'fitout', label: 'Fit-out' },
  { id: 'activity', label: 'Activity & Files' },
];

// Mock unit data
const mockUnit = {
  id: '1',
  code: '99B-04-Suite A',
  property: {
    name: '99 Bishopsgate',
    address: '99 Bishopsgate, London EC2M',
  },
  sizeSqFt: 4200,
  desks: 42,
  meetingRooms: 3,
  status: 'Available',
  pricingMode: 'All-Inclusive',
  monthlyTotal: 18500,
  pricing: {
    baseRent: 12600,
    serviceCharge: 3150,
    businessRates: 2100,
    insurance: 650,
  },
  termGuidance: {
    preferredTerm: '3-5 Years',
    breakClause: 'Month 36',
    rentReview: 'Annual RPI Cap 3%',
    deposit: '3 Months Rent',
  },
  modifications: [
    {
      id: 'm1',
      type: 'Modification',
      title: 'Additional Meeting Room',
      description: 'Client requested conversion of open area to enclosed 8-person meeting room with AV setup',
      date: '14 Nov 2024',
      requestedBy: 'Knight Frank (Broker)',
      context: 'After 2nd viewing',
    },
    {
      id: 'm2',
      type: 'Service',
      title: 'Premium AV Package',
      description: 'Upgraded AV system for all meeting rooms including video conferencing equipment',
      date: '16 Nov 2024',
      requestedBy: 'Tenant Direct',
      context: 'Direct UNION agreement',
    },
    {
      id: 'm3',
      type: 'Modification',
      title: 'Kitchen Layout Adjustment',
      description: 'Relocate coffee station and add additional refrigeration unit',
      date: '18 Nov 2024',
      requestedBy: 'Tenant Direct',
      context: 'Final viewing',
    },
  ],
  pricingImpact: [
    {
      date: '14 Nov 2024',
      item: 'Additional Meeting Room',
      type: 'Modification',
      agreement: 'Landlord Works',
      oneTimeCost: 12500,
      monthlyImpact: 420,
      status: 'Quoted',
    },
    {
      date: '16 Nov 2024',
      item: 'Premium AV Package',
      type: 'Service',
      agreement: 'UNION Direct',
      oneTimeCost: 8900,
      monthlyImpact: 350,
      status: 'Quoted',
    },
    {
      date: '18 Nov 2024',
      item: 'Kitchen Layout Adjustment',
      type: 'Modification',
      agreement: 'Landlord Works',
      oneTimeCost: 4200,
      monthlyImpact: 140,
      status: 'Pending',
    },
  ],
  notes: [
    {
      id: 'n1',
      author: 'Max Reynolds',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
      date: '20 Nov 2024, 14:32',
      content: "Tenant is flexible on term length but wants certainty on AV pricing before HoTs. Confirmed they're comfortable with UNION direct agreement for services.",
      borderColor: 'border-primary',
    },
    {
      id: 'n2',
      author: 'Tom Townsend',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
      date: '18 Nov 2024, 09:15',
      content: 'Disposal agent confirmed landlord can accommodate meeting room modification within 6 weeks. Budget agreed at £12,500 fixed price.',
      borderColor: 'border-accent',
    },
    {
      id: 'n3',
      author: 'Max Reynolds',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
      date: '15 Nov 2024, 16:48',
      content: 'Initial proposal sent at base pricing. Awaiting feedback on modifications before revising commercial terms for HoTs.',
      borderColor: 'border-secondary',
    },
  ],
};

export function UnitDetails() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('commercials');
  const [isLoading] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animation on ID change
    setAnimationKey(prev => prev + 1);
  }, [id]);

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExiting(true);
    // Navigate after animation completes
    setTimeout(() => {
      navigate('/units');
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalOneTime = mockUnit.pricingImpact.reduce((sum, item) => sum + item.oneTimeCost, 0);
  const totalMonthlyImpact = mockUnit.pricingImpact.reduce((sum, item) => sum + item.monthlyImpact, 0);

  return (
    <div 
      key={animationKey}
      className="flex flex-col h-full overflow-hidden"
      style={{
        animation: isExiting ? 'slideOut 0.3s ease-out forwards' : 'slideIn 0.3s ease-out'
      }}
    >
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
        `}
      </style>
      
      {/* Header */}
      <header className="bg-white border-b border-[#E6E6E6] px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6 flex-1">
          <button onClick={handleBackClick} className="text-secondary hover:text-primary">
            <i className="fa-solid fa-arrow-left text-lg"></i>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-secondary hover:text-primary transition-all">
            <i className="fa-solid fa-bell text-lg"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </button>
          <button className="p-2 text-secondary hover:text-primary transition-all">
            <i className="fa-solid fa-question-circle text-lg"></i>
          </button>
        </div>
      </header>

      {/* Unit Header */}
      <div className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-3xl font-semibold text-primary">{mockUnit.code}</h1>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
                {mockUnit.status}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FAFAFA] text-primary">
                {mockUnit.pricingMode}
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-secondary">
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-building"></i>
                <span>{mockUnit.property.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-ruler-combined"></i>
                <span>{mockUnit.sizeSqFt.toLocaleString()} sq ft</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-chair"></i>
                <span>{mockUnit.desks} Desks</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-door-closed"></i>
                <span>{mockUnit.meetingRooms} Meeting Rooms</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-semibold text-primary">
                £{mockUnit.monthlyTotal.toLocaleString()} <span className="text-base font-normal text-secondary">/ month</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center space-x-2">
              <i className="fa-solid fa-calendar-check"></i>
              <span>Book Viewing</span>
            </button>
            <button className="border border-primary text-primary px-6 py-2.5 rounded-lg font-medium hover:bg-[#FAFAFA] transition-all flex items-center space-x-2">
              <i className="fa-solid fa-file-contract"></i>
              <span>Create Proposal</span>
            </button>
            <button className="border border-[#E6E6E6] text-primary px-6 py-2.5 rounded-lg font-medium hover:bg-[#FAFAFA] transition-all flex items-center space-x-2">
              <i className="fa-solid fa-folder-open"></i>
              <span>Open Deal Room</span>
            </button>
            <button className="border border-[#E6E6E6] text-secondary px-4 py-2.5 rounded-lg hover:bg-[#FAFAFA] transition-all">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center space-x-4 border-t border-[#E6E6E6] pt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-secondary hover:text-primary border-transparent hover:border-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#F0F0F0] px-8 py-6">
        {activeTab === 'commercials' && (
          <div className="space-y-6">
            {/* Pricing Breakdown */}
            <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
              <h2 className="text-xl font-semibold text-primary mb-6">Pricing Breakdown</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">All-Inclusive Monthly</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-[#E6E6E6]">
                      <span className="text-sm text-primary">Base Rent</span>
                      <span className="text-sm font-semibold text-primary">£{mockUnit.pricing.baseRent.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#E6E6E6]">
                      <span className="text-sm text-primary">Service Charge</span>
                      <span className="text-sm font-semibold text-primary">£{mockUnit.pricing.serviceCharge.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#E6E6E6]">
                      <span className="text-sm text-primary">Business Rates</span>
                      <span className="text-sm font-semibold text-primary">£{mockUnit.pricing.businessRates.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-[#E6E6E6]">
                      <span className="text-sm text-primary">Building Insurance</span>
                      <span className="text-sm font-semibold text-primary">£{mockUnit.pricing.insurance.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 bg-[#FAFAFA] rounded-lg px-3 mt-3">
                      <span className="text-base font-semibold text-primary">Total Monthly</span>
                      <span className="text-base font-semibold text-primary">£{mockUnit.monthlyTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Term Guidance</h3>
                  <div className="space-y-4">
                    <div className="bg-[#FAFAFA] rounded-lg p-4">
                      <div className="text-xs text-secondary mb-1">Preferred Term</div>
                      <div className="text-lg font-semibold text-primary">{mockUnit.termGuidance.preferredTerm}</div>
                    </div>
                    <div className="bg-[#FAFAFA] rounded-lg p-4">
                      <div className="text-xs text-secondary mb-1">Break Clause</div>
                      <div className="text-lg font-semibold text-primary">{mockUnit.termGuidance.breakClause}</div>
                    </div>
                    <div className="bg-[#FAFAFA] rounded-lg p-4">
                      <div className="text-xs text-secondary mb-1">Rent Review</div>
                      <div className="text-lg font-semibold text-primary">{mockUnit.termGuidance.rentReview}</div>
                    </div>
                    <div className="bg-[#FAFAFA] rounded-lg p-4">
                      <div className="text-xs text-secondary mb-1">Deposit</div>
                      <div className="text-lg font-semibold text-primary">{mockUnit.termGuidance.deposit}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#E6E6E6]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-primary mb-1">Pricing Mode</div>
                    <div className="text-xs text-secondary">All-inclusive simplifies tenant budgeting. Bolt-on available for specific service exclusions.</div>
                  </div>
                  <button className="text-primary hover:underline text-sm font-medium">
                    Switch to Bolt-On View
                  </button>
                </div>
              </div>
            </div>

            {/* Modifications & Services */}
            <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary">Modifications & Services Requested</h2>
                <button className="text-primary hover:underline text-sm font-medium flex items-center space-x-2">
                  <i className="fa-solid fa-plus"></i>
                  <span>Log Request</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {mockUnit.modifications.map((mod) => (
                  <div key={mod.id} className="border border-[#E6E6E6] rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${mod.type === 'Modification' ? 'bg-primary text-white' : 'bg-accent text-white'}`}>
                            {mod.type}
                          </span>
                          <span className="text-sm font-semibold text-primary">{mod.title}</span>
                        </div>
                        <p className="text-sm text-secondary">{mod.description}</p>
                      </div>
                      <span className="text-xs text-secondary">{mod.date}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#E6E6E6]">
                      <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <i className="fa-solid fa-user text-secondary"></i>
                          <span className="text-secondary">Requested by:</span>
                          <span className="text-primary font-medium">{mod.requestedBy}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <i className="fa-solid fa-calendar text-secondary"></i>
                          <span className="text-secondary">{mod.context}</span>
                        </div>
                      </div>
                      <button className="text-primary hover:underline text-xs font-medium">
                        View Impact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#E6E6E6]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">Total requests logged:</span>
                  <span className="font-semibold text-primary">{mockUnit.modifications.length} items</span>
                </div>
              </div>
            </div>

            {/* Pricing Impact Ledger */}
            <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
              <h2 className="text-xl font-semibold text-primary mb-6">Pricing Impact Ledger</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FAFAFA] border-b border-[#E6E6E6]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Agreement</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">One-Time Cost</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">Monthly Impact</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E6E6]">
                    {mockUnit.pricingImpact.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#FAFAFA] transition-all">
                        <td className="px-4 py-4 text-sm text-secondary">{item.date}</td>
                        <td className="px-4 py-4 text-sm text-primary font-medium">{item.item}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${item.type === 'Modification' ? 'bg-primary text-white' : 'bg-accent text-white'}`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-primary">{item.agreement}</td>
                        <td className="px-4 py-4 text-sm text-right text-primary font-medium">£{item.oneTimeCost.toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm text-right text-primary font-medium">+£{item.monthlyImpact}</td>
                        <td className="px-4 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'Quoted' ? 'bg-accent text-white' : 'bg-secondary text-white'}`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#FAFAFA] border-t-2 border-primary">
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-sm font-semibold text-primary text-right">Total Impact</td>
                      <td className="px-4 py-4 text-sm font-semibold text-primary text-right">£{totalOneTime.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-primary text-right">+£{totalMonthlyImpact}/mo</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#E6E6E6]">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#FAFAFA] rounded-lg p-4">
                    <div className="text-xs text-secondary mb-1">Revised Monthly Total</div>
                    <div className="text-xl font-semibold text-primary">£{(mockUnit.monthlyTotal + totalMonthlyImpact).toLocaleString()}</div>
                    <div className="text-xs text-secondary mt-1">Base £{mockUnit.monthlyTotal.toLocaleString()} + £{totalMonthlyImpact} add-ons</div>
                  </div>
                  <div className="bg-[#FAFAFA] rounded-lg p-4">
                    <div className="text-xs text-secondary mb-1">One-Time Costs</div>
                    <div className="text-xl font-semibold text-primary">£{totalOneTime.toLocaleString()}</div>
                    <div className="text-xs text-secondary mt-1">Payable on completion</div>
                  </div>
                  <div className="bg-[#FAFAFA] rounded-lg p-4">
                    <div className="text-xs text-secondary mb-1">Agreement Split</div>
                    <div className="text-xl font-semibold text-primary">2 / 1</div>
                    <div className="text-xs text-secondary mt-1">Landlord / UNION direct</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commercial Notes */}
            <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-primary">Commercial Notes</h2>
                <button className="text-primary hover:underline text-sm font-medium flex items-center space-x-2">
                  <i className="fa-solid fa-plus"></i>
                  <span>Add Note</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {mockUnit.notes.map((note) => (
                  <div key={note.id} className={`border-l-4 ${note.borderColor} bg-[#FAFAFA] rounded-r-lg p-4`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <img src={note.avatar} alt={note.author} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <div className="text-sm font-semibold text-primary">{note.author}</div>
                          <div className="text-xs text-secondary">{note.date}</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-primary">{note.content}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Scenarios Comparison */}
            <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
              <h2 className="text-xl font-semibold text-primary mb-6">Pricing Scenarios Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#FAFAFA] border-b border-[#E6E6E6]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Scenario</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Mode</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">Monthly Base</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">Add-Ons</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">Total Monthly</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">One-Time</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-secondary uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6E6E6]">
                    <tr className="hover:bg-[#FAFAFA] transition-all">
                      <td className="px-4 py-4 text-sm text-primary font-medium">Base Offer</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] text-primary">All-Inclusive</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-primary">£{mockUnit.monthlyTotal.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right text-secondary">—</td>
                      <td className="px-4 py-4 text-sm text-right font-semibold text-primary">£{mockUnit.monthlyTotal.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right text-secondary">—</td>
                      <td className="px-4 py-4 text-center">
                        <button className="text-primary hover:underline text-xs font-medium">View</button>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#FAFAFA] transition-all bg-[#FAFAFA]">
                      <td className="px-4 py-4 text-sm text-primary font-medium">With Modifications</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-white">All-Inclusive</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-primary">£{mockUnit.monthlyTotal.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right text-primary">+£{totalMonthlyImpact}</td>
                      <td className="px-4 py-4 text-sm text-right font-semibold text-primary">£{(mockUnit.monthlyTotal + totalMonthlyImpact).toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right text-primary">£{totalOneTime.toLocaleString()}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-white">Current</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-[#FAFAFA] transition-all">
                      <td className="px-4 py-4 text-sm text-primary font-medium">Bolt-On Alternative</td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] text-primary">Bolt-On</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-right text-primary">£{mockUnit.pricing.baseRent.toLocaleString()}</td>
                      <td className="px-4 py-4 text-sm text-right text-primary">+£6,250</td>
                      <td className="px-4 py-4 text-sm text-right font-semibold text-primary">£18,850</td>
                      <td className="px-4 py-4 text-sm text-right text-primary">£{totalOneTime.toLocaleString()}</td>
                      <td className="px-4 py-4 text-center">
                        <button className="text-primary hover:underline text-xs font-medium">View</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#E6E6E6]">
                <div className="flex items-start space-x-3">
                  <i className="fa-solid fa-lightbulb text-accent text-lg"></i>
                  <div>
                    <div className="text-sm font-semibold text-primary mb-1">Recommendation</div>
                    <p className="text-sm text-secondary">All-Inclusive mode recommended for this tenant profile. Simplifies budgeting and aligns with their preference for consolidated billing. Bolt-On alternative available if they want direct control over service contracts.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs placeholder content */}
        {activeTab !== 'commercials' && (
          <div className="bg-white rounded-lg border border-[#E6E6E6] p-12 text-center">
            <i className="fa-solid fa-hammer text-4xl text-secondary mb-4"></i>
            <p className="text-secondary">This tab is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

