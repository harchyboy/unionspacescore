import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useDeleteContact, useContact, refreshContact, useUpdateContact } from '../../api/contacts';
import { ConfirmModal } from '../../components/ui/Modal';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import { InlineEditField } from '../../components/ui/InlineEditField';
import type { Contact } from '../../types/contact';

const API_BASE = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL || '';

interface LinkedInCandidate {
  name: string;
  headline: string;
  url: string;
  imageUrl?: string;
  matchScore: number;
}

interface ContactDetailsProps {
  contact: Contact;
  onBack?: () => void;
}

export function ContactDetails({ contact: initialContact, onBack }: ContactDetailsProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteContact = useDeleteContact();
  const updateContact = useUpdateContact();
  
  // Debug logging
  console.log('[ContactDetails] Initial contact:', {
    id: initialContact?.id,
    name: initialContact?.fullName,
    type: initialContact?.type,
    hasId: !!initialContact?.id
  });
  
  const { data: contact = initialContact, refetch: refetchContact, error: fetchError } = useContact(initialContact.id, initialContact);
  
  // Log any fetch errors
  if (fetchError) {
    console.error('[ContactDetails] Fetch error:', fetchError);
  }
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { showToast, removeToast, toasts } = useToast();
  const [activeTab, setActiveTab] = useState('Overview');
  
  // LinkedIn search state
  const [isSearchingLinkedIn, setIsSearchingLinkedIn] = useState(false);
  const [linkedInCandidates, setLinkedInCandidates] = useState<LinkedInCandidate[]>([]);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [approvingUrl, setApprovingUrl] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isRefreshingPosts, setIsRefreshingPosts] = useState(false);

  // Fetch LinkedIn posts if URL is available (must be before any conditional returns)
  const { data: linkedinPosts, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['linkedin-posts', contact?.linkedinUrl],
    queryFn: async () => {
      if (!contact?.linkedinUrl) return null;
      const res = await fetch(`${API_BASE}/api/linkedin-posts?url=${encodeURIComponent(contact.linkedinUrl)}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    enabled: !!contact?.linkedinUrl && activeTab === 'Overview',
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const handleRefreshPosts = async () => {
    if (!contact?.linkedinUrl) return;
    setIsRefreshingPosts(true);
    try {
        await queryClient.fetchQuery({
            queryKey: ['linkedin-posts', contact.linkedinUrl],
            queryFn: async () => {
                const res = await fetch(`${API_BASE}/api/linkedin-posts?url=${encodeURIComponent(contact.linkedinUrl!)}&force=true`);
                if (!res.ok) throw new Error('Failed to fetch posts');
                return res.json();
            }
        });
        showToast('LinkedIn posts updated', 'success');
    } catch (error) {
        console.error('Error refreshing posts:', error);
        showToast('Failed to update posts', 'error');
    } finally {
        setIsRefreshingPosts(false);
    }
  };

  // Search for LinkedIn profiles using Google Custom Search
  const handleFindLinkedIn = async () => {
    setIsSearchingLinkedIn(true);
    setLinkedInCandidates([]);
    
    try {
      const response = await fetch(`${API_BASE}/api/linkedin-search?id=${contact.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.alreadyLinked) {
        // If already linked, we still might want to show candidates if we found any (e.g. for photo update)
        // But the backend currently returns empty candidates if alreadyLinked is true (unless we changed it).
        // If we want to allow updating, we should handle the case where we get candidates back even if linked.
        
        // Backend update: now returns candidates even if linked, but still sets alreadyLinked=true
        if (data.candidates && data.candidates.length > 0) {
            setLinkedInCandidates(data.candidates);
            setShowLinkedInModal(true);
        } else {
            showToast('Contact already linked and no better matches found to update.', 'info');
        }
        return;
      }
      
      if (data.candidates && data.candidates.length > 0) {
        setLinkedInCandidates(data.candidates);
        setShowLinkedInModal(true);
      } else {
        showToast('No LinkedIn profiles found', 'info');
      }
    } catch (error) {
      console.error('LinkedIn search error:', error);
      showToast('Failed to search LinkedIn. Please try again.', 'error');
    } finally {
      setIsSearchingLinkedIn(false);
    }
  };

  // Approve and save a LinkedIn candidate
  const handleApproveLinkedIn = async (candidate: LinkedInCandidate) => {
    setApprovingUrl(candidate.url);
    
    try {
      const response = await fetch(`${API_BASE}/api/linkedin-approve?id=${contact.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          linkedinUrl: candidate.url, 
          imageUrl: candidate.imageUrl 
        })
      });
      
      const text = await response.text();
      console.log('linkedin-approve raw response:', response.status, text);

      let data: Record<string, unknown> | null = null;
      try {
        data = JSON.parse(text);
      } catch {
        // Non-JSON response
        showToast(`Save failed (HTTP ${response.status}): ${text.substring(0, 200)}`, 'error');
        return;
      }
      
      if (response.ok && data?.success) {
        if (data.imageSaved === false) {
             showToast('LinkedIn profile saved, but could not download profile image.', 'warning');
        } else {
             showToast('LinkedIn profile and image saved!', 'success');
        }
        setShowLinkedInModal(false);
        setLinkedInCandidates([]);
        
        // Optimistically update cache
        queryClient.setQueryData(['contact', contact.id], (old: Contact | undefined) => {
            if (!old) return old;
            return { 
              ...old, 
              linkedinUrl: candidate.url,
              // Force avatar refresh if we updated the image
              ...(candidate.imageUrl ? { avatar: `${API_BASE || ''}/api/contacts/${contact.id}/photo?t=${Date.now()}` } : {})
            };
        });

        // Also invalidate contacts list
        queryClient.invalidateQueries({ queryKey: ['contacts'] });
        
        // Refetch current contact to be sure
        await refetchContact();
        
        // Invalidate and refetch LinkedIn posts now that URL is saved
        queryClient.invalidateQueries({ queryKey: ['linkedin-posts', candidate.url] });
        queryClient.invalidateQueries({ queryKey: ['linkedin-posts'] });
      } else {
        const errorMsg = typeof data?.error === 'string' ? data.error : 
                        typeof data?.message === 'string' ? data.message : 
                        `Save failed (HTTP ${response.status})`;
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error('Error approving LinkedIn:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Failed to save: ${message}`, 'error');
    } finally {
      setApprovingUrl(null);
    }
  };

  // Close modal
  const handleCloseLinkedInModal = () => {
    setShowLinkedInModal(false);
    setLinkedInCandidates([]);
  };

  // Handle missing or invalid contact
  if (!contact || !contact.id) {
    return (
      <div className="flex items-center justify-center h-full bg-[#F0F0F0] p-8">
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-8 text-center max-w-md">
          <i className="fa-solid fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <h2 className="text-xl font-semibold text-primary mb-2">Error Loading Contact</h2>
          <p className="text-secondary mb-4">
            Unable to load contact details. The contact may not exist or there was an error fetching the data.
          </p>
          {fetchError && (
            <p className="text-xs text-red-600 mb-4 font-mono">
              {fetchError instanceof Error ? fetchError.message : String(fetchError)}
            </p>
          )}
          <button 
            onClick={onBack || (() => navigate('/contacts'))}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Back to Contacts
          </button>
        </div>
      </div>
    );
  }
  
  // Generate display values
  const displayName = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || 'Unnamed Contact';
  const initials = displayName.split(' ').map(n => n?.[0] || '').join('').toUpperCase().slice(0, 2);
  
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

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

  const handleRefresh = async () => {
    if (!contact.id) return;
    setIsRefreshing(true);
    try {
      const fresh = await refreshContact(contact.id);
      queryClient.setQueryData(['contact', contact.id], fresh);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      showToast('Contact refreshed from Zoho', 'success');
    } catch (error) {
      console.error('Error refreshing contact:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to refresh contact',
        'error'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle field updates
  const handleFieldUpdate = async (field: string, value: string) => {
    if (!contact.id) return;
    
    try {
      await updateContact.mutateAsync({
        id: contact.id,
        [field]: value || undefined, // Convert empty string to undefined
      });
      
      // Optimistically update the local cache
      queryClient.setQueryData(['contact', contact.id], (old: Contact | undefined) => {
        if (!old) return old;
        return { ...old, [field]: value || undefined };
      });
      
      showToast('Field updated successfully', 'success');
    } catch (error) {
      console.error('Error updating field:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to update field',
        'error'
      );
      throw error; // Re-throw to keep the field in edit mode
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
            <div className="relative w-16 h-16 flex-shrink-0">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                {initials}
              </div>
              {contact.avatar && (
                <img 
                  src={contact.avatar} 
                  alt={displayName} 
                  className="absolute inset-0 w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>
            
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-semibold text-primary">{displayName}</h1>
                <span className={`inline-flex items-center px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded ${
                  contact.type === 'Broker' ? 'bg-[#252525] text-white' :
                  contact.type === 'Disposal Agent' ? 'bg-[#8E8E8E] text-white' :
                  contact.type === 'Tenant' ? 'bg-[#252525] text-white' :
                  'bg-[#F0F0F0] text-[#252525]'
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
                  <span>{contact.territory || contact.company || 'Location not set'}</span>
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
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border border-[#E6E6E6] text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              {isRefreshing ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Refreshing…</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-rotate"></i>
                  <span>Refresh from Zoho</span>
                </>
              )}
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
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-3 gap-6 p-8">
            
            {/* Left Column */}
            <div id="left-column" className="col-span-2 space-y-6">
              
              {/* Contact Info Card */}
              <div id="contact-info-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-primary">Contact Information</h2>
                  <div className="text-xs text-secondary">Click any field to edit</div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <InlineEditField
                    label="First Name"
                    value={contact.firstName}
                    onSave={(value) => handleFieldUpdate('firstName', value)}
                    type="text"
                    required
                  />
                  
                  <InlineEditField
                    label="Last Name"
                    value={contact.lastName}
                    onSave={(value) => handleFieldUpdate('lastName', value)}
                    type="text"
                    required
                  />
                  
                  <InlineEditField
                    label="Email"
                    value={contact.email}
                    onSave={(value) => handleFieldUpdate('email', value)}
                    type="email"
                    copyable
                    onCopy={() => showToast('Email copied to clipboard')}
                    required
                  />
                  
                  <InlineEditField
                    label="Mobile"
                    value={contact.mobile}
                    onSave={(value) => handleFieldUpdate('mobile', value)}
                    type="tel"
                    copyable
                    onCopy={() => showToast('Mobile copied to clipboard')}
                  />
                  
                  <InlineEditField
                    label="Company"
                    value={contact.company}
                    onSave={(value) => handleFieldUpdate('company', value)}
                    type="text"
                  />
                  
                  <InlineEditField
                    label="Role"
                    value={contact.role}
                    onSave={(value) => handleFieldUpdate('role', value)}
                    type="text"
                  />
                  
                  <InlineEditField
                    label="Type"
                    value={contact.type}
                    onSave={(value) => handleFieldUpdate('type', value)}
                    type="select"
                    options={[
                      { value: 'Broker', label: 'Broker' },
                      { value: 'Disposal Agent', label: 'Disposal Agent' },
                      { value: 'Tenant', label: 'Tenant' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                  
                  <InlineEditField
                    label="Commission Structure"
                    value={contact.commissionStructure}
                    onSave={(value) => handleFieldUpdate('commissionStructure', value)}
                    type="text"
                  />
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-medium text-secondary uppercase tracking-wider">Relationship Health</label>
                    </div>
                    
                    <div className="space-y-3">
                      <InlineEditField
                        label="Category"
                        value={contact.relationshipHealth}
                        onSave={(value) => handleFieldUpdate('relationshipHealth', value)}
                        type="select"
                        options={[
                          { value: 'excellent', label: 'Excellent' },
                          { value: 'good', label: 'Good' },
                          { value: 'fair', label: 'Fair' },
                          { value: 'needs-attention', label: 'Needs Attention' },
                        ]}
                      />
                      
                      <InlineEditField
                        label="Score (0-100)"
                        value={contact.relationshipHealthScore ?? 70}
                        onSave={(value) => handleFieldUpdate('relationshipHealthScore', value)}
                        type="number"
                      />
                      
                      <div className="flex items-center space-x-2 py-1">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{ width: `${contact.relationshipHealthScore || 70}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-secondary uppercase tracking-wider mb-2">Last Contacted</label>
                    <span className="text-sm text-primary py-1 block">
                      {formatDate(contact.lastContacted || contact.lastActivity)}
                    </span>
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
                          <button
                            onClick={handleFindLinkedIn}
                            disabled={isSearchingLinkedIn}
                            className="text-secondary hover:text-primary transition-colors ml-2"
                            title="Update LinkedIn Photo/Profile"
                          >
                             <i className={`fa-solid fa-sync ${isSearchingLinkedIn ? 'fa-spin' : ''} text-xs`}></i>
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-secondary">Not linked</span>
                          <button
                            onClick={handleFindLinkedIn}
                            disabled={isSearchingLinkedIn}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#0077B5] hover:bg-[#005885] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                          >
                            {isSearchingLinkedIn ? (
                              <>
                                <i className="fa-solid fa-spinner fa-spin mr-1.5"></i>
                                <span>Searching...</span>
                              </>
                            ) : (
                              <>
                                <i className="fa-brands fa-linkedin mr-1.5"></i>
                                <span>Find LinkedIn</span>
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-[#E6E6E6]">
                  <InlineEditField
                    label="Relationship Notes"
                    value={contact.notes}
                    onSave={(value) => handleFieldUpdate('notes', value)}
                    type="textarea"
                    multiline
                  />
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

                  {/* Recent LinkedIn Activity */}
                  {contact.linkedinUrl && (
                    <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <i className="fa-brands fa-linkedin text-[#0077B5] text-lg"></i>
                          <h2 className="text-lg font-semibold text-primary">Recent LinkedIn Activity</h2>
                          {linkedinPosts?.lastFetched && (
                            <span className="text-xs text-secondary ml-2">
                                (Last synced: {formatDate(linkedinPosts.lastFetched)})
                            </span>
                          )}
                          <button 
                            onClick={handleRefreshPosts}
                            disabled={isRefreshingPosts || isLoadingPosts}
                            className="text-secondary hover:text-primary transition-colors ml-2 p-1"
                            title="Refresh posts"
                          >
                            <i className={`fa-solid fa-rotate ${isRefreshingPosts ? 'fa-spin' : ''} text-xs`}></i>
                          </button>
                        </div>
                        <a 
                          href={contact.linkedinUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-secondary hover:text-primary flex items-center space-x-1"
                        >
                          <span>View on LinkedIn</span>
                          <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                        </a>
                      </div>

                      {isLoadingPosts ? (
                        <div className="flex justify-center py-6">
                          <i className="fa-solid fa-circle-notch fa-spin text-secondary text-xl"></i>
                        </div>
                      ) : linkedinPosts?.data?.data ? (
                        <div className="space-y-4">
                          {(linkedinPosts.data.data as Array<Record<string, unknown>>).slice(0, 3).map((post, i: number) => (
                            <div key={i} className="border-b border-[#E6E6E6] last:border-0 pb-4 last:pb-0">
                              <p className="text-sm text-primary line-clamp-3 mb-2">
                                {(post.text as string) || (post.commentary as string) || (post.description as string) || 'Shared a post'}
                              </p>
                              <div className="flex items-center justify-between text-xs text-secondary">
                                <span>{formatDate((post.postedDate as string) || (post.date as string))}</span>
                                <a 
                                  href={(post.articleUrl as string) || (post.url as string) || (post.link as string) || contact.linkedinUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[#0077B5] hover:underline"
                                >
                                  Read more
                                </a>
                              </div>
                            </div>
                          ))}
                          {linkedinPosts.data.data.length === 0 && (
                            <p className="text-sm text-secondary text-center py-4">No recent public posts found.</p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          {linkedinPosts?.error ? (
                            <div className="flex flex-col items-center text-secondary">
                               <p className="text-sm mb-2">Unable to load posts</p>
                               <p className="text-xs opacity-75">{typeof linkedinPosts.details === 'string' ? linkedinPosts.details.substring(0, 50) + '...' : ''}</p>
                            </div>
                          ) : (
                            <p className="text-sm text-secondary">No posts available.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

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

              {/* Upcoming Actions Card */}
              <div id="upcoming-actions-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Upcoming Actions</h3>
                <div className="text-sm text-secondary">-</div>
              </div>
              
            </div>
          </div>
        )}

        {activeTab === 'Relationship Graph' && (
          <div className="p-8">
            <div className="grid grid-cols-3 gap-6">
              {/* Active Deals Column */}
              <div className="col-span-1 space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Active Deals</h3>
                <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 shadow-sm">
                   <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-[#E6E6E6]">
                     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                       <i className="fa-solid fa-building"></i>
                     </div>
                     <div>
                       <div className="text-sm font-medium text-primary">100 Bishopsgate</div>
                       <div className="text-xs text-secondary">Broker</div>
                     </div>
                   </div>
                   <div className="flex items-center space-x-3">
                     <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                       <i className="fa-solid fa-building"></i>
                     </div>
                     <div>
                       <div className="text-sm font-medium text-primary">22 Bishopsgate</div>
                       <div className="text-xs text-secondary">Tenant Rep</div>
                     </div>
                   </div>
                </div>
              </div>

              {/* Past Clients Column */}
              <div className="col-span-1 space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Past Clients</h3>
                <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 shadow-sm">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                        <i className="fa-solid fa-briefcase"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-primary">Acme Corp</div>
                        <div className="text-xs text-secondary">Tenant Rep (2023)</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                        <i className="fa-solid fa-briefcase"></i>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-primary">Globex Inc.</div>
                        <div className="text-xs text-secondary">Landlord Agent (2022)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colleagues Column */}
              <div className="col-span-1 space-y-4">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Colleagues at {contact.company || 'Company'}</h3>
                <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 shadow-sm">
                   <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">SJ</div>
                      <div>
                        <div className="text-sm font-medium text-primary">Sarah Jones</div>
                        <div className="text-xs text-secondary">Director</div>
                      </div>
                    </div>
                     <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs">MJ</div>
                      <div>
                        <div className="text-sm font-medium text-primary">Mike Johnson</div>
                        <div className="text-xs text-secondary">Associate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Performance' && (
          <div className="p-8">
             {/* Performance Metrics Card */}
            <div id="performance-metrics-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Performance Metrics</h3>
                <select className="text-xs border border-[#E6E6E6] rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option>Last 12 Months</option>
                  <option>Last 6 Months</option>
                  <option>Last Quarter</option>
                </select>
              </div>
              
              <div className="space-y-6">
                <InlineEditField
                  label="Referral Volume"
                  value={contact.referralVolume ?? undefined}
                  onSave={(value) => handleFieldUpdate('referralVolume', value)}
                  type="number"
                  format={(val) => val?.toString() || '-'}
                />
                
                <InlineEditField
                  label="Conversion Rate (%)"
                  value={contact.conversionRate ?? undefined}
                  onSave={(value) => handleFieldUpdate('conversionRate', value)}
                  type="number"
                  format={(val) => val != null ? `${val}%` : '-'}
                />
                {contact.conversionRate != null && (
                  <div className="flex-1 bg-muted rounded-full h-2 -mt-3">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${contact.conversionRate}%` }}></div>
                  </div>
                )}
                
                <InlineEditField
                  label="Revenue Attribution (£)"
                  value={contact.revenueAttribution ?? undefined}
                  onSave={(value) => handleFieldUpdate('revenueAttribution', value)}
                  type="number"
                  format={(val) => val != null ? `£${Number(val).toLocaleString()}` : '-'}
                />
                
                <InlineEditField
                  label="Commission Paid (£)"
                  value={contact.commissionPaid ?? undefined}
                  onSave={(value) => handleFieldUpdate('commissionPaid', value)}
                  type="number"
                  format={(val) => val != null ? `£${Number(val).toLocaleString()}` : '-'}
                />
                
                <InlineEditField
                  label="Quality Score (out of 5.0)"
                  value={contact.qualityScore ?? undefined}
                  onSave={(value) => handleFieldUpdate('qualityScore', value)}
                  type="number"
                  format={(val) => val != null ? `${val}/5.0` : '-'}
                />
                {contact.qualityScore != null && (
                  <div className="flex items-center space-x-1 -mt-3">
                    {Array.from({ length: Math.floor(contact.qualityScore) }).map((_, i) => (
                      <i key={i} className="fa-solid fa-star text-primary text-xs"></i>
                    ))}
                    {contact.qualityScore % 1 !== 0 && (
                      <i className="fa-solid fa-star-half-stroke text-primary text-xs"></i>
                    )}
                  </div>
                )}
              </div>
              
              <button className="w-full mt-6 pt-6 border-t border-[#E6E6E6] text-sm text-primary hover:underline font-medium">
                View Detailed Performance Report
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Communications' && (
          <div className="p-8">
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
            
             {/* Relationship Timeline Card */}
            <div id="relationship-timeline-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm mt-6">
              <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4">Relationship Timeline</h3>
              
              <div className="text-sm text-secondary">-</div>
            </div>
          </div>
        )}

        {activeTab === 'Documents' && (
          <div className="p-8">
             {/* Documents Card */}
            <div id="documents-card" className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-primary">Documents</h2>
                <button className="text-secondary hover:text-primary text-sm transition-colors">
                  <i className="fa-solid fa-upload mr-1"></i>
                  Upload Document
                </button>
              </div>
              
              <div className="text-sm text-secondary">-</div>
            </div>
          </div>
        )}

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
      
      {/* LinkedIn Candidates Modal */}
      {showLinkedInModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={handleCloseLinkedInModal}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#E6E6E6]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center">
                      <i className="fa-brands fa-linkedin text-white text-xl"></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary">Select LinkedIn Profile</h3>
                      <p className="text-sm text-secondary">
                        Choose the correct profile for {contact.firstName} {contact.lastName}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleCloseLinkedInModal}
                    className="text-secondary hover:text-primary transition-colors"
                  >
                    <i className="fa-solid fa-times text-lg"></i>
                  </button>
                </div>
              </div>
              
              {/* Candidates List */}
              <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
                {linkedInCandidates.length === 0 ? (
                  <div className="text-center py-8 text-secondary">
                    <i className="fa-solid fa-search text-3xl mb-3 opacity-50"></i>
                    <p>No profiles found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {linkedInCandidates.map((candidate, index) => (
                      <div 
                        key={index}
                        className="border border-[#E6E6E6] rounded-lg p-4 hover:border-[#0077B5] hover:bg-blue-50/30 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            {candidate.imageUrl ? (
                              <img 
                                src={candidate.imageUrl} 
                                alt={candidate.name}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-[#0077B5] flex items-center justify-center flex-shrink-0">
                                <i className="fa-brands fa-linkedin text-white text-xl"></i>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-primary truncate">{candidate.name}</h4>
                              <p className="text-sm text-secondary line-clamp-2 mt-0.5">{candidate.headline || 'No headline'}</p>
                              <a 
                                href={candidate.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-[#0077B5] hover:underline mt-1 inline-block truncate max-w-full"
                              >
                                {candidate.url.replace('https://www.', '').replace('https://', '')}
                              </a>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2 ml-3">
                            {candidate.matchScore >= 70 && (
                              <span className="inline-flex items-center px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider bg-[#252525] text-white">
                                Best Match
                              </span>
                            )}
                          <button
                            onClick={() => handleApproveLinkedIn(candidate)}
                            disabled={approvingUrl !== null}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#0077B5] hover:bg-[#005885] disabled:opacity-50 rounded-lg transition-colors"
                          >
                              {approvingUrl === candidate.url ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                              ) : (
                                <>
                                  <i className="fa-solid fa-check mr-1"></i>
                                  Select
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-6 py-4 border-t border-[#E6E6E6] bg-muted/30 rounded-b-xl">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-secondary">
                    {linkedInCandidates.length} profile{linkedInCandidates.length !== 1 ? 's' : ''} found
                  </p>
                  <button
                    onClick={handleCloseLinkedInModal}
                    className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border border-[#E6E6E6] rounded-lg hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
