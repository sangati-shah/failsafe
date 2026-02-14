import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  category: text("category").notNull(),
  goal: text("goal").notNull(),
  failures: text("failures").array().notNull().default(sql`'{}'::text[]`),
  failureDescription: text("failure_description"),
  severity: integer("severity").default(3),
  points: integer("points").notNull().default(0),
  badges: text("badges").array().notNull().default(sql`'{}'::text[]`),
  learningStyle: text("learning_style"),
  availability: text("availability"),
  accountabilityStyle: text("accountability_style"),
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  severity: integer("severity").default(3),
  encouragements: integer("encouragements").notNull().default(0),
  encouragedBy: text("encouraged_by").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userIds: text("user_ids").array().notNull(),
  category: text("category").notNull(),
  chatRoomId: varchar("chat_room_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  profilesRevealed: text("profiles_revealed").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: varchar("match_id").notNull(),
  roomName: text("room_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatRoomId: varchar("chat_room_id").notNull(),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  reactions: jsonb("reactions").default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatRoomId: varchar("chat_room_id").notNull(),
  challenge: text("challenge").notNull(),
  estimatedTime: integer("estimated_time").default(30),
  completedBy: text("completed_by").array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const celebrations = pgTable("celebrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const weeklyCheckins = pgTable("weekly_checkins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  mood: text("mood").notNull(),
  accomplishment: text("accomplishment"),
  needSupport: text("need_support"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, lastActive: true, createdAt: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, encouragements: true, encouragedBy: true, createdAt: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true, isActive: true, profilesRevealed: true, createdAt: true });
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, reactions: true, createdAt: true });
export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, completedBy: true, createdAt: true });
export const insertCelebrationSchema = createInsertSchema(celebrations).omit({ id: true, createdAt: true });
export const insertWeeklyCheckinSchema = createInsertSchema(weeklyCheckins).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type InsertCelebration = z.infer<typeof insertCelebrationSchema>;
export type Celebration = typeof celebrations.$inferSelect;
export type InsertWeeklyCheckin = z.infer<typeof insertWeeklyCheckinSchema>;
export type WeeklyCheckin = typeof weeklyCheckins.$inferSelect;
