interface FileRowProps {
  name: string;
  size?: string;
  uploadedAt?: string;
  onDownload?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function FileRow({ name, size, uploadedAt, onDownload, onDelete, className = '' }: FileRowProps) {
  return (
    <div className={`flex items-center justify-between p-3 bg-white border border-[#E6E6E6] rounded-lg ${className}`}>
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <div className="w-10 h-10 bg-[#fafafa] rounded flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-[#8e8e8e]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-[#252525] truncate">{name}</div>
          {(size || uploadedAt) && (
            <div className="text-xs text-[#8e8e8e]">
              {size && <span>{size}</span>}
              {size && uploadedAt && <span> • </span>}
              {uploadedAt && <span>{uploadedAt}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 ml-4">
        {onDownload && (
          <button
            onClick={onDownload}
            className="text-[#8e8e8e] hover:text-[#252525] p-1"
            aria-label={`Download ${name}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-[#8e8e8e] hover:text-red-600 p-1"
            aria-label={`Delete ${name}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

