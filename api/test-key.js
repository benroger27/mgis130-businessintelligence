/**
 * Test endpoint to verify API key configuration
 * Visit /api/test-key to check if your API key is working
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Check if API key exists
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      res.status(500).json({
        success: false,
        error: 'API_KEY environment variable is not set',
        help: {
          local: 'Create a .env file with: API_KEY=your_key_here',
          vercel: 'Run: vercel env add API_KEY production',
          dashboard: 'Add API_KEY in Vercel project settings → Environment Variables'
        }
      });
      return;
    }

    // Mask the key for security (show first/last 4 chars)
    const maskedKey = apiKey.length > 8
      ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
      : '****';

    // Test the API key with a simple request
    const testUrl = 'https://api.api-ninjas.com/v1/stockprice?ticker=AAPL';

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({
        success: false,
        error: `API key test failed: ${response.status} ${response.statusText}`,
        apiKeyFound: true,
        apiKeyMasked: maskedKey,
        statusCode: response.status,
        details: errorText,
        help: {
          401: 'API key is invalid. Get a new key from api-ninjas.com',
          403: 'API key lacks permissions or quota exceeded',
          429: 'Rate limit exceeded. Wait or upgrade your plan'
        }[response.status] || 'Check API Ninjas documentation'
      });
      return;
    }

    const data = await response.json();

    // Success!
    res.status(200).json({
      success: true,
      message: '✅ API key is working correctly!',
      apiKeyFound: true,
      apiKeyMasked: maskedKey,
      testResult: {
        ticker: 'AAPL',
        price: data.price,
        message: 'Successfully fetched Apple stock price'
      },
      nextSteps: [
        'Your API key is configured correctly',
        'The main dashboard at / should now work',
        'You can delete /api/test-key.js after testing'
      ]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Test failed with exception',
      message: error.message,
      help: 'Check your network connection and API key validity'
    });
  }
}
