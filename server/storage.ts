import { 
  users, 
  generatedImages, 
  apiKeyStatus, 
  promptHistory,
  type User, 
  type InsertUser,
  type GeneratedImage,
  type InsertGeneratedImage,
  type ApiKeyStatus,
  type InsertApiKeyStatus,
  type PromptHistory,
  type InsertPromptHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Generated Images
  createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage>;
  getGeneratedImages(limit?: number): Promise<GeneratedImage[]>;
  getGeneratedImageById(id: number): Promise<GeneratedImage | undefined>;
  
  // API Key Status
  getApiKeyStatus(keyIndex: number): Promise<ApiKeyStatus | undefined>;
  updateApiKeyStatus(keyIndex: number, status: Partial<InsertApiKeyStatus>): Promise<ApiKeyStatus>;
  getAllApiKeyStatuses(): Promise<ApiKeyStatus[]>;
  resetApiKeyStatuses(): Promise<void>;
  
  // Prompt History
  addPromptToHistory(prompt: InsertPromptHistory): Promise<PromptHistory>;
  getPromptHistory(limit?: number): Promise<PromptHistory[]>;
  
  // Clear All Data
  clearAllData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage> {
    const [createdImage] = await db
      .insert(generatedImages)
      .values(image)
      .returning();
    return createdImage;
  }

  async getGeneratedImages(limit: number = 100): Promise<GeneratedImage[]> {
    return await db
      .select()
      .from(generatedImages)
      .orderBy(desc(generatedImages.createdAt))
      .limit(limit);
  }

  async getGeneratedImageById(id: number): Promise<GeneratedImage | undefined> {
    const [image] = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.id, id));
    return image || undefined;
  }

  async getApiKeyStatus(keyIndex: number): Promise<ApiKeyStatus | undefined> {
    const [status] = await db
      .select()
      .from(apiKeyStatus)
      .where(eq(apiKeyStatus.keyIndex, keyIndex));
    return status || undefined;
  }

  async updateApiKeyStatus(keyIndex: number, status: Partial<InsertApiKeyStatus>): Promise<ApiKeyStatus> {
    const [updatedStatus] = await db
      .insert(apiKeyStatus)
      .values({ keyIndex, ...status, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: apiKeyStatus.keyIndex,
        set: { ...status, updatedAt: new Date() }
      })
      .returning();
    return updatedStatus;
  }

  async getAllApiKeyStatuses(): Promise<ApiKeyStatus[]> {
    return await db.select().from(apiKeyStatus).orderBy(apiKeyStatus.keyIndex);
  }

  async resetApiKeyStatuses(): Promise<void> {
    await db
      .update(apiKeyStatus)
      .set({
        isActive: true,
        failureCount: 0,
        cooldownUntil: null,
        updatedAt: new Date()
      });
  }

  async addPromptToHistory(prompt: InsertPromptHistory): Promise<PromptHistory> {
    const [historyEntry] = await db
      .insert(promptHistory)
      .values(prompt)
      .returning();
    return historyEntry;
  }

  async getPromptHistory(limit: number = 100): Promise<PromptHistory[]> {
    return await db
      .select()
      .from(promptHistory)
      .orderBy(desc(promptHistory.usedAt))
      .limit(limit);
  }

  async clearAllData(): Promise<void> {
    // Clear generated images and prompt history
    await db.delete(generatedImages);
    await db.delete(promptHistory);
  }
}

export const storage = new DatabaseStorage();
