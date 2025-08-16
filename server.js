require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_API_KEY;
const CACHE_TTL_MS = process.env.CACHE_TTL_MS || 15000;

let cache = {};

async function fetchWithCache(endpoint) {
  const now = Date.now();
  if (cache[endpoint] && (now - cache[endpoint].timestamp < CACHE_TTL_MS)) {
    return cache[endpoint].data;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'X-Auth-Token': API_KEY },
  });

  if (!res.ok) {
    throw new Error(`Football API error ${res.status}`);
  }

  const data = await res.json();
  cache[endpoint] = { data, timestamp: now };
  return data;
}

// Example route: fetch Premier League matches
app.get('/api/matches', async (req, res) => {
  try {
    const data = await fetchWithCache('/competitions/PL/matches?status=LIVE');
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy running on http://localhost:${PORT}`);
});
