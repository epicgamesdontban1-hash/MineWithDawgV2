import { type User, type InsertUser, type BotConnection, type InsertBotConnection, type ChatMessage, type InsertChatMessage, type BotLog, type InsertBotLog, type ServerProfile, type InsertServerProfile } from "@shared/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { botConnections, chatMessages, botLogs, users, serverProfiles, type InsertBotConnection, type InsertChatMessage, type InsertBotLog, type InsertUser, type InsertServerProfile } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(username: string, password: string): Promise<User | null>;

  getServerProfile(profileId: string): Promise<ServerProfile | undefined>;
  getUserServerProfiles(userId: string): Promise<ServerProfile[]>;
  createServerProfile(profileData: InsertServerProfile): Promise<ServerProfile>;
  updateServerProfile(profileId: string, updates: Partial<InsertServerProfile>): Promise<ServerProfile | undefined>;
  deleteServerProfile(profileId: string): Promise<void>;

  getBotConnection(id: string): Promise<BotConnection | undefined>;
  createBotConnection(connection: InsertBotConnection): Promise<BotConnection>;
  updateBotConnection(id: string, updates: Partial<BotConnection>): Promise<BotConnection | undefined>;
  deleteBotConnection(id: string): Promise<boolean>;
  getAllBotConnections(): Promise<BotConnection[]>;

  getChatMessages(connectionId: string, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  getBotLogs(connectionId: string, limit?: number): Promise<BotLog[]>;
  createBotLog(log: InsertBotLog): Promise<BotLog>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private botConnections: Map<string, BotConnection>;
  private chatMessages: Map<string, ChatMessage>;
  private botLogs: Map<string, BotLog>;

  

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = { 
      ...insertUser, 
      id, 
      password: hashedPassword 
    };
    this.users.set(id, user);
    return user;
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  private serverProfiles: Map<string, ServerProfile>;

  constructor() {
    this.users = new Map();
    this.botConnections = new Map();
    this.chatMessages = new Map();
    this.botLogs = new Map();
    this.serverProfiles = new Map();
  }

  async getServerProfile(profileId: string): Promise<ServerProfile | undefined> {
    return this.serverProfiles.get(profileId);
  }
  
  async getUserServerProfiles(userId: string): Promise<ServerProfile[]> {
    return Array.from(this.serverProfiles.values()).filter(
      profile => profile.userId === userId
    );
  }
  
  async createServerProfile(profileData: InsertServerProfile): Promise<ServerProfile> {
    const id = randomUUID();
    const profile: ServerProfile = {
      ...profileData,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.serverProfiles.set(id, profile);
    return profile;
  }
  
  async updateServerProfile(profileId: string, updates: Partial<InsertServerProfile>): Promise<ServerProfile | undefined> {
    const profile = this.serverProfiles.get(profileId);
    if (!profile) return undefined;

    const updated = { 
      ...profile, 
      ...updates,
      updatedAt: new Date()
    };
    this.serverProfiles.set(profileId, updated);
    return updated;
  }
  
  async deleteServerProfile(profileId: string): Promise<void> {
    this.serverProfiles.delete(profileId);
  }

  async getBotConnection(id: string): Promise<BotConnection | undefined> {
    return this.botConnections.get(id);
  }

  async createBotConnection(insertConnection: InsertBotConnection): Promise<BotConnection> {
    const id = randomUUID();
    const connection: BotConnection = {
      ...insertConnection,
      id,
      isConnected: false,
      lastPing: null,
      createdAt: new Date(),
    };
    this.botConnections.set(id, connection);
    return connection;
  }

  async updateBotConnection(id: string, updates: Partial<BotConnection>): Promise<BotConnection | undefined> {
    const connection = this.botConnections.get(id);
    if (!connection) return undefined;

    const updated = { ...connection, ...updates };
    this.botConnections.set(id, updated);
    return updated;
  }

  async deleteBotConnection(id: string): Promise<boolean> {
    return this.botConnections.delete(id);
  }

  async getAllBotConnections(): Promise<BotConnection[]> {
    return Array.from(this.botConnections.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getChatMessages(connectionId: string, limit: number = 50): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.connectionId === connectionId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0))
      .slice(-limit);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = {
      id,
      connectionId: insertMessage.connectionId || null,
      username: insertMessage.username,
      message: insertMessage.message,
      messageType: insertMessage.messageType || "chat",
      isCommand: insertMessage.isCommand || false,
      timestamp: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getBotLogs(connectionId: string, limit: number = 50): Promise<BotLog[]> {
    return Array.from(this.botLogs.values())
      .filter(log => log.connectionId === connectionId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0))
      .slice(-limit);
  }

  async createBotLog(insertLog: InsertBotLog): Promise<BotLog> {
    const id = randomUUID();
    const log: BotLog = {
      id,
      connectionId: insertLog.connectionId || null,
      logLevel: insertLog.logLevel,
      message: insertLog.message,
      timestamp: new Date(),
    };
    this.botLogs.set(id, log);
    return log;
  }
}

export const storage = new MemStorage();