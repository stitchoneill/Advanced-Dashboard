const express = require('express');
const fetch = global.fetch || require('node-fetch');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Allow CORS from local front-end
app.use(cors());

// --- Serve static files (dashboard) ---
app.use(express.static(__dirname));

// Fallback: Send index.html for root requests
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// --- NewsAPI Proxy ---
const NEWSAPI_KEY = process.env.NEWSAPI_KEY || '68f81862a6074469bd3820ea1b0a78b4';

app.get('/api/news', async (req, res) => {
  const { sources, country = 'gb', category = '', q = '' } = req.query;
  let url = `https://newsapi.org/v2/top-headlines?apiKey=${NEWSAPI_KEY}`;

  if (sources) {
    url += `&sources=${encodeURIComponent(sources)}`;
    // category/country are NOT allowed with sources, see NewsAPI docs
  } else {
    url += `&country=${country}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
  }
  if (q) url += `&q=${encodeURIComponent(q)}`;

  try {
    const r = await fetch(url);
    const j = await r.json();
    res.json(j);
  } catch (e) {
    res.status(500).json({ error: "News fetch failed" });
  }
});

// --- Crypto Proxy (CoinMarketCap Example) ---
const CRYPTO_API_KEY = process.env.CRYPTO_API_KEY;

app.get('/api/crypto', async (req, res) => {
  try {
    // 1. Get top 5 coins
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1';
    const coins = await (await fetch(url)).json();

    // 2. For each, get 7-day price chart
    const allCoins = await Promise.all(coins.map(async coin => {
      try {
        const chartUrl = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=7&interval=hourly`;
        const chartData = await (await fetch(chartUrl)).json();
        // Downsample to 50 data points max
        let prices = chartData.prices.map(p => p[1]);
        while (prices.length > 50) prices = prices.filter((v, i) => i % 2 === 0);
        return { ...coin, prices };
      } catch {
        return { ...coin, prices: [] };
      }
    }));

    res.json(allCoins);
  } catch (e) {
    res.status(500).json({ error: "Crypto fetch failed" });
  }
});


app.listen(PORT, () => {
  console.log(`Server (dashboard + API) running on http://localhost:${PORT}`);
});
