import { useState } from 'react';
import type { Property } from '../../../types/property';
import { FileRow } from '../../../components/ui/FileRow';
import { useUploadDocument } from '../../../api/properties';

interface DocumentsMediaTabProps {
  property: Property;
}

export function DocumentsMediaTab({ property }: DocumentsMediaTabProps) {
  const [uploading, setUploading] = useState(false);
  const uploadDocument = useUploadDocument();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload PDF, DOCX, PNG, or JPG files only');
      return;
    }

    setUploading(true);
    try {
      await uploadDocument.mutateAsync({ id: property.id, file });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#252525]">Documents</h2>
          <label className="bg-[#252525] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all cursor-pointer flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        <div className="space-y-2">
          <FileRow
            name="Sample Document.pdf"
            size="2.4 MB"
            uploadedAt="2024-12-10"
            onDownload={() => console.log('Download')}
            onDelete={() => console.log('Delete')}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <h2 className="text-xl font-semibold text-[#252525] mb-4">Media Gallery</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="aspect-square bg-[#fafafa] rounded-lg flex items-center justify-center">
            <svg className="w-12 h-12 text-[#8e8e8e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

