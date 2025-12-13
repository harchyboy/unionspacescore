import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase.js';
import formidable from 'formidable';
import type { Fields, Files, File as FormidableFile } from 'formidable';
import { promises as fs } from 'fs';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle file uploads manually
  },
};

// Image optimization settings
const IMAGE_MAX_WIDTH = 1920;  // Max width for property images
const IMAGE_MAX_HEIGHT = 1080; // Max height for property images
const WEBP_QUALITY = 80;       // WebP quality (0-100)

// Helper to parse multipart form data
async function parseForm(req: VercelRequest): Promise<{ fields: Fields; files: Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 25 * 1024 * 1024 }); // 25MB max
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const propertyId = req.query.id as string;

  if (!propertyId) {
    return res.status(400).json({ error: 'Property ID required' });
  }

  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  // POST /api/properties/:id/documents - Upload document/image or generate signed URL
  if (req.method === 'POST') {
    // Check if JSON request (for Signed URL generation or linking)
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      // Parse JSON body
      interface RequestBody {
        action?: string;
        filename?: string;
        contentType?: string;
        storagePath?: string;
        size?: number;
        type?: string;
        publicUrl?: string;
      }
      const body = await new Promise<RequestBody>((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });

      // Action: Generate Signed Upload URL
      if (body.action === 'get-upload-url') {
        const { filename, contentType: bodyContentType } = body;
        if (!filename) return res.status(400).json({ error: 'Filename required' });

        const timestamp = Date.now();
        const baseNameWithoutExt = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_');
        const ext = filename.split('.').pop();
        const finalFileName = `${timestamp}_${baseNameWithoutExt}.${ext}`;
        
        const isImage = bodyContentType?.startsWith('image/');
        const folder = isImage ? '' : 'documents/';
        const storagePath = `properties/${propertyId}/${folder}${finalFileName}`;

        const { data, error } = await supabase.storage
          .from('property-files')
          .createSignedUploadUrl(storagePath);

        if (error) {
          console.error('Error creating signed URL:', error);
          return res.status(500).json({ error: 'Failed to create upload URL' });
        }

        // Get public URL for later use
        const { data: urlData } = supabase.storage
          .from('property-files')
          .getPublicUrl(storagePath);

        return res.status(200).json({
          signedUrl: data?.signedUrl,
          path: storagePath,
          publicUrl: urlData.publicUrl,
          token: data?.token,
          finalFileName
        });
      }

      // Action: Link uploaded file to property
      if (body.action === 'link-file') {
        const { storagePath, filename, type, publicUrl } = body;
        
        if (!storagePath || !publicUrl) {
          return res.status(400).json({ error: 'Storage path and URL required' });
        }

        const isImage = type?.startsWith('image/');

        if (isImage) {
          // Get current property
          const { data: property, error: fetchError } = await supabase
            .from('properties')
            .select('images')
            .eq('id', propertyId)
            .single();

          if (fetchError) {
            return res.status(500).json({ error: 'Failed to fetch property' });
          }

          const currentImages = property.images || [];
          const updatedImages = [...currentImages, publicUrl];

          const { error: updateError } = await supabase
            .from('properties')
            .update({ images: updatedImages })
            .eq('id', propertyId);

          if (updateError) {
            return res.status(500).json({ error: 'Failed to update property images' });
          }
        } else {
          // Get current property
          const { data: property, error: fetchError } = await supabase
            .from('properties')
            .select('documents')
            .eq('id', propertyId)
            .single();

          if (fetchError) {
            return res.status(500).json({ error: 'Failed to fetch property' });
          }

          const currentDocs = property.documents || [];
          const newDoc = {
            name: filename,
            url: publicUrl,
            type: type || 'application/octet-stream',
            uploaded_at: new Date().toISOString()
          };
          const updatedDocs = [...currentDocs, newDoc];

          const { error: updateError } = await supabase
            .from('properties')
            .update({ documents: updatedDocs })
            .eq('id', propertyId);

          if (updateError) {
            return res.status(500).json({ error: 'Failed to update property documents' });
          }
        }

        return res.status(200).json({ success: true, url: publicUrl });
      }
    }

    // Fallback to legacy multipart upload
    try {
      const { files } = await parseForm(req);
      
      // Get the uploaded file (formidable returns array)
      const fileArray = files.file;
      const file: FormidableFile | undefined = Array.isArray(fileArray) ? fileArray[0] : fileArray;
      
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Read file content
      let fileBuffer: Buffer = await fs.readFile(file.filepath);
      const originalName = file.originalFilename || 'unknown';
      const mimeType = file.mimetype || 'application/octet-stream';
      
      // Check if it's an image
      const isImage = mimeType.startsWith('image/');
      
      // Generate unique filename
      const timestamp = Date.now();
      const baseNameWithoutExt = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_');
      
      let finalMimeType = mimeType;
      let finalFileName: string;
      let optimizedSize = file.size;

      // Optimize images: convert to WebP and resize if needed
      if (isImage) {
        try {
          const optimizedBuffer = await sharp(fileBuffer)
            .resize(IMAGE_MAX_WIDTH, IMAGE_MAX_HEIGHT, {
              fit: 'inside',           // Maintain aspect ratio, fit within bounds
              withoutEnlargement: true // Don't upscale small images
            })
            .webp({ quality: WEBP_QUALITY })
            .toBuffer();
          
          fileBuffer = optimizedBuffer;
          finalMimeType = 'image/webp';
          finalFileName = `${baseNameWithoutExt}.webp`;
          optimizedSize = optimizedBuffer.length;
          
          console.log(`Image optimized: ${originalName} (${file.size} bytes) -> ${finalFileName} (${optimizedSize} bytes) - ${Math.round((1 - optimizedSize / file.size) * 100)}% reduction`);
        } catch (sharpError) {
          console.warn('Image optimization failed, uploading original:', sharpError);
          finalFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
        }
      } else {
        finalFileName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      }

      // Use 'documents' folder for non-image files
      const folder = isImage ? '' : 'documents/';
      const storagePath = `properties/${propertyId}/${folder}${timestamp}_${finalFileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('property-files')
        .upload(storagePath, fileBuffer, {
          contentType: finalMimeType,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ error: 'Failed to upload file', details: uploadError.message });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('property-files')
        .getPublicUrl(storagePath);

      const publicUrl = urlData.publicUrl;

      // If it's an image, add to property's images array
      if (isImage) {
        // Get current property
        const { data: property, error: fetchError } = await supabase
          .from('properties')
          .select('images')
          .eq('id', propertyId)
          .single();

        if (fetchError) {
          console.error('Error fetching property:', fetchError);
          return res.status(500).json({ error: 'Failed to fetch property' });
        }

        // Append new image URL to existing images
        const currentImages = property.images || [];
        const updatedImages = [...currentImages, publicUrl];

        // Update property
        const { error: updateError } = await supabase
          .from('properties')
          .update({ images: updatedImages })
          .eq('id', propertyId);

        if (updateError) {
          console.error('Error updating property images:', updateError);
          return res.status(500).json({ error: 'Failed to update property images' });
        }
      } else {
        // Add to documents array
        const { data: property, error: fetchError } = await supabase
          .from('properties')
          .select('documents')
          .eq('id', propertyId)
          .single();

        if (fetchError) {
          console.error('Error fetching property:', fetchError);
          return res.status(500).json({ error: 'Failed to fetch property' });
        }

        const currentDocs = property.documents || [];
        const newDoc = {
          name: originalName,
          url: publicUrl,
          type: finalMimeType,
          uploaded_at: new Date().toISOString()
        };
        const updatedDocs = [...currentDocs, newDoc];

        const { error: updateError } = await supabase
          .from('properties')
          .update({ documents: updatedDocs })
          .eq('id', propertyId);

        if (updateError) {
          console.error('Error updating property documents:', updateError);
          return res.status(500).json({ error: 'Failed to update property documents' });
        }
      }

      // Return uploaded file info
      return res.status(200).json({
        id: `${timestamp}_${finalFileName}`,
        url: publicUrl,
        name: originalName,
        optimizedName: finalFileName,
        originalSize: file.size,
        optimizedSize,
        type: finalMimeType,
        isImage,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Upload handler error:', error);
      return res.status(500).json({ error: 'Failed to process upload' });
    }
  }

  // DELETE /api/properties/:id/documents?url=... - Delete a document/image
  if (req.method === 'DELETE') {
    const imageUrl = req.query.url as string;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    try {
      // Extract storage path from URL
      // URL format: https://xxx.supabase.co/storage/v1/object/public/property-files/properties/{id}/{filename}
      // OR properties/{id}/documents/{filename}
      const pathMatch = imageUrl.match(/property-files\/(.+)$/);
      if (!pathMatch) {
        return res.status(400).json({ error: 'Invalid file URL' });
      }
      
      const storagePath = pathMatch[1];

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('property-files')
        .remove([storagePath]);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        return res.status(500).json({ error: 'Failed to delete file' });
      }

      // Check if it's an image and remove from property's images array
      const isImage = /\.(png|jpe?g|gif|webp)$/i.test(imageUrl);
      if (isImage) {
        // Get current property
        const { data: property } = await supabase
          .from('properties')
          .select('images')
          .eq('id', propertyId)
          .single();

        if (property && property.images) {
          const updatedImages = property.images.filter((img: string) => img !== imageUrl);
          
          await supabase
            .from('properties')
            .update({ images: updatedImages })
            .eq('id', propertyId);
        }
      } else {
        // Remove from documents
        const { data: property } = await supabase
          .from('properties')
          .select('documents')
          .eq('id', propertyId)
          .single();

        if (property && property.documents) {
          const updatedDocs = property.documents.filter((doc: { url: string }) => doc.url !== imageUrl);
          
          await supabase
            .from('properties')
            .update({ documents: updatedDocs })
            .eq('id', propertyId);
        }
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete handler error:', error);
      return res.status(500).json({ error: 'Failed to delete file' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
