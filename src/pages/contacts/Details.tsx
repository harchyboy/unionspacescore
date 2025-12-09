import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDeleteContact, useContact, useEnrichContact } from '../../api/contacts';
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
  const enrichContact = useEnrichContact();
  const { data: contact = initialContact } = useContact(initialContact.id, initialContact);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { showToast, removeToast, toasts } = useToast();
  const [activeTab, setActiveTab] = useState('Overview');

  const handleEnrichLinkedIn = async () => {
    try {
      const result = await enrichContact.mutateAsync(contact.id);
      if (result.success && result.linkedinUrl) {
        showToast('LinkedIn profile found!', 'success');
      } else if (result.status === 'already_enriched') {
        showToast('LinkedIn already linked', 'info');
      } else {
        showToast('No LinkedIn profile found', 'warning');
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      showToast('Failed to find LinkedIn profile', 'error');
    }
  };

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
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  contact.type === 'Broker' ? 'bg-black text-white' :
                  contact.type === 'Disposal Agent' ? 'bg-secondary text-white' :
                  contact.type === 'Tenant' ? 'bg-accent text-white' :
                  'bg-muted text-primary'
                }`}>
                  {contact.type || 'Contact'}
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
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Mobile</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-primary">{contact.mobile || '-'}</span>
                    {contact.mobile && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(contact.mobile!);
                          showToast('Mobile copied to clipboard');
                        }}
                        className="text-secondary hover:text-primary transition-colors"
                      >
                        <i className="fa-solid fa-copy text-xs"></i>
                      </button>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Commission Structure</label>
                  <span className="text-sm text-primary">{contact.commissionStructure || '-'}</span>
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
                  <span className="text-sm text-primary">{contact.lastActivity || '-'}</span>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">LinkedIn</label>
                  <div className="flex items-center space-x-3">
                    {contact.linkedinUrl ? (
                      <>
                        <a 
                          href={contact.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-[#0077B5] hover:underline flex items-center space-x-2"
                        >
                          <i className="fa-brands fa-linkedin text-lg"></i>
                          <span>View Profile</span>
                        </a>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(contact.linkedinUrl!);
                            showToast('LinkedIn URL copied');
                          }}
                          className="text-secondary hover:text-primary transition-colors"
                        >
                          <i className="fa-solid fa-copy text-xs"></i>
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-secondary">Not linked</span>
                        <button
                          onClick={handleEnrichLinkedIn}
                          disabled={enrichContact.isPending}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#0077B5] hover:bg-[#005885] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {enrichContact.isPending ? (
                            <>
                              <i className="fa-solid fa-spinner fa-spin mr-1.5"></i>
                              Searching...
                            </>
                          ) : (
                            <>
                              <i className="fa-brands fa-linkedin mr-1.5"></i>
                              Find LinkedIn
                            </>
                          )}
                        </button>
                      </>
                    )}
                    {contact.enrichmentStatus === 'not_found' && !contact.linkedinUrl && (
                      <span className="text-xs text-secondary italic">Previously searched - not found</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#E6E6E6]">
                <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Relationship Notes</label>
                <p className="text-sm text-primary leading-relaxed">
                  {contact.notes || '-'}
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
              
              <div className="text-sm text-secondary">-</div>
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
                    <span className="text-lg font-semibold text-primary">{contact.referralVolume ?? '-'}</span>
                  </div>
                  <div className="text-xs text-secondary">-</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider">Conversion Rate</span>
                    <span className="text-lg font-semibold text-primary">{contact.conversionRate != null ? `${contact.conversionRate}%` : '-'}</span>
                  </div>
                  {contact.conversionRate != null && (
                    <div className="flex-1 bg-muted rounded-full h-2 mb-1">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${contact.conversionRate}%` }}></div>
                    </div>
                  )}
                  <div className="text-xs text-secondary">-</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider">Revenue Attribution</span>
                    <span className="text-lg font-semibold text-primary">{contact.revenueAttribution != null ? `£${contact.revenueAttribution.toLocaleString()}` : '-'}</span>
                  </div>
                  <div className="text-xs text-secondary">-</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider">Commission Paid</span>
                    <span className="text-lg font-semibold text-primary">{contact.commissionPaid != null ? `£${contact.commissionPaid.toLocaleString()}` : '-'}</span>
                  </div>
                  <div className="text-xs text-secondary">-</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider">Avg Deal Size</span>
                    <span className="text-lg font-semibold text-primary">-</span>
                  </div>
                  <div className="text-xs text-secondary">-</div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-secondary uppercase tracking-wider">Quality Score</span>
                    <span className="text-lg font-semibold text-primary">{contact.qualityScore != null ? `${contact.qualityScore}/5.0` : '-'}</span>
                  </div>
                  {contact.qualityScore != null && (
                    <div className="flex items-center space-x-1 mb-1">
                      {[1, 2, 3, 4].map(i => <i key={i} className="fa-solid fa-star text-primary text-xs"></i>)}
                      <i className="fa-solid fa-star-half-stroke text-primary text-xs"></i>
                    </div>
                  )}
                  <div className="text-xs text-secondary">-</div>
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
                    <span className="text-xs font-semibold text-primary">-</span>
                  </div>
                  <div className="text-sm text-secondary">-</div>
                </div>
                
                <div className="pt-4 border-t border-[#E6E6E6]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-secondary uppercase tracking-wider">Units</div>
                    <span className="text-xs font-semibold text-primary">-</span>
                  </div>
                  <div className="text-sm text-secondary">-</div>
                </div>
              </div>
            </div>
            
            {/* Upcoming Actions Card */}
            <div id="upcoming-actions-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Upcoming Actions</h3>
              
              <div className="text-sm text-secondary">-</div>
            </div>
            
            {/* Relationship Timeline Card */}
            <div id="relationship-timeline-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Relationship Timeline</h3>
              
              <div className="text-sm text-secondary">-</div>
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
