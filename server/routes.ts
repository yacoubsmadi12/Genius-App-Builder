import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAppGenerationSchema } from "@shared/schema";
import { authenticateUser, type AuthenticatedRequest, optionalAuth } from "./middleware/auth";
import { startAppGeneration } from "./services/appGenerator";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/auth/firebase", async (req, res) => {
    try {
      const { firebaseUid, email, name, photoURL } = req.body;
      console.log("DEBUG: Firebase auth request for UID:", firebaseUid, "Email:", email);
      
      // Check if user exists by Firebase UID
      let user = await storage.getUserByFirebaseUid(firebaseUid);
      console.log("DEBUG: Existing user found:", user ? `${user.email} (${user.id})` : "null");
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          email,
          name,
          photoURL,
          provider: "google",
          firebaseUid
        });
        console.log("DEBUG: Created new user:", user.email, "with ID:", user.id);
      }

      res.json({ user });
    } catch (error) {
      console.log("DEBUG: Firebase auth error:", error);
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // User routes
  app.get("/api/user/profile", authenticateUser, async (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  });

  app.get("/api/user/subscription", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const subscription = await storage.getUserSubscription(req.user!.id);
      res.json({ subscription });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // App generation routes
  app.get("/api/generations", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const generations = await storage.getUserAppGenerations(req.user!.id);
      res.json({ generations });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post("/api/generations", authenticateUser, upload.single('icon'), async (req: AuthenticatedRequest, res) => {
    try {
      const { appName, prompt, backend } = req.body;
      
      // Check subscription limits
      const subscription = await storage.getUserSubscription(req.user!.id);
      if (subscription) {
        const used = parseInt(subscription.generationsUsed);
        const limit = parseInt(subscription.generationsLimit);
        
        if (used >= limit && subscription.plan === "free") {
          return res.status(403).json({ error: "Generation limit reached. Please upgrade your plan." });
        }
      }

      let iconUrl = null;
      if (req.file) {
        // In production, upload to cloud storage
        iconUrl = `/uploads/${req.file.filename}`;
      }

      const generationData = {
        userId: req.user!.id,
        appName,
        prompt,
        backend,
        iconUrl
      };

      const generation = await storage.createAppGeneration(generationData);
      
      // Start generation process asynchronously
      startAppGeneration(generation.id).catch(console.error);
      
      res.json({ generation });
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.get("/api/generations/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const generation = await storage.getAppGeneration(req.params.id);
      
      if (!generation || generation.userId !== req.user!.id) {
        return res.status(404).json({ error: "Generation not found" });
      }

      res.json({ generation });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Parse app description route
  app.post("/api/parse-description", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { parseDescriptionRequestSchema } = await import("@shared/schema");
      
      // Validate request body using Zod schema
      const validatedData = parseDescriptionRequestSchema.parse(req.body);
      
      const { parseAppDescription } = await import("./services/openai");
      
      const parsedApp = await parseAppDescription(validatedData.description, validatedData.appName);
      
      res.json(parsedApp);
    } catch (error) {
      const { ZodError } = await import("zod");
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: error.issues 
        });
      }
      console.error('Parse description error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Icon generation route
  app.post("/api/generate-icon", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const { appName, description } = req.body;
      
      if (!appName) {
        return res.status(400).json({ error: "App name is required" });
      }

      // Import the icon generation function
      const { generateAppIcon } = await import("./services/openai");
      
      const result = await generateAppIcon(appName, description || "Modern mobile application icon");
      
      res.json({ 
        iconUrl: result.iconUrl,
        designSpec: result.designSpec,
        source: result.source,
        message: result.source === 'gemini' ? "Icon generated with AI" : "Icon generated with smart fallback"
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // File download routes
  app.get("/api/download/:id", authenticateUser, async (req: AuthenticatedRequest, res) => {
    try {
      const generation = await storage.getAppGeneration(req.params.id);
      
      if (!generation || generation.userId !== req.user!.id) {
        return res.status(404).json({ error: "Generation not found" });
      }

      if (generation.status !== "completed" || !generation.resultUrl) {
        return res.status(400).json({ error: "Generation not completed" });
      }

      const filePath = `./downloads/${req.params.id}.zip`;
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
      }

      res.download(filePath, `${generation.appName}.zip`);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      
      // In production, send email or save to database
      console.log("Contact form submission:", { name, email, subject, message });
      
      res.json({ success: true, message: "Message sent successfully" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  const httpServer = createServer(app);
  return httpServer;
}
