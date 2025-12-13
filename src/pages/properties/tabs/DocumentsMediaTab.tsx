import { useState } from 'react';
import type { Property } from '../../../types/property';
import { FileRow } from '../../../components/ui/FileRow';
import { useUploadDocument, useDeleteDocument, useDeleteImage } from '../../../api/properties';

interface DocumentsMediaTabProps {
  property: Property;
}

export function DocumentsMediaTab({ property }: DocumentsMediaTabProps) {
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const deleteImage = useDeleteImage();

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload PDF or DOCX files for documents.');
      return;
    }

    setUploadingDoc(true);
    try {
      await uploadDocument.mutateAsync({ id: property.id, file });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingDoc(false);
      e.target.value = '';
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload PNG, JPG or WebP files for images.');
      return;
    }

    setUploadingImg(true);
    try {
      await uploadDocument.mutateAsync({ id: property.id, file });
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadingImg(false);
      e.target.value = '';
    }
  };

  const handleDocDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument.mutateAsync({ propertyId: property.id, documentId: docId });
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      await deleteImage.mutateAsync({ propertyId: property.id, imageUrl });
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Documents Section */}
      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#252525]">Documents</h2>
          <label className={`inline-flex items-center justify-center font-medium rounded transition-all-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#252525] px-5 py-2.5 text-sm gap-2 bg-[#252525] text-white hover:bg-[#252525]/90 cursor-pointer ${
            uploadingDoc ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span>{uploadingDoc ? 'Uploading...' : 'Upload Document'}</span>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleDocumentUpload}
              disabled={uploadingDoc}
              className="hidden"
            />
          </label>
        </div>
        <div className="space-y-2">
          {(!property.documents || property.documents.length === 0) && (
            <div className="text-center py-8 text-gray-500 text-sm">No documents uploaded yet.</div>
          )}
          {property.documents?.map((doc) => (
            <FileRow
              key={doc.id}
              name={doc.name}
              size={doc.size}
              uploadedAt={doc.uploadedAt}
              onDownload={() => window.open(doc.url, '_blank')}
              onDelete={() => handleDocDelete(doc.id)}
            />
          ))}
        </div>
      </div>

      {/* Media Gallery Section */}
      <div className="bg-white rounded-lg border border-[#E6E6E6] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#252525]">Media Gallery</h2>
          <label className={`inline-flex items-center justify-center font-medium rounded transition-all-smooth focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#252525] px-5 py-2.5 text-sm gap-2 bg-[#252525] text-white hover:bg-[#252525]/90 cursor-pointer ${
            uploadingImg ? 'opacity-50 cursor-not-allowed' : ''
          }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{uploadingImg ? 'Uploading...' : 'Upload Image'}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageUpload}
              disabled={uploadingImg}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {property.images?.map((url, index) => (
            <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img src={url} alt={`Property ${index + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleImageDelete(url)}
                  className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50"
                  title="Delete Image"
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
              </div>
            </div>
          ))}
          {(!property.images || property.images.length === 0) && (
            <div className="col-span-4 text-center py-8 text-gray-500 text-sm">No images uploaded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
