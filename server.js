import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: "https://www.tbrief.site" }));

const API_URL = "https://api-football-v1.p.rapidapi.com/v3";
const API_HEADERS = {
  "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
  "x-rapidapi-key": process.env.RAPIDAPI_KEY,
};

// ✅ Live scores
app.get("/scores", async (req, res) => {
  try {
    const r = await fetch(`${API_URL}/fixtures?live=all`, { headers: API_HEADERS });
    const data = await r.json();
    res.json(data); // same format as API-Football
  } catch (err) {
    console.error("Error fetching live scores:", err);
    res.status(500).json({ error: "Failed to fetch live scores" });
  }
});

// ✅ Results
app.get("/results/:league/:season", async (req, res) => {
  try {
    const { league, season } = req.params;
    const r = await fetch(`${API_URL}/fixtures?league=${league}&season=${season}&status=FT`, { headers: API_HEADERS });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching results:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

// ✅ Upcoming fixtures
app.get("/upcoming/:league/:season", async (req, res) => {
  try {
    const { league, season } = req.params;
    const r = await fetch(`${API_URL}/fixtures?league=${league}&season=${season}&next=10`, { headers: API_HEADERS });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching upcoming fixtures:", err);
    res.status(500).json({ error: "Failed to fetch upcoming fixtures" });
  }
});

// ✅ Standings
app.get("/table/:league/:season", async (req, res) => {
  try {
    const { league, season } = req.params;
    const r = await fetch(`${API_URL}/standings?league=${league}&season=${season}`, { headers: API_HEADERS });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching table:", err);
    res.status(500).json({ error: "Failed to fetch standings" });
  }
});

// Root
app.get("/", (req, res) => res.send("✅ Live Score Proxy Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
