import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export interface Communication {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'note';
  subject: string;
  date: string;
  summary?: string;
}

interface CommunicationLogProps {
  communications: Communication[];
}

export function CommunicationLog({ communications }: CommunicationLogProps) {
  const getIcon = (type: Communication['type']) => {
    switch (type) {
      case 'email':
        return 'fa-envelope';
      case 'call':
        return 'fa-phone';
      case 'meeting':
        return 'fa-calendar';
      case 'note':
        return 'fa-sticky-note';
      default:
        return 'fa-comment';
    }
  };

  if (communications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Communications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <i className="fa-solid fa-comments text-4xl text-muted mb-3"></i>
            <p className="text-secondary">No communications yet</p>
            <p className="text-sm text-secondary/70 mt-1">
              Communications will appear here once connected to Zoho
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {communications.map((comm) => (
            <div
              key={comm.id}
              className="flex items-start gap-3 pb-4 border-b border-[#E6E6E6] last:border-0 last:pb-0"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <i className={`fa-solid ${getIcon(comm.type)} text-primary text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-primary truncate">{comm.subject}</p>
                  <span className="text-xs text-secondary flex-shrink-0">{comm.date}</span>
                </div>
                {comm.summary && (
                  <p className="text-sm text-secondary mt-1 line-clamp-2">{comm.summary}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

