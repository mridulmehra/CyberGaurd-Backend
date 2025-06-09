import { 
  users, 
  messages, 
  toxic_messages,
  reports,
  type User, 
  type InsertUser,
  type Message,
  type InsertMessage,
  type ToxicMessage,
  type InsertToxicMessage,
  type Report,
  type InsertReport,
  type UserState,
  type ReportData
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(username: string): Promise<User | undefined>;
  getUsersInRoom(room: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  removeUser(username: string): Promise<void>;
  updateUserToxicityScore(username: string, score: number): Promise<User | undefined>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesInRoom(room: string, limit?: number): Promise<Message[]>;
  clearMessagesInRoom(room: string): Promise<void>;
  
  // Toxic message operations
  saveToxicMessage(toxicMessage: InsertToxicMessage): Promise<ToxicMessage>;
  getToxicMessagesForUser(username: string, limit?: number): Promise<ToxicMessage[]>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReportsForMessage(messageId: number): Promise<Report[]>;
  updateReportStatus(reportId: number, status: string): Promise<Report | undefined>;
  getReportsForRoom(room: string, limit?: number): Promise<Report[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUsersInRoom(room: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.room, room));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async removeUser(username: string): Promise<void> {
    await db.delete(users).where(eq(users.username, username));
  }

  async updateUserToxicityScore(username: string, score: number): Promise<User | undefined> {
    // Ensure score is between 0 and 100
    const newScore = Math.max(0, Math.min(100, score));
    
    const [updatedUser] = await db
      .update(users)
      .set({ toxicityScore: newScore })
      .where(eq(users.username, username))
      .returning();
    
    return updatedUser;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getMessagesInRoom(room: string, limit: number = 50): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.room, room))
      .orderBy(messages.timestamp)
      .limit(limit);
  }
  
  async clearMessagesInRoom(room: string): Promise<void> {
    await db.delete(messages).where(eq(messages.room, room));
  }

  // Toxic message operations
  async saveToxicMessage(toxicMessage: InsertToxicMessage): Promise<ToxicMessage> {
    const [savedToxicMessage] = await db
      .insert(toxic_messages)
      .values(toxicMessage)
      .returning();
    return savedToxicMessage;
  }

  async getToxicMessagesForUser(username: string, limit: number = 50): Promise<ToxicMessage[]> {
    return await db
      .select()
      .from(toxic_messages)
      .where(eq(toxic_messages.username, username))
      .orderBy(desc(toxic_messages.timestamp))
      .limit(limit);
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [savedReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return savedReport;
  }

  async getReportsForMessage(messageId: number): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.messageId, messageId))
      .orderBy(desc(reports.timestamp));
  }

  async updateReportStatus(reportId: number, status: string): Promise<Report | undefined> {
    const [updatedReport] = await db
      .update(reports)
      .set({ status })
      .where(eq(reports.id, reportId))
      .returning();
    return updatedReport;
  }

  async getReportsForRoom(room: string, limit: number = 50): Promise<Report[]> {
    // Join reports with messages to filter by room
    return await db
      .select()
      .from(reports)
      .innerJoin(messages, eq(reports.messageId, messages.id))
      .where(eq(messages.room, room))
      .orderBy(desc(reports.timestamp))
      .limit(limit)
      .then(results => results.map(r => r.reports));
  }
}

// To maintain backward compatibility with the in-memory implementation for testing
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Map<number, Message>;
  private messageId: number;
  private userId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.messageId = 1;
    this.userId = 1;
  }

  async getUser(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsersInRoom(room: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.room === room,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Ensure toxicityScore is set with a default of 0 if undefined
    const user: User = { 
      ...insertUser, 
      id,
      toxicityScore: insertUser.toxicityScore ?? 0
    };
    this.users.set(user.username, user);
    return user;
  }

  async removeUser(username: string): Promise<void> {
    this.users.delete(username);
  }

  async updateUserToxicityScore(username: string, score: number): Promise<User | undefined> {
    const user = await this.getUser(username);
    if (!user) return undefined;
    
    // Ensure score is between 0 and 100
    const newScore = Math.max(0, Math.min(100, score));
    
    const updatedUser: User = { ...user, toxicityScore: newScore };
    this.users.set(username, updatedUser);
    
    return updatedUser;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    // Ensure isModified is set with a default of false if undefined
    const message: Message = { 
      ...insertMessage, 
      id,
      isModified: insertMessage.isModified ?? false
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesInRoom(room: string, limit: number = 50): Promise<Message[]> {
    const roomMessages = Array.from(this.messages.values())
      .filter(message => message.room === room)
      .sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
    
    return roomMessages.slice(-limit);
  }
  
  async clearMessagesInRoom(room: string): Promise<void> {
    // Get all message IDs for the room
    const messageIds = Array.from(this.messages.entries())
      .filter(([_, message]) => message.room === room)
      .map(([id]) => id);
    
    // Delete each message in the room
    messageIds.forEach(id => this.messages.delete(id));
  }
  
  // Stub implementations for in-memory storage - for testing purposes only
  private toxicMessages: Map<number, ToxicMessage> = new Map();
  private reports: Map<number, Report> = new Map();
  private toxicMessageId: number = 1;
  private reportId: number = 1;
  
  async saveToxicMessage(toxicMessage: InsertToxicMessage): Promise<ToxicMessage> {
    const id = this.toxicMessageId++;
    const timestamp = new Date();
    const savedToxicMessage = {
      ...toxicMessage,
      id,
      timestamp
    } as ToxicMessage;
    
    this.toxicMessages.set(id, savedToxicMessage);
    return savedToxicMessage;
  }

  async getToxicMessagesForUser(username: string, limit: number = 50): Promise<ToxicMessage[]> {
    return Array.from(this.toxicMessages.values())
      .filter(message => message.username === username)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createReport(report: InsertReport): Promise<Report> {
    const id = this.reportId++;
    const timestamp = new Date();
    const savedReport = {
      ...report,
      id,
      timestamp,
      status: report.status || 'pending'
    } as Report;
    
    this.reports.set(id, savedReport);
    return savedReport;
  }

  async getReportsForMessage(messageId: number): Promise<Report[]> {
    return Array.from(this.reports.values())
      .filter(report => report.messageId === messageId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async updateReportStatus(reportId: number, status: string): Promise<Report | undefined> {
    const report = this.reports.get(reportId);
    if (!report) return undefined;
    
    const updatedReport = { ...report, status };
    this.reports.set(reportId, updatedReport);
    return updatedReport;
  }

  async getReportsForRoom(room: string, limit: number = 50): Promise<Report[]> {
    // This is a simplified implementation - in a real DB we'd need to join tables
    const messagesInRoom = Array.from(this.messages.values())
      .filter(message => message.room === room)
      .map(message => message.id);
    
    return Array.from(this.reports.values())
      .filter(report => messagesInRoom.includes(report.messageId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
}

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
