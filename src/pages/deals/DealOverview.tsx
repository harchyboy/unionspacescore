import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import type { Deal } from '../../types/deal';
import { MatchingTab } from './tabs/MatchingTab';

// Mock deal data - in production this would come from an API
const mockDeal: Deal = {
  id: '1',
  name: 'Tech Hub London',
  tenant: 'TechCorp Ltd',
  property: '42 Moorgate, Floor 7',
  stage: '2nd Viewing',
  status: 'Active',
  proposalConfigStatus: 'none',
};

// Mock contact data
const mockContacts = {
  tenantContacts: [
    {
      id: '1',
      name: 'Sarah Mitchell',
      role: 'Head of Operations',
      email: 's.mitchell@apextech.com',
      phone: '+44 20 7123 4567',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
    },
    {
      id: '2',
      name: 'David Chen',
      role: 'CFO',
      email: 'd.chen@apextech.com',
      phone: '+44 20 7123 4568',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
    },
  ],
  brokerTeam: [
    {
      id: '3',
      name: 'James Patterson',
      role: 'Senior Broker',
      company: 'Knight Frank',
      email: 'j.patterson@knightfrank.com',
      phone: '+44 20 8901 2345',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    },
  ],
  disposalAgent: [
    {
      id: '4',
      name: 'Michael Compton',
      role: 'Associate Director',
      company: 'Compton',
      email: 'm.compton@compton.co.uk',
      phone: '+44 20 6789 0123',
      avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
    },
  ],
  landlord: [
    {
      id: '5',
      name: 'Moorgate Estate Ltd',
      role: 'Property Owner',
      email: 'info@moorgateestate.com',
      phone: '+44 20 5678 9012',
      avatar: null, // Building icon instead
    },
  ],
};

// Mock requirement brief data
const mockRequirementBrief = {
  spaceRequirements: {
    desksRequired: '45 desks',
    squareFootage: '6,000-7,000 sq ft',
    meetingRooms: '4 rooms (6-8 people)',
    phoneBooths: '3 booths',
    kitchenFacilities: 'Full kitchen',
  },
  locationTiming: {
    preferredLocations: "City, Shoreditch, King's Cross",
    moveWindow: 'Jan 2025 - Mar 2025',
    targetMoveDate: '15 January 2025',
    leaseTerm: '5 years (flexible)',
    budgetRange: '£75-85 per sq ft',
  },
  fitOutPreferences: {
    stylePreference: 'Modern, Tech-Forward',
    deskConfiguration: 'Mix of open & private',
    branding: 'Prominent company branding',
    naturalLight: 'Essential requirement',
    sustainability: 'High priority',
  },
  constraintsNotes: [
    {
      type: 'warning',
      title: 'Critical Timeline',
      message: "Current lease expires 31 Jan 2025. Must be operational by 15 Jan to avoid disruption.",
    },
    {
      type: 'info',
      title: 'Tech Requirements',
      message: 'High-speed internet essential. Multiple video conferencing setups needed for client calls.',
    },
    {
      type: 'note',
      title: 'Growth Plans',
      message: "Expecting 20% headcount growth over next 18 months. Need flexibility to expand.",
    },
  ],
};

// Mock timeline data
const mockTimeline = [
  {
    id: '1',
    type: 'viewing',
    title: '2nd Viewing Scheduled - 42 Moorgate',
    time: '2 hours ago',
    description: 'Viewing confirmed for 20 Nov 2024 at 2:00 PM. Attendees: Sarah Mitchell, David Chen, James Patterson (broker), Tom Davies.',
    badge: 'Viewing',
    action: 'View Calendar Entry',
  },
  {
    id: '2',
    type: 'proposal',
    title: 'Proposal Sent to Tenant',
    time: '1 day ago',
    description: 'Commercial proposal for 42 Moorgate sent to Sarah Mitchell. All-Inclusive package option highlighted. Awaiting feedback.',
    badge: 'Document',
    actions: ['View Proposal', 'Download PDF'],
  },
  {
    id: '3',
    type: 'note',
    title: 'Note Added by Tom Davies',
    time: '2 days ago',
    description: '"Sarah mentioned they\'re particularly interested in the meeting room setup at Moorgate. Need to emphasize AV capabilities in proposal. Also confirmed budget flexibility if right space found."',
    badge: 'Note',
  },
  {
    id: '4',
    type: 'viewing-completed',
    title: '1st Viewing Completed - 42 Moorgate',
    time: '3 days ago',
    description: 'Initial viewing with Sarah Mitchell. Very positive feedback on natural light and location. Requested second viewing with CFO to review meeting rooms and tech infrastructure.',
    badge: 'Completed',
    action: 'View Notes',
  },
  {
    id: '5',
    type: 'email',
    title: 'Email Exchange with Broker',
    time: '5 days ago',
    description: 'James Patterson shared three additional properties matching criteria. Discussed Moorgate availability and confirmed landlord appetite for All-Inclusive deal structure.',
    badge: 'Email',
    action: 'View Thread',
  },
  {
    id: '6',
    type: 'requirement',
    title: 'Requirement Logged',
    time: '18 days ago',
    description: 'Initial requirement captured from broker introduction. Tenant brief documented and matching algorithm initiated.',
    badge: 'Requirement',
  },
];

// Mock next steps data
const mockNextSteps = [
  {
    id: '1',
    icon: 'fa-eye',
    title: 'Conduct 2nd Viewing - 42 Moorgate',
    description: 'Scheduled for 20 Nov 2024 at 2:00 PM. Confirm attendance with Sarah Mitchell and David Chen. Prepare tech infrastructure presentation.',
    dueDate: '20 Nov 2024',
    assignee: 'Tom Davies',
    priority: 'High Priority',
    priorityColor: 'bg-blue-100 text-blue-800',
  },
  {
    id: '2',
    icon: 'fa-file-invoice',
    title: 'Follow Up on Proposal',
    description: 'Check with Sarah Mitchell on proposal feedback. Address any questions about All-Inclusive package structure and service inclusions.',
    dueDate: '22 Nov 2024',
    assignee: 'Tom Davies',
    priority: 'Normal',
    priorityColor: 'bg-stone text-slate',
  },
  {
    id: '3',
    icon: 'fa-handshake',
    title: 'Coordinate with Disposal Agent',
    description: 'Touch base with Michael Compton to confirm landlord flexibility on lease terms and service bundle appetite.',
    dueDate: '25 Nov 2024',
    assignee: 'Tom Davies',
    priority: 'Normal',
    priorityColor: 'bg-stone text-slate',
  },
  {
    id: '4',
    icon: 'fa-file-contract',
    title: 'Prepare Heads of Terms Draft',
    description: 'If 2nd viewing is positive, prepare initial HoT draft with key commercial terms for review by Max Sullivan.',
    dueDate: '28 Nov 2024',
    assignee: 'Tom Davies',
    priority: 'Normal',
    priorityColor: 'bg-stone text-slate',
  },
];

// Mock related documents
const mockDocuments = [
  {
    id: '1',
    name: 'Commercial Proposal',
    size: '1.2 MB',
    date: '19 Nov 2024',
    icon: 'fa-file-pdf',
  },
  {
    id: '2',
    name: 'Requirement Brief',
    size: '850 KB',
    date: '02 Nov 2024',
    icon: 'fa-file-lines',
  },
  {
    id: '3',
    name: 'Property Photos',
    size: '15 images',
    date: '15 Nov 2024',
    icon: 'fa-image',
  },
];

// Mock communication log
const mockCommunicationLog = [
  {
    id: '1',
    title: 'Email to Sarah Mitchell',
    time: '2h ago',
    description: 'Viewing confirmation and agenda',
  },
  {
    id: '2',
    title: 'Call with James Patterson',
    time: '1d ago',
    description: 'Discussed proposal feedback timing',
  },
  {
    id: '3',
    title: 'Email to David Chen',
    time: '2d ago',
    description: 'Sent commercial proposal PDF',
  },
  {
    id: '4',
    title: 'Meeting at Property',
    time: '3d ago',
    description: '1st viewing completed successfully',
  },
];

export function DealOverview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal] = useState<Deal>(mockDeal);

  const handleGenerateProposal = () => {
    const hasConfig = 
      deal.proposalConfigStatus === 'draft' || 
      deal.proposalConfigStatus === 'complete' ||
      deal.hasProposalConfiguration === true;

    if (!hasConfig) {
      navigate(`/deals/${id}/proposal/configure`);
    } else {
      navigate(`/deals/${id}/proposal/builder`);
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'viewing':
        return { icon: 'fa-eye', bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'proposal':
        return { icon: 'fa-file-signature', bg: 'bg-green-100', text: 'text-green-800' };
      case 'note':
        return { icon: 'fa-comment-dots', bg: 'bg-stone', text: 'text-slate' };
      case 'viewing-completed':
        return { icon: 'fa-eye', bg: 'bg-green-100', text: 'text-green-800' };
      case 'email':
        return { icon: 'fa-envelope', bg: 'bg-stone', text: 'text-slate' };
      case 'requirement':
        return { icon: 'fa-clipboard-list', bg: 'bg-blue-100', text: 'text-blue-800' };
      default:
        return { icon: 'fa-circle', bg: 'bg-stone', text: 'text-slate' };
    }
  };

  return (
    <div className="bg-[#F0F0F0] min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-[#8E8E8E]/30 sticky top-0 z-40">
        <div className="flex items-center justify-between px-8 py-4">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => navigate('/deals')}
              className="p-2 text-[#8E8E8E] hover:text-[#252525] transition-colors"
            >
              <i className="fa-solid fa-arrow-left text-lg"></i>
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-[#252525]">Deal Details</h1>
              <p className="text-sm text-[#8E8E8E] mt-0.5">End-to-end view of this requirement</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-[#8E8E8E] hover:text-[#252525] transition-colors">
              <i className="fa-regular fa-bell text-lg"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#252525] rounded-full"></span>
            </button>
            <button className="p-2 text-[#8E8E8E] hover:text-[#252525] transition-colors">
              <i className="fa-solid fa-magnifying-glass text-lg"></i>
            </button>
            <button className="px-4 py-2 text-sm text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors border border-[#8E8E8E]/30">
              <i className="fa-solid fa-circle-question mr-2"></i>
              Help
            </button>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div className="bg-white border-b border-[#8E8E8E]/30 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div>
              <div className="text-xs text-[#8E8E8E] uppercase tracking-wide mb-1">Stage</div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                  <i className="fa-solid fa-eye mr-2"></i>
                  {deal.stage || '2nd Viewing'}
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#8E8E8E]/30"></div>
            <div>
              <div className="text-xs text-[#8E8E8E] uppercase tracking-wide mb-1">Age</div>
              <div className="text-sm font-semibold text-[#252525]">18 Days</div>
            </div>
            <div className="h-8 w-px bg-[#8E8E8E]/30"></div>
            <div>
              <div className="text-xs text-[#8E8E8E] uppercase tracking-wide mb-1">Confidence</div>
              <div className="flex items-center">
                <div className="flex items-center space-x-1 mr-2">
                  <i className="fa-solid fa-star text-amber-500 text-sm"></i>
                  <i className="fa-solid fa-star text-amber-500 text-sm"></i>
                  <i className="fa-solid fa-star text-amber-500 text-sm"></i>
                  <i className="fa-solid fa-star text-amber-500 text-sm"></i>
                  <i className="fa-regular fa-star text-[#8E8E8E] text-sm"></i>
                </div>
                <span className="text-sm font-semibold text-[#252525]">High</span>
              </div>
            </div>
            <div className="h-8 w-px bg-[#8E8E8E]/30"></div>
            <div>
              <div className="text-xs text-[#8E8E8E] uppercase tracking-wide mb-1">Last Activity</div>
              <div className="text-sm font-semibold text-[#252525]">2 hours ago</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 text-sm text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors border border-[#8E8E8E]/30">
              <i className="fa-solid fa-share-nodes mr-2"></i>
              Share One-Pager
            </button>
            <button className="px-4 py-2 text-sm text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors border border-[#8E8E8E]/30">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Panel */}
        <div className="flex-1 overflow-y-auto">
          {/* People Section */}
          <div className="px-8 py-6 border-b border-[#8E8E8E]/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#252525]">People</h2>
              <button className="px-4 py-2 text-sm text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors border border-[#8E8E8E]/30">
                <i className="fa-solid fa-plus mr-2"></i>
                Add Contact
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Tenant Contacts */}
              <div className="bg-white rounded-lg border border-[#8E8E8E]/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide">Tenant Contacts</h3>
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                    Primary
                  </span>
                </div>
                
                <div className="space-y-4">
                  {mockContacts.tenantContacts.map((contact, idx) => (
                    <div key={contact.id} className={idx === 0 ? "flex items-start pb-4 border-b border-[#8E8E8E]/20" : "flex items-start"}>
                      <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[#252525] mb-1">{contact.name}</h4>
                        <p className="text-xs text-[#8E8E8E] mb-2">{contact.role}</p>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-[#8E8E8E]">
                            <i className="fa-solid fa-envelope w-4 mr-2"></i>
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center text-xs text-[#8E8E8E]">
                            <i className="fa-solid fa-phone w-4 mr-2"></i>
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-[#8E8E8E] hover:text-[#252525] transition-colors">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Broker Team */}
              <div className="bg-white rounded-lg border border-[#8E8E8E]/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide">Broker Team</h3>
                  <span className="inline-flex items-center px-2 py-1 bg-[#F0F0F0] text-[#252525] text-xs font-semibold rounded">
                    External
                  </span>
                </div>
                
                <div className="space-y-4">
                  {mockContacts.brokerTeam.map((contact) => (
                    <div key={contact.id} className="flex items-start">
                      <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[#252525] mb-1">{contact.name}</h4>
                        <p className="text-xs text-[#8E8E8E] mb-2">{contact.role} • {contact.company}</p>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-[#8E8E8E]">
                            <i className="fa-solid fa-envelope w-4 mr-2"></i>
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center text-xs text-[#8E8E8E]">
                            <i className="fa-solid fa-phone w-4 mr-2"></i>
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-[#8E8E8E] hover:text-[#252525] transition-colors">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disposal Agent */}
              <div className="bg-white rounded-lg border border-[#8E8E8E]/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide">Disposal Agent</h3>
                  <span className="inline-flex items-center px-2 py-1 bg-[#F0F0F0] text-[#252525] text-xs font-semibold rounded">
                    External
                  </span>
                </div>
                
                <div className="space-y-4">
                  {mockContacts.disposalAgent.map((contact) => (
                    <div key={contact.id} className="flex items-start">
                      <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[#252525] mb-1">{contact.name}</h4>
                        <p className="text-xs text-[#8E8E8E] mb-2">{contact.role} • {contact.company}</p>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-[#8E8E8E]">
                            <i className="fa-solid fa-envelope w-4 mr-2"></i>
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center text-xs text-[#8E8E8E]">
                            <i className="fa-solid fa-phone w-4 mr-2"></i>
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-[#8E8E8E] hover:text-[#252525] transition-colors">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Landlord */}
              <div className="bg-white rounded-lg border border-[#8E8E8E]/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide">Landlord</h3>
                  <span className="inline-flex items-center px-2 py-1 bg-[#F0F0F0] text-[#252525] text-xs font-semibold rounded">
                    External
                  </span>
                </div>
                
                <div className="space-y-4">
                  {mockContacts.landlord.map((contact) => (
                    <div key={contact.id} className="flex items-start">
                      {contact.avatar ? (
                        <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full mr-4 object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-[#F0F0F0] rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <i className="fa-solid fa-building text-[#252525]"></i>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[#252525] mb-1">{contact.name}</h4>
                        <p className="text-xs text-[#8E8E8E] mb-2">{contact.role}</p>
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-[#8E8E8E]">
                            <i className="fa-solid fa-envelope w-4 mr-2"></i>
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center text-xs text-[#8E8E8E]">
                            <i className="fa-solid fa-phone w-4 mr-2"></i>
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      </div>
                      <button className="p-2 text-[#8E8E8E] hover:text-[#252525] transition-colors">
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Requirement Brief Section */}
          <div className="px-8 py-6 border-b border-[#8E8E8E]/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#252525]">Requirement Brief</h2>
              <button className="px-4 py-2 text-sm text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors border border-[#8E8E8E]/30">
                <i className="fa-solid fa-pencil mr-2"></i>
                Edit Brief
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Space Requirements */}
              <div className="bg-white rounded-lg border border-[#8E8E8E]/30 p-6">
                <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide mb-4">Space Requirements</h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Desks Required</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.spaceRequirements.desksRequired}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Square Footage</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.spaceRequirements.squareFootage}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Meeting Rooms</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.spaceRequirements.meetingRooms}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Phone Booths</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.spaceRequirements.phoneBooths}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-[#8E8E8E]">Kitchen Facilities</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.spaceRequirements.kitchenFacilities}</span>
                  </div>
                </div>
              </div>

              {/* Location & Timing */}
              <div className="bg-white rounded-lg border border-[#8E8E8E]/30 p-6">
                <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide mb-4">Location & Timing</h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Preferred Locations</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.locationTiming.preferredLocations}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Move Window</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.locationTiming.moveWindow}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Target Move Date</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.locationTiming.targetMoveDate}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Lease Term</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.locationTiming.leaseTerm}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-[#8E8E8E]">Budget Range</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.locationTiming.budgetRange}</span>
                  </div>
                </div>
              </div>

              {/* Fit-Out Preferences */}
              <div className="bg-white rounded-lg border border-[#8E8E8E]/30 p-6">
                <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide mb-4">Fit-Out Preferences</h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Style Preference</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.fitOutPreferences.stylePreference}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Desk Configuration</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.fitOutPreferences.deskConfiguration}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Branding</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.fitOutPreferences.branding}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#8E8E8E]/20">
                    <span className="text-sm text-[#8E8E8E]">Natural Light</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.fitOutPreferences.naturalLight}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-[#8E8E8E]">Sustainability</span>
                    <span className="text-sm font-semibold text-[#252525]">{mockRequirementBrief.fitOutPreferences.sustainability}</span>
                  </div>
                </div>
              </div>

              {/* Constraints & Notes */}
              <div className="bg-white rounded-lg border border-[#8E8E8E]/30 p-6">
                <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide mb-4">Constraints & Notes</h3>
                <div className="space-y-3">
                  {mockRequirementBrief.constraintsNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className={`p-3 border rounded-lg ${
                        note.type === 'warning'
                          ? 'bg-amber-50 border-amber-200'
                          : note.type === 'info'
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-[#F0F0F0] border-[#8E8E8E]/30'
                      }`}
                    >
                      <div className="flex items-start">
                        <i
                          className={`fa-solid ${
                            note.type === 'warning'
                              ? 'fa-triangle-exclamation text-amber-800'
                              : note.type === 'info'
                              ? 'fa-circle-info text-blue-800'
                              : 'fa-lightbulb text-[#252525]'
                          } mr-3 mt-0.5`}
                        ></i>
                        <div>
                          <p className="text-xs font-semibold text-[#252525] mb-1">{note.title}</p>
                          <p className="text-xs text-[#8E8E8E]">{note.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Matching Properties Section */}
          <div className="px-8 py-6 border-b border-[#8E8E8E]/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-[#252525]">Matching Properties</h2>
                <p className="text-sm text-[#8E8E8E] mt-1">Suggested spaces based on requirement criteria</p>
              </div>
              <button className="px-4 py-2 text-sm text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors border border-[#8E8E8E]/30">
                <i className="fa-solid fa-sliders mr-2"></i>
                Refine Matches
              </button>
            </div>

            {id && <MatchingTab dealId={id} />}
          </div>

          {/* Timeline & Activity Section */}
          <div className="px-8 py-6 border-b border-[#8E8E8E]/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#252525]">Timeline & Activity</h2>
              <button className="px-4 py-2 text-sm text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors border border-[#8E8E8E]/30">
                <i className="fa-solid fa-filter mr-2"></i>
                Filter
              </button>
            </div>

            <div className="bg-white rounded-lg border border-[#8E8E8E]/30 p-6">
              <div className="space-y-6">
                {mockTimeline.map((item, idx) => {
                  const iconConfig = getTimelineIcon(item.type);
                  return (
                    <div key={item.id} className={idx > 0 ? "border-t border-[#8E8E8E]/30 pt-6" : ""}>
                      <div className="flex items-start">
                        <div className={`w-10 h-10 ${iconConfig.bg} rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                          <i className={`fa-solid ${iconConfig.icon} ${iconConfig.text}`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-[#252525]">{item.title}</h4>
                            <span className="text-xs text-[#8E8E8E]">{item.time}</span>
                          </div>
                          <p className="text-sm text-[#8E8E8E] mb-3">{item.description}</p>
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2 py-1 ${
                              item.type === 'viewing' || item.type === 'viewing-completed'
                                ? 'bg-blue-100 text-blue-800'
                                : item.type === 'proposal'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-[#F0F0F0] text-[#252525]'
                            } text-xs font-semibold rounded`}>
                              {item.type === 'viewing-completed' && <i className="fa-solid fa-circle-check mr-1"></i>}
                              {item.badge}
                            </span>
                            {item.action && (
                              <button className="text-xs text-[#252525] hover:underline font-semibold">
                                {item.action}
                              </button>
                            )}
                            {item.actions && item.actions.map((action, actionIdx) => (
                              <button key={actionIdx} className="text-xs text-[#252525] hover:underline font-semibold">
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Next Steps Section */}
          <div className="px-8 py-6 mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#252525]">Next Steps</h2>
              <button className="px-4 py-2 text-sm text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors border border-[#8E8E8E]/30">
                <i className="fa-solid fa-plus mr-2"></i>
                Add Task
              </button>
            </div>

            <div className="space-y-4">
              {mockNextSteps.map((step) => (
                <div key={step.id} className="bg-white rounded-lg border border-[#8E8E8E]/30 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start flex-1">
                      <div className={`w-10 h-10 ${
                        step.priority === 'High Priority' ? 'bg-blue-100' : 'bg-[#F0F0F0]'
                      } rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                        <i className={`fa-solid ${step.icon} ${
                          step.priority === 'High Priority' ? 'text-blue-800' : 'text-[#252525]'
                        }`}></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-[#252525] mb-1">{step.title}</h3>
                        <p className="text-sm text-[#8E8E8E] mb-3">{step.description}</p>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-xs text-[#8E8E8E]">
                            <i className="fa-solid fa-calendar mr-2"></i>
                            <span>Due: {step.dueDate}</span>
                          </div>
                          <div className="flex items-center text-xs text-[#8E8E8E]">
                            <i className="fa-solid fa-user mr-2"></i>
                            <span>{step.assignee}</span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 ${step.priorityColor} text-xs font-semibold rounded`}>
                            {step.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-[#8E8E8E] hover:text-[#252525] transition-colors">
                      <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-96 border-l border-[#8E8E8E]/30 bg-white overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-[#8E8E8E]/30 px-6 py-4 z-10">
            <h3 className="text-lg font-semibold text-[#252525]">Quick Actions</h3>
          </div>

          <div className="p-6 space-y-4">
            <button
              onClick={() => navigate(`/deals/${id}/viewings`)}
              className="w-full px-4 py-3 bg-[#252525] text-white rounded-lg hover:bg-[#252525]/90 transition-colors font-semibold text-sm flex items-center justify-center"
            >
              <i className="fa-solid fa-calendar-plus mr-2"></i>
              Schedule Viewing
            </button>

            <button
              onClick={handleGenerateProposal}
              className="w-full px-4 py-3 bg-white text-[#252525] rounded-lg hover:bg-[#F0F0F0] transition-colors border border-[#8E8E8E]/30 font-semibold text-sm flex items-center justify-center"
            >
              <i className="fa-solid fa-file-invoice mr-2"></i>
              Issue Options
            </button>

            <button className="w-full px-4 py-3 bg-white text-[#252525] rounded-lg hover:bg-[#F0F0F0] transition-colors border border-[#8E8E8E]/30 font-semibold text-sm flex items-center justify-center">
              <i className="fa-solid fa-comment-dots mr-2"></i>
              Add Note
            </button>

            <button className="w-full px-4 py-3 bg-white text-[#252525] rounded-lg hover:bg-[#F0F0F0] transition-colors border border-[#8E8E8E]/30 font-semibold text-sm flex items-center justify-center">
              <i className="fa-solid fa-share-nodes mr-2"></i>
              Share One-Pager to Broker
            </button>
          </div>

          {/* Deal Health */}
          <div className="border-t border-[#8E8E8E]/30 px-6 py-4">
            <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide mb-4">Deal Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#8E8E8E] uppercase tracking-wide">Engagement Score</span>
                  <span className="text-sm font-semibold text-[#252525]">85%</span>
                </div>
                <div className="w-full bg-[#F0F0F0] rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-[#8E8E8E] mt-1">Strong tenant engagement with timely responses</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#8E8E8E] uppercase tracking-wide">Budget Alignment</span>
                  <span className="text-sm font-semibold text-[#252525]">97%</span>
                </div>
                <div className="w-full bg-[#F0F0F0] rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '97%' }}></div>
                </div>
                <p className="text-xs text-[#8E8E8E] mt-1">Shortlisted property within stated budget</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#8E8E8E] uppercase tracking-wide">Timeline Risk</span>
                  <span className="text-sm font-semibold text-[#252525]">Low</span>
                </div>
                <div className="w-full bg-[#F0F0F0] rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <p className="text-xs text-[#8E8E8E] mt-1">Adequate time to complete before deadline</p>
              </div>
            </div>
          </div>

          {/* Stalled Indicator */}
          <div className="border-t border-[#8E8E8E]/30 px-6 py-4">
            <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide mb-4">Stalled Indicator</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <i className="fa-solid fa-circle-check text-green-800"></i>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#252525] mb-1">Active Deal</h4>
                  <p className="text-xs text-[#8E8E8E]">Last activity 2 hours ago. Deal progressing well with regular engagement.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Documents */}
          <div className="border-t border-[#8E8E8E]/30 px-6 py-4">
            <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide mb-4">Related Documents</h3>
            <div className="space-y-3">
              {mockDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-[#8E8E8E]/30 rounded-lg hover:border-[#252525]/50 transition-colors">
                  <div className="flex items-center flex-1">
                    <div className="w-8 h-8 bg-[#F0F0F0] rounded flex items-center justify-center mr-3">
                      <i className={`fa-solid ${doc.icon} text-[#252525] text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#252525] truncate">{doc.name}</p>
                      <p className="text-xs text-[#8E8E8E]">{doc.size} • {doc.date}</p>
                    </div>
                  </div>
                  <button className="p-1.5 text-[#8E8E8E] hover:text-[#252525] transition-colors">
                    <i className={`fa-solid ${doc.icon === 'fa-image' ? 'fa-eye' : 'fa-download'} text-sm`}></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Communication Log */}
          <div className="border-t border-[#8E8E8E]/30 px-6 py-4">
            <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide mb-4">Communication Log</h3>
            <div className="space-y-3">
              {mockCommunicationLog.map((comm, idx) => (
                <div key={comm.id} className={idx > 0 ? "text-xs pt-3 border-t border-[#8E8E8E]/20" : "text-xs"}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#252525]">{comm.title}</span>
                    <span className="text-[#8E8E8E]">{comm.time}</span>
                  </div>
                  <p className="text-[#8E8E8E]">{comm.description}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 px-3 py-2 text-xs text-[#252525] hover:bg-[#F0F0F0] rounded-lg transition-colors border border-[#8E8E8E]/30">
              View Full History
            </button>
          </div>

          {/* Key Metrics */}
          <div className="border-t border-[#8E8E8E]/30 px-6 py-4">
            <h3 className="text-sm font-semibold text-[#252525] uppercase tracking-wide mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8E8E8E]">Days in Stage</span>
                <span className="text-sm font-semibold text-[#252525]">4 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8E8E8E]">Total Deal Age</span>
                <span className="text-sm font-semibold text-[#252525]">18 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8E8E8E]">Properties Viewed</span>
                <span className="text-sm font-semibold text-[#252525]">1 of 3 shortlisted</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8E8E8E]">Proposals Sent</span>
                <span className="text-sm font-semibold text-[#252525]">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8E8E8E]">Response Time (Avg)</span>
                <span className="text-sm font-semibold text-[#252525]">4.2 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
