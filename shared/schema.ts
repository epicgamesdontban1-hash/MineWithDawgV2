import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const botConnections = pgTable("bot_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  serverIp: text("server_ip").notNull(),
  version: text("version").notNull(),
  isConnected: boolean("is_connected").default(false),
  lastPing: integer("last_ping"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectionId: varchar("connection_id").references(() => botConnections.id),
  username: text("username").notNull(),
  message: text("message").notNull(),
  messageType: text("message_type").notNull().default("chat"), // chat, system, join, leave, death, console
  timestamp: timestamp("timestamp").default(sql`now()`),
  isCommand: boolean("is_command").default(false),
});

export const botLogs = pgTable("bot_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  connectionId: varchar("connection_id").references(() => botConnections.id),
  logLevel: text("log_level").notNull(), // info, warning, error
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const insertBotConnectionSchema = z.object({
  username: z.string().min(1).max(50),
  serverIp: z.string().min(1).max(255),
  version: z.string().min(1).max(20),
  authMode: z.string().optional().default("offline"),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  connectionId: true,
  username: true,
  message: true,
  messageType: true,
  isCommand: true,
});

export const insertBotLogSchema = createInsertSchema(botLogs).pick({
  connectionId: true,
  logLevel: true,
  message: true,
});

export type InsertBotConnection = z.infer<typeof insertBotConnectionSchema>;
export type BotConnection = typeof botConnections.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertBotLog = z.infer<typeof insertBotLogSchema>;
export type BotLog = typeof botLogs.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const serverProfiles = pgTable("server_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  profileName: text("profile_name").notNull(),
  username: text("username").notNull(),
  serverIp: text("server_ip").notNull(),
  version: text("version").notNull(),
  authMode: text("auth_mode").default("offline"),
  messageOnLoad: text("message_on_load"),
  messageOnLoadDelay: integer("message_on_load_delay").default(2000),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertServerProfileSchema = createInsertSchema(serverProfiles).pick({
  userId: true,
  profileName: true,
  username: true,
  serverIp: true,
  version: true,
  authMode: true,
  messageOnLoad: true,
  messageOnLoadDelay: true,
});

export type InsertServerProfile = z.infer<typeof insertServerProfileSchema>;
export type ServerProfile = typeof serverProfiles.$inferSelect;