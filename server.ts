import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Configuration
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for Book Suggestions/Search
  app.post("/api/suggestions", async (req, res) => {
    try {
      const { query, currentBooks } = req.body;
      const prompt = `Based on the following Islamic books library and the search query "${query}", suggest 5 relevant book titles or topics that a user might be looking for. 
      Available books context: ${JSON.stringify(currentBooks)}.
      Format: Return only a JSON array of strings.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || "[]";
      
      // Clean up the response to extract just the JSON array
      const jsonMatch = text.match(/\[.*\]/s);
      const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      
      res.json(suggestions);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to get suggestions" });
    }
  });

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
