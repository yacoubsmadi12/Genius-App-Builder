import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export async function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      console.log("DEBUG: No auth header provided");
      return res.status(401).json({ error: "No valid token provided" });
    }

    // In a real app, verify the Firebase token here
    const firebaseUid = authHeader.substring(7);
    console.log("DEBUG: Looking for user with Firebase UID:", firebaseUid);
    
    // Search for user by Firebase UID since that's what we get from the frontend
    const user = await storage.getUserByFirebaseUid(firebaseUid);
    console.log("DEBUG: Found user:", user ? `${user.email} (${user.id})` : "null");
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("DEBUG: Auth error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authenticateUser(req, res, next);
  }
  next();
}
