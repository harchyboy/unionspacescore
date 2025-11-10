interface ContactCardProps {
  name: string;
  role?: string;
  firm?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  onEmail?: () => void;
  onCall?: () => void;
  className?: string;
}

export function ContactCard({
  name,
  role,
  firm,
  email: _email,
  phone: _phone,
  avatar,
  onEmail,
  onCall,
  className = '',
}: ContactCardProps) {
  return (
    <div className={`bg-white border border-[#E6E6E6] rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        {avatar ? (
          <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 bg-[#252525] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[#252525] truncate">{name}</div>
          {firm && <div className="text-xs text-[#8e8e8e] truncate">{firm}</div>}
          {role && <div className="text-xs text-[#8e8e8e] truncate">{role}</div>}
        </div>
      </div>
      {(onEmail || onCall) && (
        <div className="grid grid-cols-2 gap-2">
          {onEmail && (
            <button
              onClick={onEmail}
              className="w-full px-3 py-2 text-xs text-[#252525] border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa] transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Email</span>
            </button>
          )}
          {onCall && (
            <button
              onClick={onCall}
              className="w-full px-3 py-2 text-xs text-[#252525] border border-[#E6E6E6] rounded-lg hover:bg-[#fafafa] transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>Call</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

