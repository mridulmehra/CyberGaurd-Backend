import { pgTable, text, serial, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  room: text("room").notNull(),
  toxicityScore: integer("toxicity_score").notNull().default(0),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  username: text("username").notNull(),
  room: text("room").notNull(),
  isModified: boolean("is_modified").notNull().default(false),
  timestamp: text("timestamp").notNull(),
});

export const toxic_messages = pgTable("toxic_messages", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  modifiedText: text("modified_text"),
  toxicityScore: integer("toxicity_score").notNull(),
  messageId: integer("message_id").references(() => messages.id, { onDelete: 'cascade' }),
  username: text("username").notNull(),
  room: text("room").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => messages.id, { onDelete: 'cascade' }).notNull(),
  reportedBy: text("reported_by").notNull(),
  reason: text("reason"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  status: text("status").default("pending").notNull(), // pending, reviewed, dismissed
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  room: true,
  toxicityScore: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  text: true,
  username: true,
  room: true,
  isModified: true,
  timestamp: true,
});

export const insertToxicMessageSchema = createInsertSchema(toxic_messages).pick({
  originalText: true,
  modifiedText: true,
  toxicityScore: true,
  messageId: true,
  username: true,
  room: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  messageId: true,
  reportedBy: true,
  reason: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertToxicMessage = z.infer<typeof insertToxicMessageSchema>;
export type ToxicMessage = typeof toxic_messages.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

export interface ToxicityResult {
  isToxic: boolean;
  detoxifiedText?: string;
}

export interface UserState {
  id?: number;
  username: string;
  room: string;
  toxicityScore: number;
}

export interface MessageData {
  id?: number;
  text: string;
  username: string;
  room: string;
  isModified: boolean;
  timestamp: string;
}

export interface ReportData {
  id?: number;
  messageId: number;
  reportedBy: string;
  reason?: string;
  timestamp: string;
  status: string;
}

export interface ServerToClientEvents {
  userJoined: (user: UserState) => void;
  userLeft: (username: string) => void;
  usersList: (users: UserState[]) => void;
  message: (message: MessageData) => void;
  updateToxicityScore: (username: string, score: number) => void;
  error: (error: { message: string }) => void;
  chatCleared: (room: string) => void;
  reportReceived: (report: ReportData) => void;
}

export interface ClientToServerEvents {
  join: (user: { username: string; room: string }) => void;
  leave: (username: string) => void;
  message: (message: string) => void;
  clearChat: (room: string) => void;
  reportMessage: (messageId: number, reason?: string) => void;
}
