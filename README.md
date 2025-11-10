# 📊 Competitive Intelligence Dashboard

A production-ready business intelligence dashboard that tracks competitor stock performance across major technology companies. Built for deployment on Vercel with serverless architecture.

![Business Intelligence Dashboard](https://img.shields.io/badge/Business-Intelligence-blue)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow)

## 🎯 Business Context

This dashboard helps business professionals quickly assess competitive positioning by comparing real-time stock performance across major technology companies. The export function allows data to be used in reports, presentations, and strategic planning sessions.

## ✨ Features

### Core Functionality
- **Real-time Stock Data**: Live tracking of Apple, Microsoft, Google, Meta, and Amazon stock prices
- **Visual Indicators**: Automatic highlighting of highest (green) and lowest (red) performing stocks
- **Data Export**: One-click CSV export for integration with business reports
- **Refresh Capability**: Manual data refresh to get latest market information
- **Professional Design**: High-contrast, accessible UI suitable for business presentations

### Technical Features
- **Serverless Architecture**: Efficient, scalable API endpoint using Vercel Functions
- **Secure API Calls**: Backend API key management prevents exposure of credentials
- **Error Handling**: Graceful error states with user-friendly messages
- **Loading States**: Visual feedback during data fetching
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Accessibility**: WCAG AA compliant with high contrast and keyboard navigation support

## 🏗️ Architecture

```
/
├── api/
│   └── stocks.js          # Serverless function for stock data
├── index.html             # Frontend dashboard
├── vercel.json            # Vercel deployment configuration
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

### Technology Stack
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js serverless functions (Vercel)
- **API**: API Ninjas Stock Price API
- **Deployment**: Vercel
- **Data Format**: JSON, CSV export

## 🚀 Deployment Instructions

### Prerequisites
1. A Vercel account (free tier available at [vercel.com](https://vercel.com))
2. An API key from API Ninjas ([api-ninjas.com](https://api-ninjas.com))

### Step 1: Get Your API Key
1. Visit [https://api-ninjas.com](https://api-ninjas.com)
2. Sign up for a free account
3. Navigate to "My Account" → "API Key"
4. Copy your API key

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy the project
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? [Select your account]
# - Link to existing project? No
# - What's your project's name? competitor-dashboard
# - In which directory is your code located? ./

# Add your API key as an environment variable
vercel env add API_KEY production

# When prompted, paste your API Ninjas API key

# Deploy to production
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard
1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Visit [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Add environment variable:
   - **Key**: `API_KEY`
   - **Value**: [Your API Ninjas API key]
6. Click "Deploy"

### Step 3: Access Your Dashboard
After deployment, Vercel will provide a URL like:
```
https://competitor-dashboard-xyz.vercel.app
```

Visit this URL to see your live dashboard!

## 🔧 Local Development

### Run Locally (Testing)
```bash
# Install Vercel CLI if you haven't already
npm install -g vercel

# Create a .env file with your API key
echo "API_KEY=your_api_key_here" > .env

# Start local development server
vercel dev

# Visit http://localhost:3000 in your browser
```

### Project Structure Details

#### `/api/stocks.js`
Serverless function that:
- Fetches data from API Ninjas Stock Price endpoint
- Handles authentication via environment variable
- Returns formatted JSON with stock prices
- Implements error handling and retry logic
- Supports parallel API calls for better performance

#### `index.html`
Frontend dashboard that:
- Displays stock data in an accessible table
- Highlights highest/lowest prices automatically
- Provides refresh and export functionality
- Implements loading and error states
- Uses fade-in animations for smooth transitions

#### `vercel.json`
Configuration file that:
- Defines serverless function routing
- Sets up static file serving
- Configures CORS headers
- Maps environment variables

## 📖 Usage Guide

### Viewing Stock Data
1. The dashboard automatically loads data when you visit the page
2. Stock prices are displayed in a clean table format
3. The highest price is highlighted in green
4. The lowest price is highlighted in red

### Refreshing Data
Click the "🔄 Refresh Data" button to fetch the latest stock prices from the API.

### Exporting Data
1. Click the "📊 Export to CSV" button
2. A CSV file will download automatically
3. The filename includes the current date (e.g., `competitor-stocks-2025-11-10.csv`)
4. Import this file into Excel, Google Sheets, or other business tools

### CSV Format
```csv
Company,Ticker,Current Price,Timestamp
"Apple Inc.",AAPL,150.25,"2025-11-10T14:30:00.000Z"
"Microsoft Corporation",MSFT,325.75,"2025-11-10T14:30:00.000Z"
...
```

## 🎨 Customization

### Adding More Companies
Edit `/api/stocks.js` and add to the `COMPANIES` array:
```javascript
const COMPANIES = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  // Add your companies here:
  { ticker: 'TSLA', name: 'Tesla Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' }
];
```

### Changing Design Colors
Edit the CSS variables in `index.html`:
```css
/* Primary color (blue) */
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);

/* Success color (green) */
color: #22c55e;

/* Error color (red) */
color: #ef4444;
```

### Modifying Refresh Interval
To add automatic refresh, add this to the `<script>` section in `index.html`:
```javascript
// Auto-refresh every 5 minutes
setInterval(() => {
  fetchStockData();
}, 5 * 60 * 1000);
```

## 🔒 Security Features

- ✅ API key stored securely in environment variables (never exposed to client)
- ✅ Backend API calls prevent CORS issues and key exposure
- ✅ Input validation on all API endpoints
- ✅ Error messages don't expose sensitive information
- ✅ No external dependencies (reduces attack surface)

## 🐛 Troubleshooting

### Issue: "Unable to load data" Error
**Solution**: Check that your API key is correctly set in Vercel environment variables
```bash
vercel env ls
# Should show API_KEY in the list

# If missing, add it:
vercel env add API_KEY production
```

### Issue: API Returns 401 Unauthorized
**Solution**: Your API key may be invalid or expired
1. Verify your API key at [api-ninjas.com](https://api-ninjas.com)
2. Update the environment variable in Vercel

### Issue: Prices Not Updating
**Solution**:
- Click the "Refresh Data" button manually
- Check API Ninjas status page for service interruptions
- Verify your API quota hasn't been exceeded

### Issue: Export Button Disabled
**Solution**: This means no data has been loaded yet
- Wait for the initial data fetch to complete
- Try clicking "Refresh Data" if loading failed

## 📊 API Information

### API Ninjas Stock Price Endpoint
- **URL**: `https://api.api-ninjas.com/v1/stockprice`
- **Method**: GET
- **Authentication**: X-Api-Key header
- **Rate Limit**: Varies by plan (free tier: 50,000 requests/month)
- **Documentation**: [API Ninjas Stock Price Docs](https://api-ninjas.com/api/stockprice)

### Stock Tickers Tracked
| Company | Ticker | Exchange |
|---------|--------|----------|
| Apple Inc. | AAPL | NASDAQ |
| Microsoft Corporation | MSFT | NASDAQ |
| Alphabet Inc. (Google) | GOOGL | NASDAQ |
| Meta Platforms Inc. | META | NASDAQ |
| Amazon.com Inc. | AMZN | NASDAQ |

## 🤝 Contributing

This is a business intelligence tool. Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Vercel deployment logs: `vercel logs`
3. Check API Ninjas documentation
4. Open an issue in this repository

## 🚀 Future Enhancements

Potential features for future versions:
- [ ] Historical price tracking and charts
- [ ] Email/Slack alerts for price changes
- [ ] Custom threshold notifications
- [ ] Additional market indicators (P/E ratio, market cap)
- [ ] Comparison with market indices (S&P 500, NASDAQ)
- [ ] User authentication for personalized watchlists
- [ ] Dark/light theme toggle
- [ ] Multi-currency support

---

**Built for Business Intelligence | Deployed on Vercel | Powered by API Ninjas**
