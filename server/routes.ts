import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { togetherAI } from "./services/together-ai";
import { insertGeneratedImageSchema, insertPromptHistorySchema } from "@shared/schema";
import { z } from "zod";
import axios from "axios";
import cors from "cors";

const generateImageSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  imagesPerPrompt: z.number().min(1).max(10).default(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable CORS for all routes
  app.use(cors({
    origin: true,
    credentials: true,
  }));

  // Generate Image Endpoint
  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt, imagesPerPrompt } = generateImageSchema.parse(req.body);
      
      // Add to prompt history
      await storage.addPromptToHistory({ prompt });
      
      // Generate image using Together AI
      const result = await togetherAI.generateImage(prompt, imagesPerPrompt);
      
      if (result.success) {
        // Store in database
        const savedImage = await storage.createGeneratedImage({
          prompt,
          imageUrl: result.imageUrl,
          usedApiKey: result.usedApiKey,
          metadata: { imagesPerPrompt, steps: 4, width: 768, height: 768 },
        });
        
        res.json({
          success: true,
          imageUrl: result.imageUrl,
          usedApiKey: result.usedApiKey,
          imageId: savedImage.id,
        });
      } else {
        res.status(500).json({
          success: false,
          error: result.error,
          usedApiKey: result.usedApiKey,
        });
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      res.status(400).json({
        success: false,
        error: error.message || "Failed to generate image",
      });
    }
  });

  // Get API Key Status
  app.get("/api/api-key-status", async (req, res) => {
    try {
      const statuses = await togetherAI.getApiKeyStatuses();
      res.json({ statuses });
    } catch (error: any) {
      console.error("Error fetching API key status:", error);
      res.status(500).json({ error: "Failed to fetch API key status" });
    }
  });

  // Reset API Keys
  app.post("/api/reset-api-keys", async (req, res) => {
    try {
      await togetherAI.resetApiKeys();
      res.json({ success: true, message: "API keys reset successfully" });
    } catch (error: any) {
      console.error("Error resetting API keys:", error);
      res.status(500).json({ error: "Failed to reset API keys" });
    }
  });

  // Proxy Image Endpoint (for CORS bypass)
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: "URL parameter is required" });
      }

      const response = await axios.get(url, {
        responseType: 'stream',
        timeout: 30000,
      });

      res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      response.data.pipe(res);
    } catch (error: any) {
      console.error("Error proxying image:", error);
      
      if (error.response?.status === 404) {
        // Return a placeholder image or error message for 404s
        res.status(404).json({ error: "Image not found" });
      } else {
        res.status(500).json({ error: "Failed to proxy image" });
      }
    }
  });

  // Get Generated Images
  app.get("/api/generated-images", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100000;
      const images = await storage.getGeneratedImages(limit);
      res.json({ images });
    } catch (error: any) {
      console.error("Error fetching generated images:", error);
      res.status(500).json({ error: "Failed to fetch generated images" });
    }
  });

  // Get Prompt History
  app.get("/api/prompt-history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100000;
      const history = await storage.getPromptHistory(limit);
      res.json({ history });
    } catch (error: any) {
      console.error("Error fetching prompt history:", error);
      res.status(500).json({ error: "Failed to fetch prompt history" });
    }
  });

  // Clear All Data
  app.delete("/api/clear-all-data", async (req, res) => {
    try {
      await storage.clearAllData();
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error clearing all data:", error);
      res.status(500).json({ error: "Failed to clear all data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
