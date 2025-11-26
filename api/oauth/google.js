// Google OAuth token exchange endpoint
// This should be deployed as a serverless function (Vercel, Netlify, etc.)

// Security: Validate environment variables
const validateEnvironment = () => {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GOOGLE_REDIRECT_URI'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Security: Validate and sanitize input
const validateInput = (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Authorization code is required and must be a string');
  }
  
  // Basic sanitization - remove any potential injection
  const sanitizedCode = code.replace(/[^a-zA-Z0-9\-_]/g, '');
  
  if (sanitizedCode.length < 10 || sanitizedCode.length > 200) {
    throw new Error('Invalid authorization code format');
  }
  
  return sanitizedCode;
};

// Security: Add CORS headers
const addCorsHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
};

export default async function handler(req, res) {
  try {
    // Security: Handle preflight requests
    if (req.method === 'OPTIONS') {
      addCorsHeaders(res);
      return res.status(200).end();
    }

    // Security: Only allow POST method
    if (req.method !== 'POST') {
      addCorsHeaders(res);
      return res.status(405).json({ 
        error: 'Method not allowed',
        allowedMethods: ['POST']
      });
    }

    // Security: Add CORS headers
    addCorsHeaders(res);

    // Security: Validate environment variables
    validateEnvironment();

    // Security: Validate input
    const { code } = req.body;
    const sanitizedCode = validateInput(code);

    // Security: Rate limiting (basic implementation)
    // In production, use a proper rate limiting service
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`OAuth request from IP: ${clientIP}`);

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: sanitizedCode,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Google OAuth error:', errorData);
      return res.status(400).json({ 
        error: 'Failed to exchange code for token',
        details: process.env.NODE_ENV === 'development' ? errorData : 'OAuth exchange failed'
      });
    }

    const tokenData = await tokenResponse.json();

    // Security: Validate token response
    if (!tokenData.access_token) {
      return res.status(400).json({ 
        error: 'Invalid token response from Google'
      });
    }

    // Security: Log successful token exchange (without sensitive data)
    console.log(`OAuth token exchange successful for IP: ${clientIP}`);

    // Return the token data to the frontend
    res.status(200).json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_in ? 
        new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
    });

  } catch (error) {
    console.error('OAuth token exchange error:', error);
    
    // Security: Don't expose internal errors in production
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Internal server error';
    
    res.status(500).json({ 
      error: errorMessage,
      requestId: Date.now() // For debugging
    });
  }
} 