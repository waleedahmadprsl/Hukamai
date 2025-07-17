import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  usedApiKey: text("used_api_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: jsonb("metadata"), // Store additional data like dimensions, steps, etc.
});

export const apiKeyStatus = pgTable("api_key_status", {
  id: serial("id").primaryKey(),
  keyIndex: integer("key_index").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  lastUsed: timestamp("last_used"),
  failureCount: integer("failure_count").default(0).notNull(),
  cooldownUntil: timestamp("cooldown_until"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const promptHistory = pgTable("prompt_history", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
});

// Relations
export const generatedImagesRelations = relations(generatedImages, ({ one }) => ({
  // Add relations if needed
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGeneratedImageSchema = createInsertSchema(generatedImages).omit({
  id: true,
  createdAt: true,
});

export const insertApiKeyStatusSchema = createInsertSchema(apiKeyStatus).omit({
  id: true,
  updatedAt: true,
});

export const insertPromptHistorySchema = createInsertSchema(promptHistory).omit({
  id: true,
  usedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;
export type GeneratedImage = typeof generatedImages.$inferSelect;

export type InsertApiKeyStatus = z.infer<typeof insertApiKeyStatusSchema>;
export type ApiKeyStatus = typeof apiKeyStatus.$inferSelect;

export type InsertPromptHistory = z.infer<typeof insertPromptHistorySchema>;
export type PromptHistory = typeof promptHistory.$inferSelect;
