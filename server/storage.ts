import { db } from "./db";
import { eq, desc, sql, and, arrayContains } from "drizzle-orm";
import {
  users, posts, matches, chatRooms, messages, challenges, celebrations, weeklyCheckins,
  type User, type InsertUser, type Post, type InsertPost,
  type Match, type InsertMatch, type ChatRoom, type InsertChatRoom,
  type Message, type InsertMessage, type Challenge, type InsertChallenge,
  type Celebration, type InsertCelebration, type WeeklyCheckin, type InsertWeeklyCheckin,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: string, points: number): Promise<User | undefined>;
  addUserBadge(userId: string, badge: string): Promise<User | undefined>;
  getLeaderboard(): Promise<User[]>;

  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<Post[]>;
  encouragePost(postId: string, userId: string): Promise<Post | undefined>;

  createMatch(match: InsertMatch): Promise<Match>;
  getMatchesByUser(userId: string): Promise<Match[]>;
  getMatchById(id: string): Promise<Match | undefined>;

  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  getChatRoom(id: string): Promise<ChatRoom | undefined>;

  createMessage(msg: InsertMessage): Promise<Message>;
  getMessages(chatRoomId: string): Promise<Message[]>;

  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  getChallengeByRoom(chatRoomId: string): Promise<Challenge | undefined>;
  completeChallenge(challengeId: string, userId: string): Promise<Challenge | undefined>;

  createCelebration(celebration: InsertCelebration): Promise<Celebration>;
  getCelebrations(userId: string): Promise<Celebration[]>;

  createWeeklyCheckin(checkin: InsertWeeklyCheckin): Promise<WeeklyCheckin>;

  getUsersByCategory(category: string, excludeUserId: string): Promise<User[]>;
  updateChatRoomMatchId(roomId: string, matchId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUserPoints(userId: string, pointsToAdd: number): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ points: sql`${users.points} + ${pointsToAdd}` })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async addUserBadge(userId: string, badge: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    if (user.badges?.includes(badge)) return user;
    const newBadges = [...(user.badges || []), badge];
    const [updated] = await db
      .update(users)
      .set({ badges: newBadges })
      .where(eq(users.id, userId))
      .returning();
    return updated;
  }

  async getLeaderboard(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.points)).limit(20);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [created] = await db.insert(posts).values(post).returning();
    return created;
  }

  async getPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt)).limit(50);
  }

  async encouragePost(postId: string, userId: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, postId));
    if (!post) return undefined;
    if (post.encouragedBy?.includes(userId)) return post;
    const newEncouragedBy = [...(post.encouragedBy || []), userId];
    const [updated] = await db
      .update(posts)
      .set({
        encouragements: sql`${posts.encouragements} + 1`,
        encouragedBy: newEncouragedBy,
      })
      .where(eq(posts.id, postId))
      .returning();
    return updated;
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [created] = await db.insert(matches).values(match).returning();
    return created;
  }

  async getMatchesByUser(userId: string): Promise<Match[]> {
    const allMatches = await db.select().from(matches).where(eq(matches.isActive, true)).orderBy(desc(matches.createdAt));
    return allMatches.filter((m) => m.userIds?.includes(userId));
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const [created] = await db.insert(chatRooms).values(room).returning();
    return created;
  }

  async getChatRoom(id: string): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return room;
  }

  async createMessage(msg: InsertMessage): Promise<Message> {
    const [created] = await db.insert(messages).values(msg).returning();
    return created;
  }

  async getMessages(chatRoomId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.chatRoomId, chatRoomId)).orderBy(messages.createdAt);
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const [created] = await db.insert(challenges).values(challenge).returning();
    return created;
  }

  async getChallengeByRoom(chatRoomId: string): Promise<Challenge | undefined> {
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.chatRoomId, chatRoomId))
      .orderBy(desc(challenges.createdAt))
      .limit(1);
    return challenge;
  }

  async completeChallenge(challengeId: string, userId: string): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, challengeId));
    if (!challenge) return undefined;
    if (challenge.completedBy?.includes(userId)) return challenge;
    const newCompletedBy = [...(challenge.completedBy || []), userId];
    const [updated] = await db
      .update(challenges)
      .set({ completedBy: newCompletedBy })
      .where(eq(challenges.id, challengeId))
      .returning();
    return updated;
  }

  async createCelebration(celebration: InsertCelebration): Promise<Celebration> {
    const [created] = await db.insert(celebrations).values(celebration).returning();
    return created;
  }

  async getCelebrations(userId: string): Promise<Celebration[]> {
    return db
      .select()
      .from(celebrations)
      .where(eq(celebrations.userId, userId))
      .orderBy(desc(celebrations.createdAt))
      .limit(20);
  }

  async createWeeklyCheckin(checkin: InsertWeeklyCheckin): Promise<WeeklyCheckin> {
    const [created] = await db.insert(weeklyCheckins).values(checkin).returning();
    return created;
  }

  async getUsersByCategory(category: string, excludeUserId: string): Promise<User[]> {
    const result = await db
      .select()
      .from(users)
      .where(and(eq(users.category, category)))
      .orderBy(desc(users.lastActive))
      .limit(20);
    return result.filter((u) => u.id !== excludeUserId);
  }

  async updateChatRoomMatchId(roomId: string, matchId: string): Promise<void> {
    await db.update(chatRooms).set({ matchId }).where(eq(chatRooms.id, roomId));
  }
}

export const storage = new DatabaseStorage();
