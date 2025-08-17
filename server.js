import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: "https://www.tbrief.site" }));

// ✅ Scores route (live, upcoming, results)
app.get("/scores", async (req, res) => {
  try {
    const response = await fetch("https://api-football-v1.p.rapidapi.com/v3/fixtures?live=all", {
      method: "GET",
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching scores:", error);
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

// ✅ League table route
app.get("/table/:leagueId", async (req, res) => {
  try {
    const { leagueId } = req.params;
    const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/standings?league=${leagueId}&season=2025`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching table:", error);
    res.status(500).json({ error: "Failed to fetch standings" });
  }
});

app.get("/", (req, res) => res.send("✅ Live Score Proxy Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
