import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase.js';
import formidable from 'formidable';
import type { Fields, Files, File as FormidableFile } from 'formidable';
import { promises as fs } from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable body parser to handle file uploads manually
  },
};

// Helper to parse multipart form data
async function parseForm(req: VercelRequest): Promise<{ fields: Fields; files: Files }> {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 }); // 10MB max
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

  // POST /api/properties/:id/documents - Upload document/image
  if (req.method === 'POST') {
    try {
      const { files } = await parseForm(req);
      
      // Get the uploaded file (formidable returns array)
      const fileArray = files.file;
      const file: FormidableFile | undefined = Array.isArray(fileArray) ? fileArray[0] : fileArray;
      
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Read file content
      const fileBuffer = await fs.readFile(file.filepath);
      const originalName = file.originalFilename || 'unknown';
      const mimeType = file.mimetype || 'application/octet-stream';
      
      // Generate unique filename
      const timestamp = Date.now();
      const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `properties/${propertyId}/${timestamp}_${safeName}`;

      // Check if it's an image
      const isImage = mimeType.startsWith('image/');

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('property-files')
        .upload(storagePath, fileBuffer, {
          contentType: mimeType,
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
      }

      // Return uploaded file info
      return res.status(200).json({
        id: `${timestamp}_${safeName}`,
        url: publicUrl,
        name: originalName,
        size: file.size,
        type: mimeType,
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
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete handler error:', error);
      return res.status(500).json({ error: 'Failed to delete file' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
