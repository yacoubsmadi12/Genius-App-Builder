import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  photoURL: text("photo_url"),
  provider: text("provider").notNull().default("email"),
  firebaseUid: text("firebase_uid").unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appGenerations = pgTable("app_generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  appName: text("app_name").notNull(),
  prompt: text("prompt").notNull(),
  backend: text("backend").notNull(),
  iconUrl: text("icon_url"),
  status: text("status").notNull().default("pending"), // pending, generating, completed, failed
  progress: jsonb("progress").default({}),
  resultUrl: text("result_url"),
  apkUrl: text("apk_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(), // free, pro, enterprise
  status: text("status").notNull().default("active"),
  generationsUsed: text("generations_used").notNull().default("0"),
  generationsLimit: text("generations_limit").notNull().default("2"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAppGenerationSchema = createInsertSchema(appGenerations).omit({
  id: true,
  createdAt: true,
  status: true,
  progress: true,
  resultUrl: true,
  apkUrl: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAppGeneration = z.infer<typeof insertAppGenerationSchema>;
export type AppGeneration = typeof appGenerations.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Schema for parsed app description
export const parsedAppStructureSchema = z.object({
  appName: z.string().min(1, "App name is required"),
  description: z.string().min(1, "Description is required"),
  language: z.enum(["en", "ar", "mixed"]).default("en"),
  originalText: z.string(),
  screens: z.array(z.object({
    name: z.string(),
    description: z.string().optional()
  })).min(1, "At least one screen is required"),
  features: z.array(z.string()).default([])
});

export type ParsedAppStructure = z.infer<typeof parsedAppStructureSchema>;

// Schema for description parsing request
export const parseDescriptionRequestSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  appName: z.string().optional()
});
