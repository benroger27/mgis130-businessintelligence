/**
 * Serverless function to fetch competitor stock prices and economic indicators
 * Deployed on Vercel as an API endpoint
 *
 * This function queries the API Ninjas APIs to retrieve:
 * - Real-time stock data for major technology companies
 * - Economic indicators (interest rates, inflation)
 */

// Expanded company mappings with ticker symbols
const COMPANIES = [
  // FAANG + Major Tech
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. (Google)', sector: 'Technology' },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-commerce/Cloud' },

  // Additional Tech Giants
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive/Energy' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors' },
  { ticker: 'NFLX', name: 'Netflix Inc.', sector: 'Streaming' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductors' },
  { ticker: 'INTC', name: 'Intel Corporation', sector: 'Semiconductors' },

  // Other Notable Companies
  { ticker: 'ORCL', name: 'Oracle Corporation', sector: 'Software' },
  { ticker: 'ADBE', name: 'Adobe Inc.', sector: 'Software' },
  { ticker: 'CRM', name: 'Salesforce Inc.', sector: 'Cloud/SaaS' },
  { ticker: 'IBM', name: 'IBM Corporation', sector: 'Technology' },
  { ticker: 'CSCO', name: 'Cisco Systems', sector: 'Networking' }
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
 * Fetch inflation data
 * @param {string} apiKey - API Ninjas API key
 * @returns {Promise<Object>} Inflation data object
 */
async function fetchInflation(apiKey) {
  const url = 'https://api.api-ninjas.com/v1/inflation';

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch inflation: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  // API returns array of inflation data, get most recent
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Fetch interest rate data
 * @param {string} apiKey - API Ninjas API key
 * @returns {Promise<Object>} Interest rate data object
 */
async function fetchInterestRate(apiKey) {
  const url = 'https://api.api-ninjas.com/v1/interestrate';

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch interest rate: ${response.status} ${response.statusText}`);
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
          sector: company.sector,
          price: stockData.price || null,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        // Return error info for this specific stock
        console.error(`Error fetching ${company.ticker}:`, error.message);
        return {
          ticker: company.ticker,
          companyName: company.name,
          sector: company.sector,
          price: null,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    });

    // Fetch economic indicators in parallel
    const economicPromises = [
      fetchInflation(apiKey).catch(err => {
        console.error('Inflation fetch error:', err.message);
        return { error: err.message };
      }),
      fetchInterestRate(apiKey).catch(err => {
        console.error('Interest rate fetch error:', err.message);
        return { error: err.message };
      })
    ];

    // Wait for all requests to complete
    const [stockResults, [inflationData, interestRateData]] = await Promise.all([
      Promise.all(stockPromises),
      Promise.all(economicPromises)
    ]);

    // Process economic indicators
    const economicIndicators = {
      inflation: inflationData && !inflationData.error ? {
        rate: inflationData.rate || inflationData.yearly_rate_pct,
        period: inflationData.period || inflationData.year,
        type: inflationData.type || 'CPI',
        country: inflationData.country || 'USA'
      } : {
        rate: null,
        error: inflationData?.error || 'Data not available'
      },
      interestRate: interestRateData && !interestRateData.error ? {
        centralBankRate: interestRateData.central_bank_rates?.[0]?.rate_pct ||
                        interestRateData.rate_pct ||
                        interestRateData.non_central_bank_rates?.[0]?.rate_pct,
        rateName: interestRateData.central_bank_rates?.[0]?.rate_name ||
                  interestRateData.rate_name ||
                  'Federal Funds Rate',
        country: interestRateData.central_bank_rates?.[0]?.country ||
                 interestRateData.country ||
                 'USA'
      } : {
        centralBankRate: null,
        error: interestRateData?.error || 'Data not available'
      }
    };

    // Check if all stock requests failed
    const allStocksFailed = stockResults.every(result => result.price === null);
    if (allStocksFailed) {
      res.status(503).json({
        error: 'Unable to fetch stock data from API',
        details: stockResults,
        economicIndicators
      });
      return;
    }

    // Return successful response with both stocks and economic indicators
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      stocks: stockResults,
      economicIndicators
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
