import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your Blogger site
app.use(cors({
  origin: ["https://www.tbrief.site", "https://tbrief.site"],
}));

// Home route
app.get("/", (req, res) => {
  res.send("✅ Live Score Proxy is running");
});

// Matches (scores, fixtures, results)
app.get("/scores", async (req, res) => {
  try {
    const response = await fetch("https://api.football-data.org/v4/matches", {
      headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_KEY }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching scores:", err);
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

// League tables
app.get("/table/:leagueId", async (req, res) => {
  const { leagueId } = req.params;
  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${leagueId}/standings`,
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_KEY }
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Error fetching table:", err);
    res.status(500).json({ error: "Failed to fetch table" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Proxy running on port ${PORT}`);
});
