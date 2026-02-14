import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { ROOM_NAME_ADJECTIVES, ROOM_NAME_NOUNS, POINTS } from "./constants";
import { insertUserSchema, insertPostSchema, insertMessageSchema, insertWeeklyCheckinSchema } from "@shared/schema";
import { generateEncouragement, generateChallenge, generateSupportResponse, generateGoalFailures } from "./minimax";

const chatRoomClients: Map<string, Set<WebSocket>> = new Map();

function generateRoomName(): string {
  const adj = ROOM_NAME_ADJECTIVES[Math.floor(Math.random() * ROOM_NAME_ADJECTIVES.length)];
  const noun = ROOM_NAME_NOUNS[Math.floor(Math.random() * ROOM_NAME_NOUNS.length)];
  return `The ${adj} ${noun}`;
}


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ---- USERS ----
  app.post("/api/users", async (req, res) => {
    try {
      const parsed = insertUserSchema.parse(req.body);
      const user = await storage.createUser(parsed);
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/generate-failures", async (req, res) => {
    try {
      const { goal } = req.body;
      if (!goal || typeof goal !== "string") {
        return res.status(400).json({ message: "Goal is required" });
      }
      const failures = await generateGoalFailures(goal);
      res.json({ failures });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/users/:id/tried-again", async (req, res) => {
    try {
      const userId = req.params.id;
      await storage.updateUserPoints(userId, POINTS.TRIED_AGAIN);
      await storage.addUserBadge(userId, "phoenix");
      await storage.createCelebration({
        userId,
        type: "tried_again",
        description: "Tried again after a setback!",
        points: POINTS.TRIED_AGAIN,
      });
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/users/:id/checkin", async (req, res) => {
    try {
      const userId = req.params.id;
      const parsed = insertWeeklyCheckinSchema.parse(req.body);
      const checkin = await storage.createWeeklyCheckin(parsed);
      await storage.updateUserPoints(userId, POINTS.WEEKLY_CHECKIN);
      await storage.createCelebration({
        userId,
        type: "milestone",
        description: "Completed a weekly check-in",
        points: POINTS.WEEKLY_CHECKIN,
      });
      res.json(checkin);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ---- POSTS ----
  app.get("/api/posts", async (_req, res) => {
    try {
      const allPosts = await storage.getPosts();
      res.json(allPosts);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const parsed = insertPostSchema.parse(req.body);
      const post = await storage.createPost(parsed);
      await storage.updateUserPoints(parsed.userId, POINTS.POST_FAILURE);
      await storage.addUserBadge(parsed.userId, "courage");
      const aiSupport = await generateSupportResponse(parsed.content);
      res.json({ ...post, aiSupport });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/posts/:id/encourage", async (req, res) => {
    try {
      const { userId } = req.body;
      const post = await storage.encouragePost(req.params.id, userId);
      if (!post) return res.status(404).json({ message: "Post not found" });
      await storage.updateUserPoints(userId, POINTS.GIVE_ENCOURAGEMENT);
      await storage.updateUserPoints(post.userId, POINTS.RECEIVE_ENCOURAGEMENT);
      const aiMessage = await generateEncouragement(post.content);
      res.json({ ...post, aiEncouragement: aiMessage });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ---- LEADERBOARD ----
  app.get("/api/leaderboard", async (_req, res) => {
    try {
      const lb = await storage.getLeaderboard();
      res.json(lb);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ---- MATCHES ----
  app.get("/api/matches/:userId", async (req, res) => {
    try {
      const userMatches = await storage.getMatchesByUser(req.params.userId);
      const enriched = await Promise.all(
        userMatches.map(async (m) => {
          const room = await storage.getChatRoom(m.chatRoomId);
          return { ...m, room };
        })
      );
      res.json(enriched);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/matches/find", async (req, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const allUsers = await storage.getAllUsers();
      const existingMatches = await storage.getMatchesByUser(userId);
      const alreadyMatchedIds = new Set<string>();
      alreadyMatchedIds.add(userId);
      for (const m of existingMatches) {
        for (const uid of m.userIds || []) {
          alreadyMatchedIds.add(uid);
        }
      }

      const candidates = allUsers.filter((u) => !alreadyMatchedIds.has(u.id));

      if (candidates.length === 0) {
        return res.status(404).json({ message: "No new matches found. Check back later!" });
      }

      const scored = candidates.map((c) => {
        const sharedFailures = (user.failures || []).filter((f) => (c.failures || []).includes(f));
        return { user: c, score: sharedFailures.length };
      });
      scored.sort((a, b) => b.score - a.score);

      const matchPartner = scored[0].user;

      const roomName = generateRoomName();
      const room = await storage.createChatRoom({
        matchId: "pending",
        roomName,
      });

      const sharedCategory = (user.failures || []).find((f) => (matchPartner.failures || []).includes(f)) || "General";

      const match = await storage.createMatch({
        userIds: [userId, matchPartner.id],
        category: sharedCategory,
        chatRoomId: room.id,
      });

      await storage.updateChatRoomMatchId(room.id, match.id);

      const allFailures = [...(user.failures || []), ...(matchPartner.failures || [])];
      const challenge = await generateChallenge(allFailures, user.goal);
      await storage.createChallenge({
        chatRoomId: room.id,
        challenge,
        estimatedTime: 30,
      });

      await storage.addUserBadge(userId, "connector");

      res.json(match);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/matches/:matchId/reveal", async (req, res) => {
    try {
      const { userId } = req.body;
      const match = await storage.revealProfile(req.params.matchId, userId);
      if (!match) return res.status(404).json({ message: "Match not found" });
      res.json(match);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ---- CHAT ----
  app.get("/api/chat/:roomId/room", async (req, res) => {
    try {
      const room = await storage.getChatRoom(req.params.roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });
      const match = await storage.getMatchById(room.matchId);
      let partnerUsernames: string[] = [];
      let partnerProfiles: { userId: string; username: string; linkedinUrl: string | null }[] = [];
      if (match?.userIds) {
        const fetchedUsers = await Promise.all(match.userIds.map((uid) => storage.getUser(uid)));
        partnerUsernames = fetchedUsers.filter(Boolean).map((u) => u!.username);
        partnerProfiles = fetchedUsers.filter(Boolean).map((u) => ({
          userId: u!.id,
          username: u!.username,
          linkedinUrl: u!.linkedinUrl,
        }));
      }
      const allRevealed = match?.profilesRevealed && match.userIds &&
        match.userIds.every((uid) => match.profilesRevealed?.includes(uid));
      res.json({
        ...room,
        partnerUsernames,
        matchId: match?.id,
        profilesRevealed: match?.profilesRevealed || [],
        allProfilesRevealed: !!allRevealed,
        partnerProfiles: allRevealed ? partnerProfiles : [],
      });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/chat/:roomId/messages", async (req, res) => {
    try {
      const msgs = await storage.getMessages(req.params.roomId);
      res.json(msgs);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/chat/:roomId/messages", async (req, res) => {
    try {
      const parsed = insertMessageSchema.parse(req.body);
      const msg = await storage.createMessage(parsed);
      res.json(msg);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/chat/:roomId/challenge", async (req, res) => {
    try {
      const challenge = await storage.getChallengeByRoom(req.params.roomId);
      res.json(challenge || null);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ---- CHALLENGES ----
  app.post("/api/challenges/:id/complete", async (req, res) => {
    try {
      const { userId } = req.body;
      const challenge = await storage.completeChallenge(req.params.id, userId);
      if (!challenge) return res.status(404).json({ message: "Challenge not found" });
      await storage.updateUserPoints(userId, POINTS.COMPLETE_CHALLENGE);
      await storage.addUserBadge(userId, "action_taker");
      await storage.createCelebration({
        userId,
        type: "milestone",
        description: "Completed a daily challenge",
        points: POINTS.COMPLETE_CHALLENGE,
      });
      res.json(challenge);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ---- CELEBRATIONS ----
  app.get("/api/users/:id/celebrations", async (req, res) => {
    try {
      const celeb = await storage.getCelebrations(req.params.id);
      res.json(celeb);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  // ---- WEBSOCKET ----
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    let currentRoom: string | null = null;

    ws.on("message", (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.type === "join") {
          currentRoom = data.roomId;
          if (!chatRoomClients.has(data.roomId)) {
            chatRoomClients.set(data.roomId, new Set());
          }
          chatRoomClients.get(data.roomId)!.add(ws);
        }

        if (data.type === "message" && data.roomId) {
          const clients = chatRoomClients.get(data.roomId);
          if (clients) {
            clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: "message", roomId: data.roomId }));
              }
            });
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    });

    ws.on("close", () => {
      if (currentRoom) {
        chatRoomClients.get(currentRoom)?.delete(ws);
      }
    });
  });

  return httpServer;
}
