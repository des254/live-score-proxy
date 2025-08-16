// server.js (paste/replace)
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 3000;
const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_API_KEY;
if (!API_KEY) {
  console.error('Missing FOOTBALL_API_KEY in env');
  process.exit(1);
}

// Parse allowed origins from env var, comma-separated
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// CORS options: allow the configured origins (and allow non-browser requests)
const corsOptions = {
  origin: (origin, callback) => {
    // allow server-to-server and tools (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET'],
};

app.use(cors(corsOptions));

// Simple in-memory cache
const CACHE_TTL_MS = parseInt(process.env.CACHE_TTL_MS || '15000', 10);
let cache = { ts: 0, data: null };

// helper: fetch from football-data with unfold for events/goal details if needed
async function fetchMatchesFromAPI() {
  const url = `${API_BASE}/matches?status=LIVE`;
  const resp = await fetch(url, {
    headers: {
      'X-Auth-Token': API_KEY,
      'Accept': 'application/json',
      // 'X-Unfold-Goals': 'true'  // if needed by the API to return events
    }
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Upstream error ${resp.status}: ${txt}`);
  }
  return await resp.json();
}

async function getCachedMatches() {
  const now = Date.now();
  if (cache.data && (now - cache.ts) < CACHE_TTL_MS) {
    return cache.data;
  }
  const json = await fetchMatchesFromAPI();
  // normalize to compact shape
  const matches = (json.matches || []).map(m => ({
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    competition: m.competition?.name || '',
    venue: m.venue || '',
    homeTeam: { id: m.homeTeam?.id, name: m.homeTeam?.name, shortName: m.homeTeam?.shortName },
    awayTeam: { id: m.awayTeam?.id, name: m.awayTeam?.name, shortName: m.awayTeam?.shortName },
    score: m.score || {},
    // include events/goals if available in the response under m.goals or m.events
    goals: m.goals || m.events?.filter(e => String(e.type).toLowerCase().includes('goal')) || []
  }));
  cache = { ts: now, data: { matches } };
  return cache.data;
}

// New /scores endpoint used by your front-end
app.get('/scores', async (req, res) => {
  try {
    const data = await getCachedMatches();
    // Set cache headers for clients (helpful but not required)
    res.set('Cache-Control', `public, max-age=${Math.floor(CACHE_TTL_MS/1000)}`);
    res.json(data);
  } catch (err) {
    console.error('Error in /scores:', err);
    res.status(500).json({ error: String(err) });
  }
});

// (optional) keep your older route names if you used them earlier
app.get('/api/live-matches', async (req, res) => {
  try {
    const data = await getCachedMatches();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running on port ${PORT}`);
});
