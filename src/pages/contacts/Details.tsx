import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDeleteContact, useContact } from '../../api/contacts';
import { ConfirmModal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import type { Contact } from '../../types/contact';

interface ContactDetailsProps {
  contact: Contact;
  onBack?: () => void;
}

export function ContactDetails({ contact: initialContact, onBack }: ContactDetailsProps) {
  const navigate = useNavigate();
  const deleteContact = useDeleteContact();
  const { data: contact = initialContact } = useContact(initialContact.id, initialContact);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { showToast, removeToast, toasts } = useToast();
  const [activeTab, setActiveTab] = useState('Overview');

  // Generate display values
  const displayName = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact';
  const initials = displayName.split(' ').map(n => n?.[0] || '').join('').toUpperCase().slice(0, 2);
  const healthScore = contact.relationshipHealthScore || 85; // Default to 85 if missing for demo
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/contacts');
    }
  };
  
  const handleDelete = async () => {
    if (!contact.id) return;
    try {
      await deleteContact.mutateAsync(contact.id);
      showToast('Contact deleted successfully', 'success');
      setTimeout(() => {
        navigate('/contacts');
      }, 500);
    } catch (error) {
      console.error('Error deleting contact:', error);
      showToast('Failed to delete contact', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F0F0F0]">
      {/* Page Header */}
      <div id="page-header" className="bg-white border-b border-[#E6E6E6] px-8 py-6">
        <div className="flex items-center space-x-4 mb-4">
          <button 
            onClick={handleBack} 
            className="text-secondary hover:text-primary transition-all duration-200"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div className="flex items-center space-x-4 flex-1">
            {contact.avatar ? (
              <img 
                src={contact.avatar} 
                alt={displayName} 
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                {initials}
              </div>
            )}
            
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-semibold text-primary">{displayName}</h1>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary text-white">
                  {contact.type === 'flex-broker' ? 'Broker' : contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-secondary">
                <span className="flex items-center space-x-1">
                  <i className="fa-solid fa-building"></i>
                  <span>{contact.company || 'Company not set'}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <i className="fa-solid fa-map-marker-alt"></i>
                  <span>{contact.territory || contact.companyCity || 'Location not set'}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => window.location.href = `mailto:${contact.email}`}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all duration-200 flex items-center space-x-2"
            >
              <i className="fa-solid fa-envelope"></i>
              <span>New Email</span>
            </button>
            <button 
              onClick={() => contact.phone && (window.location.href = `tel:${contact.phone}`)}
              className="border border-[#E6E6E6] text-primary px-5 py-2.5 rounded-lg font-medium hover:bg-muted transition-all duration-200 flex items-center space-x-2"
            >
              <i className="fa-solid fa-phone"></i>
              <span>Log Call</span>
            </button>
            <button 
              className="border border-[#E6E6E6] text-primary px-5 py-2.5 rounded-lg font-medium hover:bg-muted transition-all duration-200 flex items-center space-x-2"
            >
              <i className="fa-solid fa-calendar"></i>
              <span>Create Viewing</span>
            </button>
            <button 
              className="border border-[#E6E6E6] text-primary px-5 py-2.5 rounded-lg font-medium hover:bg-muted transition-all duration-200 flex items-center space-x-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>Add to Deal</span>
            </button>
            <button className="p-2.5 text-secondary hover:text-primary transition-all duration-200">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {['Overview', 'Relationship Graph', 'Performance', 'Communications', 'Documents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
                activeTab === tab 
                  ? 'text-primary border-primary' 
                  : 'text-secondary hover:text-primary border-transparent hover:border-secondary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div id="contact-details-container" className="flex-1 overflow-y-auto bg-[#F0F0F0]">
        <div className="grid grid-cols-3 gap-6 p-8">
          
          {/* Left Column */}
          <div id="left-column" className="col-span-2 space-y-6">
            
            {/* Contact Info Card */}
            <div id="contact-info-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-primary">Contact Information</h2>
                <button 
                  onClick={() => navigate(`/contacts/${contact.id}/edit`)}
                  className="text-secondary hover:text-primary text-sm transition-colors"
                >
                  <i className="fa-solid fa-pencil mr-1"></i>
                  Edit
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Email</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-primary">{contact.email}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(contact.email);
                        showToast('Email copied to clipboard');
                      }}
                      className="text-secondary hover:text-primary transition-colors"
                    >
                      <i className="fa-solid fa-copy text-xs"></i>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Phone</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-primary">{contact.phone || '-'}</span>
                    {contact.phone && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(contact.phone!);
                          showToast('Phone copied to clipboard');
                        }}
                        className="text-secondary hover:text-primary transition-colors"
                      >
                        <i className="fa-solid fa-copy text-xs"></i>
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Mobile</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-primary">{contact.mobile || '+44 7700 900 123'}</span>
                    <button className="text-secondary hover:text-primary transition-colors">
                      <i className="fa-solid fa-copy text-xs"></i>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Role</label>
                  <span className="text-sm text-primary">{contact.role || 'Senior Partner, Flexible Office Solutions'}</span>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Territory</label>
                  <span className="text-sm text-primary">{contact.territory || 'Central London, City Core'}</span>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Specialisms</label>
                  <div className="flex flex-wrap gap-2">
                    {(contact.specialisms?.length ? contact.specialisms : ['Tech Sector', 'Scale-ups', '10-50 desks']).map((spec, i) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-primary">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Preferred Submarkets</label>
                  <span className="text-sm text-primary">
                    {contact.preferredSubmarkets?.join(', ') || 'City Core, Shoreditch, Clerkenwell'}
                  </span>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Referral Source</label>
                  <span className="text-sm text-primary">{contact.referralSource || 'Industry Event - PropTech Summit 2023'}</span>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Commission Structure</label>
                  <span className="text-sm text-primary">{contact.commissionStructure || 'Standard - 10% first year rent'}</span>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Relationship Health</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${healthScore}%` }}></div>
                    </div>
                    <span className="text-xs text-secondary">{contact.relationshipHealth === 'excellent' ? 'Excellent' : 'Good'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Last Contacted</label>
                  <span className="text-sm text-primary">{contact.lastContacted || '2 days ago'}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#E6E6E6]">
                <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Relationship Notes</label>
                <p className="text-sm text-primary leading-relaxed">
                  {contact.notes || "Marcus is a key broker contact specializing in tech scale-ups. Many of his requirements are confidential until later stages. Prefers email communication over calls. Responsive within 2-4 hours during business hours. Strong track record with quality referrals."}
                </p>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#E6E6E6]">
                <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-3">Comms Preferences</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" checked={contact.commsPreferences?.email ?? true} readOnly className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" />
                    <span className="text-sm text-primary">Email logging consent</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-secondary">Updates cadence:</span>
                    <select className="text-sm border border-[#E6E6E6] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                      <option>Weekly</option>
                      <option>Bi-weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Confidential Requirements Card */}
            <div id="confidential-requirements-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-semibold text-primary">Confidential Requirements</h2>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-destructive text-white">
                    <i className="fa-solid fa-lock mr-1"></i>
                    Confidential
                  </span>
                </div>
                <button className="text-secondary hover:text-primary text-sm transition-colors">
                  <i className="fa-solid fa-plus mr-1"></i>
                  Add Requirement
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Item 1 */}
                <div className="border border-[#E6E6E6] rounded-lg p-4 hover:border-primary transition-all duration-200 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-primary mb-1">Tech Scale-up - Series B</div>
                      <div className="text-xs text-secondary">Tenant identity withheld until shortlist stage</div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-white">Active</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-secondary mb-1">Size Required</div>
                      <div className="text-primary font-medium">8,000-10,000 sq ft</div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary mb-1">Desks</div>
                      <div className="text-primary font-medium">45-55</div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary mb-1">Budget</div>
                      <div className="text-primary font-medium">£65-75 psf</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#E6E6E6] flex items-center justify-between">
                    <div className="text-xs text-secondary">Created 3 days ago</div>
                    <div className="flex items-center space-x-2">
                      <button className="text-xs text-primary hover:underline">View Details</button>
                      <button className="text-xs text-primary hover:underline">Match Properties</button>
                    </div>
                  </div>
                </div>
                
                {/* Item 2 */}
                <div className="border border-[#E6E6E6] rounded-lg p-4 hover:border-primary transition-all duration-200 cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-primary mb-1">Financial Services Firm - Expansion</div>
                      <div className="text-xs text-secondary">Limited disclosure until HoTs stage</div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-white">Viewing Stage</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-secondary mb-1">Size Required</div>
                      <div className="text-primary font-medium">12,000-15,000 sq ft</div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary mb-1">Desks</div>
                      <div className="text-primary font-medium">70-85</div>
                    </div>
                    <div>
                      <div className="text-xs text-secondary mb-1">Budget</div>
                      <div className="text-primary font-medium">£70-85 psf</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#E6E6E6] flex items-center justify-between">
                    <div className="text-xs text-secondary">Created 2 weeks ago</div>
                    <div className="flex items-center space-x-2">
                      <button className="text-xs text-primary hover:underline">View Details</button>
                      <button className="text-xs text-primary hover:underline">Match Properties</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Communications History Card */}
            <div id="communications-history-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-primary">Communications History</h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary text-sm"></i>
                    <input type="text" placeholder="Search communications..." className="pl-9 pr-4 py-2 border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <select className="border border-[#E6E6E6] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                    <option>All Types</option>
                    <option>Email</option>
                    <option>Call</option>
                    <option>Meeting</option>
                    <option>Note</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Comms 1 */}
                <div className="flex space-x-4 pb-4 border-b border-[#E6E6E6]">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-envelope text-white text-sm"></i>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-primary text-sm mb-1">Email: Property Shortlist for Tech Client</div>
                        <div className="text-xs text-secondary">From: marcus.reynolds@savills.com</div>
                      </div>
                      <div className="text-xs text-secondary">2 days ago</div>
                    </div>
                    <p className="text-sm text-primary leading-relaxed mb-3">Hi Tom, Following our call yesterday, I've narrowed down the options for our confidential tech client. They're particularly interested in 99 Bishopsgate and The Leadenhall Building. Could we arrange viewings for next week?</p>
                    <div className="flex items-center space-x-3">
                      <button className="text-xs text-primary hover:underline">View Full Email</button>
                      <button className="text-xs text-primary hover:underline">Reply</button>
                      <button className="text-xs text-primary hover:underline">Forward</button>
                    </div>
                  </div>
                </div>
                
                {/* Comms 2 */}
                <div className="flex space-x-4 pb-4 border-b border-[#E6E6E6]">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <i className="fa-solid fa-phone text-white text-sm"></i>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-primary text-sm mb-1">Call: New Requirement Discussion</div>
                        <div className="text-xs text-secondary">Duration: 18 minutes</div>
                      </div>
                      <div className="text-xs text-secondary">5 days ago</div>
                    </div>
                    <p className="text-sm text-primary leading-relaxed mb-3">Discussed new confidential requirement for Series B tech scale-up. Client needs 8-10k sq ft, 45-55 desks, budget £65-75 psf. Preferred areas: City Core, Shoreditch. Identity to be disclosed at shortlist stage. Marcus mentioned client is on tight timeline - needs to move within 8 weeks.</p>
                    <div className="flex items-center space-x-3">
                      <button className="text-xs text-primary hover:underline">View Call Notes</button>
                      <button className="text-xs text-primary hover:underline">Schedule Follow-up</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#E6E6E6] text-center">
                <button className="text-sm text-primary hover:underline font-medium">Load More Communications</button>
              </div>
            </div>
            
            {/* Documents Card */}
            <div id="documents-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-primary">Documents</h2>
                <button className="text-secondary hover:text-primary text-sm transition-colors">
                  <i className="fa-solid fa-upload mr-1"></i>
                  Upload Document
                </button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-[#E6E6E6] rounded-lg hover:border-primary transition-all duration-200 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-destructive bg-opacity-10 rounded flex items-center justify-center">
                      <i className="fa-solid fa-file-pdf text-destructive"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-primary">NDA - Savills & UNION</div>
                      <div className="text-xs text-secondary">Signed 12 Jan 2024 • 245 KB</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-secondary hover:text-primary p-2">
                      <i className="fa-solid fa-download"></i>
                    </button>
                    <button className="text-secondary hover:text-primary p-2">
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-[#E6E6E6] rounded-lg hover:border-primary transition-all duration-200 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary bg-opacity-10 rounded flex items-center justify-center">
                      <i className="fa-solid fa-file-contract text-primary"></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-primary">Broker Agreement 2024</div>
                      <div className="text-xs text-secondary">Executed 5 Jan 2024 • 892 KB</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-secondary hover:text-primary p-2">
                      <i className="fa-solid fa-download"></i>
                    </button>
                    <button className="text-secondary hover:text-primary p-2">
                      <i className="fa-solid fa-eye"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div id="right-column" className="space-y-6">
            
            {/* Quick Actions Card */}
            <div id="quick-actions-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: 'fa-calendar-plus', label: 'Book Viewing' },
                  { icon: 'fa-handshake', label: 'Create Deal' },
                  { icon: 'fa-file-invoice-dollar', label: 'Generate Commission' },
                  { icon: 'fa-share-nodes', label: 'Share Properties' },
                ].map((action, i) => (
                  <button key={i} className="w-full flex items-center justify-between px-4 py-3 border border-[#E6E6E6] rounded-lg hover:border-primary hover:bg-muted transition-all duration-200 group">
                    <div className="flex items-center space-x-3">
                      <i className={`fa-solid ${action.icon} text-primary`}></i>
                      <span className="text-sm text-primary">{action.label}</span>
                    </div>
                    <i className="fa-solid fa-chevron-right text-secondary text-xs group-hover:text-primary transition-colors"></i>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Performance Metrics Card */}
            <div id="performance-metrics-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Performance Metrics</h3>
                <select className="text-xs border border-[#E6E6E6] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option>Last 12 Months</option>
                  <option>Last 6 Months</option>
                  <option>Last Quarter</option>
                </select>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider">Referral Volume</span>
                    <span className="text-lg font-semibold text-primary">{contact.referralVolume || '24'}</span>
                  </div>
                  <div className="text-xs text-secondary">+8 vs previous period</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider">Conversion Rate</span>
                    <span className="text-lg font-semibold text-primary">{contact.conversionRate || '37.5'}%</span>
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2 mb-1">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${contact.conversionRate || 37.5}%` }}></div>
                  </div>
                  <div className="text-xs text-secondary">9 of 24 referrals converted</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider">Revenue Attribution</span>
                    <span className="text-lg font-semibold text-primary">£{contact.revenueAttribution?.toLocaleString() || '487,000'}</span>
                  </div>
                  <div className="text-xs text-secondary">Annual contract value from deals</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider">Commission Paid</span>
                    <span className="text-lg font-semibold text-primary">£{contact.commissionPaid?.toLocaleString() || '48,700'}</span>
                  </div>
                  <div className="text-xs text-secondary">10% of first year rent</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider">Avg Deal Size</span>
                    <span className="text-lg font-semibold text-primary">8,200 sq ft</span>
                  </div>
                  <div className="text-xs text-secondary">Across 9 closed deals</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider">Quality Score</span>
                    <span className="text-lg font-semibold text-primary">{contact.qualityScore || '4.7'}/5.0</span>
                  </div>
                  <div className="flex items-center space-x-1 mb-1">
                    {[1, 2, 3, 4].map(i => <i key={i} className="fa-solid fa-star text-primary text-xs"></i>)}
                    <i className="fa-solid fa-star-half-stroke text-primary text-xs"></i>
                  </div>
                  <div className="text-xs text-secondary">Based on referral quality assessment</div>
                </div>
              </div>
              
              <button className="w-full mt-6 pt-6 border-t border-[#E6E6E6] text-sm text-primary hover:underline font-medium">
                View Detailed Performance Report
              </button>
            </div>
            
            {/* Linked Entities Card */}
            <div id="linked-entities-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Linked Entities</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-secondary uppercase tracking-wider">Properties</div>
                    <span className="text-xs font-semibold text-primary">12</span>
                  </div>
                  <div className="space-y-2">
                    <a href="#" className="flex items-center justify-between p-2 border border-[#E6E6E6] rounded hover:border-primary transition-all duration-200">
                      <span className="text-sm text-primary">99 Bishopsgate</span>
                      <i className="fa-solid fa-chevron-right text-secondary text-xs"></i>
                    </a>
                    <a href="#" className="flex items-center justify-between p-2 border border-[#E6E6E6] rounded hover:border-primary transition-all duration-200">
                      <span className="text-sm text-primary">The Leadenhall Building</span>
                      <i className="fa-solid fa-chevron-right text-secondary text-xs"></i>
                    </a>
                    <button className="w-full text-xs text-primary hover:underline text-left">View all 12 properties</button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-[#E6E6E6]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-secondary uppercase tracking-wider">Units</div>
                    <span className="text-xs font-semibold text-primary">28</span>
                  </div>
                  <div className="space-y-2">
                    <a href="#" className="flex items-center justify-between p-2 border border-[#E6E6E6] rounded hover:border-primary transition-all duration-200">
                      <span className="text-sm text-primary">99 Bishopsgate - Floor 8</span>
                      <i className="fa-solid fa-chevron-right text-secondary text-xs"></i>
                    </a>
                    <button className="w-full text-xs text-primary hover:underline text-left">View all 28 units</button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Upcoming Actions Card */}
            <div id="upcoming-actions-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Upcoming Actions</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-calendar text-white text-xs"></i>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-primary mb-1">Viewing Scheduled</div>
                    <div className="text-xs text-secondary mb-2">99 Bishopsgate - Floor 8</div>
                    <div className="text-xs text-primary font-medium">Tomorrow at 10:00 AM</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-phone text-white text-xs"></i>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-primary mb-1">Follow-up Call</div>
                    <div className="text-xs text-secondary mb-2">Discuss shortlist feedback</div>
                    <div className="text-xs text-primary font-medium">Friday at 2:00 PM</div>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-4 text-sm text-primary hover:underline font-medium">
                View All Actions
              </button>
            </div>
            
            {/* Relationship Timeline Card */}
            <div id="relationship-timeline-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Relationship Timeline</h3>
              
              <div className="space-y-4">
                {[
                  { date: 'May 2024', title: 'New Requirement Added', subtitle: 'Tech Scale-up - Series B', type: 'primary' },
                  { date: 'Apr 2024', title: 'Commission Paid', subtitle: 'Q1 2024 - £42,500', type: 'primary' },
                  { date: 'Mar 2024', title: 'Deal Closed', subtitle: 'Principal Place - Suite 4B', type: 'primary' },
                  { date: 'Jan 2024', title: 'Agreement Renewed', subtitle: 'Broker Agreement 2024', type: 'primary' },
                  { date: 'Dec 2023', title: 'Relationship Established', subtitle: 'PropTech Summit introduction', type: 'secondary' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${item.type === 'primary' ? 'bg-primary' : 'bg-secondary'} rounded-full mt-2 flex-shrink-0`}></div>
                    <div className="flex-1">
                      <div className="text-xs text-secondary mb-1">{item.date}</div>
                      <div className="text-sm text-primary font-medium mb-1">{item.title}</div>
                      <div className="text-xs text-secondary">{item.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contact.fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        variant="destructive"
      />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
