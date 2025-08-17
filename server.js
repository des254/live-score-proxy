// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "https://www.tbrief.site" // Allow your Blogger site
}));

const API_URL = "https://v3.football.api-sports.io";
const API_KEY = process.env.RAPIDAPI_KEY; // Your API-Football key
const HEADERS = {
  "X-RapidAPI-Key": API_KEY,
  "X-RapidAPI-Host": "v3.football.api-sports.io"
};

// Helper: Fetch live matches
async function fetchLiveMatches() {
  const res = await fetch(`${API_URL}/fixtures?live=all`, { headers: HEADERS });
  const data = await res.json();
  return data.response;
}

// Helper: Fetch results
async function fetchResults(league, season) {
  const res = await fetch(`${API_URL}/fixtures?league=${league}&season=${season}&status=FT`, { headers: HEADERS });
  const data = await res.json();
  return data.response;
}

// Helper: Fetch upcoming matches
async function fetchUpcoming(league, season) {
  const res = await fetch(`${API_URL}/fixtures?league=${league}&season=${season}&status=NS`, { headers: HEADERS });
  const data = await res.json();
  return data.response;
}

// Helper: Fetch league table
async function fetchStandings(league, season) {
  const res = await fetch(`${API_URL}/standings?league=${league}&season=${season}`, { headers: HEADERS });
  const data = await res.json();
  return data.response[0].league.standings[0]; // Table array
}

// Routes
app.get("/scores", async (req, res) => {
  try {
    const live = await fetchLiveMatches();
    res.json({ matches: live });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/results/:league/:season", async (req, res) => {
  const { league, season } = req.params;
  try {
    const results = await fetchResults(league, season);
    res.json({ matches: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/upcoming/:league/:season", async (req, res) => {
  const { league, season } = req.params;
  try {
    const upcoming = await fetchUpcoming(league, season);
    res.json({ matches: upcoming });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/table/:league/:season", async (req, res) => {
  const { league, season } = req.params;
  try {
    const table = await fetchStandings(league, season);
    res.json({ table });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optional: simple homepage
app.get("/", (req, res) => {
  res.send("Football API Proxy is running!");
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running on port ${PORT}`);
});
