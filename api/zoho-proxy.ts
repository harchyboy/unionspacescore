import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

/**
 * Zoho Creator API Proxy
 * 
 * This serverless function acts as a secure proxy between your frontend
 * and Zoho Creator API, keeping sensitive credentials on the server.
 * 
 * Required environment variables:
 * - ZOHO_OAUTH_TOKEN: Your Zoho OAuth token
 * - ZOHO_API_ENDPOINT: Your Zoho Creator API endpoint URL
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      error: `Method ${req.method} Not Allowed` 
    });
  }

  try {
    // 1. Get the name from the front-end's request body
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ 
        error: 'Missing required field: name' 
      });
    }

    // 2. Get your Zoho credentials securely from environment variables
    const ZOHO_PUBLIC_KEY = process.env.ZOHO_PUBLIC_KEY;
    const ZOHO_API_ENDPOINT = process.env.ZOHO_API_ENDPOINT;

    if (!ZOHO_PUBLIC_KEY || !ZOHO_API_ENDPOINT) {
      console.error('Missing Zoho environment variables');
      return res.status(500).json({ 
        error: 'Server configuration error: Missing Zoho credentials' 
      });
    }

    // 3. Make the API call to Zoho Creator using POST with JSON body
    // For Public Key auth, we append the key to the URL query params
    const url = `${ZOHO_API_ENDPOINT}?publickey=${ZOHO_PUBLIC_KEY}`;
    
    const zohoResponse = await axios.post(
      url,
      {
        // The data payload matching Zoho's expected format
        userName: name
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // 4. Send Zoho's response back to your front end
    return res.status(200).json({
      success: true,
      data: zohoResponse.data
    });

  } catch (error: unknown) {
    const err = error as { response?: { data: unknown; status: number }; request?: unknown; message: string };
    console.error('Error in Zoho proxy:', err.response?.data || err.message);
    
    // Send more specific error information
    if (err.response) {
      // Zoho API returned an error
      return res.status(err.response.status).json({
        error: 'Zoho API error',
        details: err.response.data
      });
    } else if (err.request) {
      // Request was made but no response received
      return res.status(503).json({
        error: 'Unable to reach Zoho API'
      });
    } else {
      // Something else went wrong
      return res.status(500).json({
        error: 'An error occurred while communicating with the backend'
      });
    }
  }
}

