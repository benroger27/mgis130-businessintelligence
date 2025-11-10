/**
 * Serverless function to fetch competitor stock prices
 * Deployed on Vercel as an API endpoint
 *
 * This function queries the API Ninjas Stock Price API to retrieve
 * real-time stock data for major technology companies.
 */

// Company mappings with ticker symbols
const COMPANIES = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. (Google)' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' }
];

/**
 * Fetch stock price for a single ticker symbol
 * @param {string} ticker - Stock ticker symbol
 * @param {string} apiKey - API Ninjas API key
 * @returns {Promise<Object>} Stock data object
 */
async function fetchStockPrice(ticker, apiKey) {
  const url = `https://api.api-ninjas.com/v1/stockprice?ticker=${ticker}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${ticker}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Main serverless function handler
 * Vercel automatically calls this as the default export
 */
export default async function handler(req, res) {
  // Enable CORS for frontend requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed. Use GET.' });
    return;
  }

  try {
    // Validate API key exists
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error('API_KEY environment variable is not set');
      res.status(500).json({
        error: 'Server configuration error. API key not found.'
      });
      return;
    }

    // Fetch all stock prices in parallel for better performance
    const stockPromises = COMPANIES.map(async (company) => {
      try {
        const stockData = await fetchStockPrice(company.ticker, apiKey);

        return {
          ticker: company.ticker,
          companyName: company.name,
          price: stockData.price || null,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        // Return error info for this specific stock
        console.error(`Error fetching ${company.ticker}:`, error.message);
        return {
          ticker: company.ticker,
          companyName: company.name,
          price: null,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    });

    // Wait for all requests to complete
    const results = await Promise.all(stockPromises);

    // Check if all requests failed
    const allFailed = results.every(result => result.price === null);
    if (allFailed) {
      res.status(503).json({
        error: 'Unable to fetch stock data from API',
        details: results
      });
      return;
    }

    // Return successful response
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: results
    });

  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in stocks API:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}
