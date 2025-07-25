import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// M-Pesa authentication endpoint to generate access tokens
export async function POST(request: NextRequest) {
  try {
    const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
    const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
    const ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox';

    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
      return NextResponse.json(
        { error: 'M-Pesa credentials not configured' },
        { status: 500 }
      );
    }

    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const url = ENVIRONMENT === 'production' 
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json({
      success: true,
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
    });

  } catch (error: any) {
    console.error('M-Pesa auth error:', error.response?.data || error.message);
    return NextResponse.json(
      { 
        error: 'Failed to generate access token',
        details: error.response?.data || error.message 
      },
      { status: 500 }
    );
  }
}
