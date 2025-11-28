import React, { useEffect, useState } from 'react';
import { Contact } from '../types';
import Sidebar from '../components/Sidebar';
import AddContactModal from '../components/AddContactModal';

const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/contacts');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      setContacts(data.contacts || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (newContact: any) => {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newContact),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create contact');
    }

    // Refresh list
    fetchContacts();
  };

  return (
    <div id="app-shell" className="flex h-screen overflow-hidden font-sans text-[#252525] bg-[#F0F0F0]">
      <Sidebar activePage="contacts" />
      
      <main id="main-content" className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header id="header" className="bg-white border-b border-[#E6E6E6] px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-6 flex-1">
                <div className="relative flex-1 max-w-xl">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary"></i>
                    <input type="text" placeholder="Search contacts, companies, brokers..." className="w-full pl-11 pr-4 py-2.5 bg-muted border border-[#E6E6E6] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
            </div>
            
            <div className="flex items-center space-x-4">
                <button className="relative p-2 text-secondary hover:text-primary transition-all-smooth">
                    <i className="fa-solid fa-bell text-lg"></i>
                    <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                </button>
                <button className="p-2 text-secondary hover:text-primary transition-all-smooth">
                    <i className="fa-solid fa-question-circle text-lg"></i>
                </button>
            </div>
        </header>
        
        {/* Page Header */}
        <div id="page-header" className="bg-white border-b border-[#E6E6E6] px-8 py-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-primary mb-2">Contacts</h1>
                    <p className="text-secondary text-sm">Manage brokers, tenants, landlords, and supplier relationships</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    id="add-contact-btn" 
                    className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-opacity-90 transition-all-smooth flex items-center space-x-2"
                >
                    <i className="fa-solid fa-plus"></i>
                    <span>Add Contact</span>
                </button>
            </div>
            
            <div className="flex items-center space-x-4 mt-6 overflow-x-auto">
                <button className="px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary whitespace-nowrap">Brokers</button>
                <button className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border-b-2 border-transparent hover:border-secondary transition-all-smooth whitespace-nowrap">Disposal Agents</button>
                <button className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border-b-2 border-transparent hover:border-secondary transition-all-smooth whitespace-nowrap">Traditional Tenant Reps</button>
                <button className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border-b-2 border-transparent hover:border-secondary transition-all-smooth whitespace-nowrap">Landlords</button>
                <button className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border-b-2 border-transparent hover:border-secondary transition-all-smooth whitespace-nowrap">Clients / Occupiers</button>
                <button className="px-4 py-2 text-sm font-medium text-secondary hover:text-primary border-b-2 border-transparent hover:border-secondary transition-all-smooth whitespace-nowrap">Suppliers</button>
                <div className="flex-1"></div>
                <button className="text-secondary hover:text-primary text-sm flex items-center space-x-1">
                    <i className="fa-solid fa-filter"></i>
                    <span>Filters</span>
                </button>
                <button className="text-secondary hover:text-primary text-sm flex items-center space-x-1">
                    <i className="fa-solid fa-download"></i>
                    <span>Export</span>
                </button>
            </div>
        </div>
        
        {/* Filters Section */}
        <div id="filters-section" className="bg-white border-b border-[#E6E6E6] px-8 py-4">
            <div className="flex items-center space-x-3 flex-wrap gap-2">
                <div className="relative">
                    <select className="appearance-none bg-muted border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">All Firms</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
                </div>

                <div className="relative">
                    <select className="appearance-none bg-muted border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">All Submarkets</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
                </div>

                <div className="relative">
                    <select className="appearance-none bg-muted border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">All Activity</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
                </div>

                <div className="relative">
                    <select className="appearance-none bg-muted border border-[#E6E6E6] rounded-lg px-4 py-2 pr-8 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">All Relationship Health</option>
                    </select>
                    <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary text-xs pointer-events-none"></i>
                </div>
                
                <button className="text-secondary hover:text-primary text-sm ml-2">
                    Clear all
                </button>
            </div>
        </div>
        
        {/* Contacts List */}
        <div id="contacts-list" className="flex-1 overflow-y-auto bg-[#F0F0F0] px-8 py-6">
            <div className="bg-white rounded-lg border border-[#E6E6E6] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted border-b border-[#E6E6E6]">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input type="checkbox" className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wider">Last Activity</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-secondary uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E6E6E6]">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-secondary">
                                        <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                                        Loading contacts from Zoho...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-red-500">
                                        Error loading contacts: {error}
                                    </td>
                                </tr>
                            ) : contacts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-secondary">
                                        No contacts found. Click "Add Contact" to create one.
                                    </td>
                                </tr>
                            ) : (
                                contacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-muted transition-all-smooth cursor-pointer group">
                                        <td className="px-6 py-4">
                                            <input type="checkbox" className="w-4 h-4 text-primary border-[#E6E6E6] rounded focus:ring-primary" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                {/* Avatar Placeholder */}
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-secondary font-bold">
                                                    {contact.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-primary text-sm">{contact.name}</div>
                                                    <div className="text-xs text-secondary">{contact.role || 'No Role'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-white">
                                                <i className="fa-solid fa-user mr-1.5"></i>
                                                Contact
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-primary">{contact.company || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-primary">{contact.email || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-secondary">{contact.phone || '-'}</td>
                                        <td className="px-6 py-4 text-sm text-secondary">
                                            {contact.lastContacted ? new Date(contact.lastContacted).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-secondary hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                <i className="fa-solid fa-ellipsis-vertical"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <AddContactModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onAdd={handleAddContact} 
        />
      </main>
    </div>
  );
};

export default ContactsPage;
