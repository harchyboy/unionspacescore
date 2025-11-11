import type { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { SearchInput } from '../ui/SearchInput';
import { Select } from '../ui/Select';

export interface Communication {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  subject?: string;
  from?: string;
  to?: string;
  duration?: string;
  location?: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

interface CommunicationLogProps {
  communications: Communication[];
  onSearch?: (query: string) => void;
  onFilter?: (type: string) => void;
}

const typeIcons: Record<Communication['type'], string> = {
  email: 'fa-envelope',
  call: 'fa-phone',
  meeting: 'fa-calendar',
  note: 'fa-sticky-note',
};

const typeLabels: Record<Communication['type'], string> = {
  email: 'Email',
  call: 'Call',
  meeting: 'Meeting',
  note: 'Note',
};

export function CommunicationLog({
  communications,
  onSearch,
  onFilter,
}: CommunicationLogProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Communications History</CardTitle>
          <div className="flex items-center space-x-2">
            {onSearch && (
              <div className="w-64">
                <SearchInput
                  placeholder="Search communications..."
                  onSearch={onSearch}
                  className="w-full"
                />
              </div>
            )}
            {onFilter && (
              <Select
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'email', label: 'Email' },
                  { value: 'call', label: 'Call' },
                  { value: 'meeting', label: 'Meeting' },
                  { value: 'note', label: 'Note' },
                ]}
                value="all"
                onChange={(e) => onFilter(e.target.value)}
                className="w-40"
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {communications.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <i className="fa-solid fa-inbox text-3xl mb-2"></i>
            <p>No communications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {communications.map((comm) => (
              <div key={comm.id} className="flex space-x-4 pb-4 border-b border-[#E6E6E6] last:border-0">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <i className={`fa-solid ${typeIcons[comm.type]} text-white text-sm`}></i>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-primary text-sm mb-1">
                        {comm.type === 'email' && comm.subject
                          ? `Email: ${comm.subject}`
                          : comm.type === 'call'
                            ? `Call: ${comm.subject || 'Phone Call'}`
                            : comm.type === 'meeting'
                              ? `Meeting: ${comm.subject || 'Meeting'}`
                              : `Note: ${comm.subject || 'Note'}`}
                      </div>
                      {comm.type === 'email' && (
                        <div className="text-xs text-secondary">
                          {comm.from && `From: ${comm.from}`}
                          {comm.to && `To: ${comm.to}`}
                        </div>
                      )}
                      {comm.type === 'call' && comm.duration && (
                        <div className="text-xs text-secondary">Duration: {comm.duration}</div>
                      )}
                      {comm.type === 'meeting' && comm.location && (
                        <div className="text-xs text-secondary">Location: {comm.location}</div>
                      )}
                    </div>
                    <div className="text-xs text-secondary">{formatDate(comm.timestamp)}</div>
                  </div>
                  <p className="text-sm text-primary leading-relaxed mb-3">{comm.content}</p>
                  <div className="flex items-center space-x-3">
                    {comm.type === 'email' && (
                      <>
                        <button className="text-xs text-primary hover:underline">View Full Email</button>
                        <button className="text-xs text-primary hover:underline">Reply</button>
                        <button className="text-xs text-primary hover:underline">Forward</button>
                      </>
                    )}
                    {comm.type === 'call' && (
                      <>
                        <button className="text-xs text-primary hover:underline">View Call Notes</button>
                        <button className="text-xs text-primary hover:underline">Schedule Follow-up</button>
                      </>
                    )}
                    {comm.type === 'meeting' && (
                      <>
                        <button className="text-xs text-primary hover:underline">View Meeting Notes</button>
                        <button className="text-xs text-primary hover:underline">Schedule Next</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

