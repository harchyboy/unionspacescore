import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, isSupabaseConfigured } from '../../lib/supabase.js';
import { zohoUpdateProperty } from '../../lib/zoho.js';
import OpenAI from 'openai';
import pdf from 'pdf-parse';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const propertyId = req.query.id as string;
  const { documentUrl } = req.body;

  if (!propertyId || !documentUrl) {
    return res.status(400).json({ error: 'Property ID and Document URL required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  const supabase = getSupabase();
  if (!supabase || !isSupabaseConfigured()) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    console.log(`Extracting data from brochure for property ${propertyId}: ${documentUrl}`);

    // 1. Download the PDF
    const response = await fetch(documentUrl);
    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract Text from PDF
    let textContent = '';
    try {
      const data = await pdf(buffer);
      textContent = data.text;
      // Truncate if too long (OpenAI limit) - 100k chars should be enough for a brochure
      if (textContent.length > 100000) {
        textContent = textContent.substring(0, 100000);
      }
    } catch (e) {
      console.error('PDF parsing error:', e);
      return res.status(500).json({ error: 'Failed to parse PDF text' });
    }

    // 3. Analyze with OpenAI
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const prompt = `
    You are a real estate data extraction assistant. Extract the following property details from the text below.
    Return ONLY a valid JSON object with these keys (use null if not found):
    - total_size_sqft (number, remove commas)
    - floor_count (number)
    - lifts (string description)
    - built_year (number)
    - refurbished_year (number)
    - parking (string description)
    - epc_rating (string, e.g. "A", "B")
    - breeam_rating (string, e.g. "Excellent")
    - marketing_fit_out (string: "Shell", "Cat A", or "Cat A+")

    Text:
    ${textContent}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content from OpenAI');
    }

    const extractedData = JSON.parse(content);
    console.log('Extracted Data:', extractedData);

    // 4. Update Supabase
    // Map extracted keys to DB columns
    const updateData = {
      total_size_sqft: extractedData.total_size_sqft,
      floor_count: extractedData.floor_count,
      lifts: extractedData.lifts,
      built_year: extractedData.built_year,
      refurbished_year: extractedData.refurbished_year,
      parking: extractedData.parking,
      epc_rating: extractedData.epc_rating,
      breeam_rating: extractedData.breeam_rating,
      marketing_fit_out: extractedData.marketing_fit_out,
    };

    // Remove nulls/undefined to avoid overwriting existing data with nulls? 
    // Or should we overwrite? The user said "extract specific information that would be relevant... synced".
    // Usually extraction implies "fill missing or update". 
    // Let's filter out nulls so we don't wipe existing good data if extraction fails to find it.
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([, v]) => v !== null && v !== undefined)
    );

    if (Object.keys(cleanUpdateData).length > 0) {
      const { error: dbError } = await supabase
        .from('properties')
        .update(cleanUpdateData)
        .eq('id', propertyId);

      if (dbError) {
        throw new Error(`Database update failed: ${dbError.message}`);
      }

      // 5. Update Zoho
      // Map DB keys to Zoho API names (need to match ZohoPropertyRecord keys)
      // Based on lib/zoho.ts interface
      const zohoUpdateData: Record<string, unknown> = {};
      if (cleanUpdateData.total_size_sqft) zohoUpdateData.Total_Size_Sq_Ft = cleanUpdateData.total_size_sqft;
      if (cleanUpdateData.floor_count) zohoUpdateData.Floor_Count = cleanUpdateData.floor_count;
      if (cleanUpdateData.lifts) zohoUpdateData.Lifts = cleanUpdateData.lifts;
      if (cleanUpdateData.built_year) zohoUpdateData.Built_Year = cleanUpdateData.built_year;
      if (cleanUpdateData.refurbished_year) zohoUpdateData.Refurbished_Year = cleanUpdateData.refurbished_year;
      if (cleanUpdateData.parking) zohoUpdateData.Parking = cleanUpdateData.parking;
      if (cleanUpdateData.epc_rating) zohoUpdateData.EPC_Rating = cleanUpdateData.epc_rating;
      if (cleanUpdateData.breeam_rating) zohoUpdateData.BREEAM_Rating = cleanUpdateData.breeam_rating;
      if (cleanUpdateData.marketing_fit_out) zohoUpdateData.Marketing_Fit_Out = cleanUpdateData.marketing_fit_out;

      if (Object.keys(zohoUpdateData).length > 0) {
         // We need the Zoho ID. Fetch it from Supabase property first.
         const { data: prop, error: fetchError } = await supabase
           .from('properties')
           .select('zoho_id')
           .eq('id', propertyId)
           .single();
         
         if (!fetchError && prop?.zoho_id) {
            try {
              await zohoUpdateProperty(prop.zoho_id, zohoUpdateData);
            } catch (zohoError) {
              console.error('Zoho update failed:', zohoError);
              // Don't fail the request if Zoho fails, just warn
            }
         }
      }
    }

    return res.status(200).json({ success: true, data: cleanUpdateData });

  } catch (error: unknown) {
    console.error('Extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: errorMessage });
  }
}
