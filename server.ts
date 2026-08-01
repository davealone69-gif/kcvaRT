import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API lazily or with fallback
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// API: Phone lookup endpoint
app.post("/api/phone/lookup", (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  // Sanitize digits
  const cleanNum = phoneNumber.replace(/[^0-9+]/g, "");

  // Mock carrier and location intelligence database
  let country = "United States";
  let countryCode = "+1";
  let flag = "🇺🇸";
  let carrier = "Verizon Wireless";
  let lineType = "Mobile";
  let region = "California";
  let city = "San Francisco";
  let lat = 37.7749;
  let lng = -122.4194;

  if (cleanNum.startsWith("+44") || cleanNum.startsWith("44")) {
    country = "United Kingdom";
    countryCode = "+44";
    flag = "🇬🇧";
    carrier = "Vodafone UK";
    region = "Greater London";
    city = "London";
    lat = 51.5074;
    lng = -0.1278;
  } else if (cleanNum.startsWith("+33") || cleanNum.startsWith("33")) {
    country = "France";
    countryCode = "+33";
    flag = "🇫🇷";
    carrier = "Orange France";
    region = "Île-de-France";
    city = "Paris";
    lat = 48.8566;
    lng = 2.3522;
  } else if (cleanNum.startsWith("+49") || cleanNum.startsWith("49")) {
    country = "Germany";
    countryCode = "+49";
    flag = "🇩🇪";
    carrier = "Telekom.de";
    region = "Berlin";
    city = "Berlin";
    lat = 52.52;
    lng = 13.405;
  } else if (cleanNum.startsWith("+91") || cleanNum.startsWith("91")) {
    country = "India";
    countryCode = "+91";
    flag = "🇮🇳";
    carrier = "Reliance Jio 5G";
    region = "Maharashtra";
    city = "Mumbai";
    lat = 19.076;
    lng = 72.8777;
  } else if (cleanNum.startsWith("+81") || cleanNum.startsWith("81")) {
    country = "Japan";
    countryCode = "+81";
    flag = "🇯🇵";
    carrier = "NTT Docomo";
    region = "Tokyo";
    city = "Tokyo";
    lat = 35.6762;
    lng = 139.6503;
  } else if (cleanNum.startsWith("+61") || cleanNum.startsWith("61")) {
    country = "Australia";
    countryCode = "+61";
    flag = "🇦🇺";
    carrier = "Telstra Mobile";
    region = "New South Wales";
    city = "Sydney";
    lat = -33.8688;
    lng = 151.2093;
  } else if (cleanNum.startsWith("+1") || cleanNum.startsWith("1")) {
    if (cleanNum.includes("212") || cleanNum.includes("917") || cleanNum.includes("646")) {
      region = "New York";
      city = "New York City";
      carrier = "T-Mobile USA";
      lat = 40.7128;
      lng = -74.006;
    } else if (cleanNum.includes("312") || cleanNum.includes("773")) {
      region = "Illinois";
      city = "Chicago";
      carrier = "AT&T Mobility";
      lat = 41.8781;
      lng = -87.6298;
    }
  }

  // Add deterministic slight offset based on digits for realism
  const digitSum = cleanNum.split("").reduce((acc: number, char: string) => {
    const code = char.charCodeAt(0);
    return acc + (isNaN(code) ? 0 : code);
  }, 0);

  const offsetLat = ((digitSum % 20) - 10) * 0.003;
  const offsetLng = (((digitSum * 3) % 20) - 10) * 0.003;

  res.json({
    phoneNumber: cleanNum,
    formatted: phoneNumber,
    country,
    countryCode,
    flag,
    carrier,
    lineType,
    region,
    city,
    coordinates: {
      lat: lat + offsetLat,
      lng: lng + offsetLng,
    },
    spamScore: (digitSum % 15) < 3 ? "Low (Safe)" : "Very Low (Verified)",
    simSwapStatus: "No recent SIM swap detected (Clean)",
    signalStrength: -72 - (digitSum % 20),
    accuracyRadius: 15 + (digitSum % 25),
    batteryLevel: 82 - (digitSum % 40),
    speed: (digitSum % 2) === 0 ? Math.floor(15 + (digitSum % 45)) : 0,
    heading: (digitSum * 17) % 360,
    altitude: 12 + (digitSum % 50),
    lastSeenTimestamp: new Date().toISOString(),
    isLive: true,
  });
});

// API: Gemini AI Location Analysis
app.post("/api/ai/location-analysis", async (req, res) => {
  const { location, address, phoneNumber, city, country } = req.body;
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        analysis: `Location overview for ${city || "Target Area"}, ${country || "Region"}:
• Area Type: Urban Transit & Commercial District
• Safety Assessment: High security index, well-lit pedestrian corridors and active cell tower density.
• Nearest Emergency Hub: Central Municipal Safety Post (~1.2 km)
• Transport Access: Metro lines and ride-share hubs within 300 meters.
(Note: Add GEMINI_API_KEY in Secrets for live custom AI contextual reports).`,
      });
    }

    const prompt = `You are a real-time GPS location intelligence and safety assistant. Provide a concise, highly readable, 4-bullet point safety and location context report for coordinates (${location.lat.toFixed(
      4
    )}, ${location.lng.toFixed(4)}) located near ${address || city || "Target Location"}, ${country || ""}.
Include:
1. Area Classification (e.g. Commercial, Residential, Transit hub, Highway)
2. Neighborhood Safety & Emergency Services Proximity
3. Transport Links & Connectivity
4. Recommended Check-in / Geofencing Advice for phone tracking. Keep it realistic, direct, and professional. No markdown titles, just bullet points.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ analysis: response.text || "Analysis unavailable." });
  } catch (error: any) {
    console.error("Gemini AI error:", error);
    res.status(500).json({
      error: "Failed to generate AI analysis",
      details: error.message,
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
