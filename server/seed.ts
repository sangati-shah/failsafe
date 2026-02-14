import { storage } from "./storage";
import { db } from "./db";
import { users, matches, chatRooms, challenges, posts } from "@shared/schema";

const ROOM_NAME_ADJECTIVES = ["Comeback", "Rising", "Unstoppable", "Resilient", "Brave", "Bold", "Mighty"];
const ROOM_NAME_NOUNS = ["Crew", "Squad", "Alliance", "Circle", "Guild", "Team", "Tribe"];

function genRoomName() {
  const adj = ROOM_NAME_ADJECTIVES[Math.floor(Math.random() * ROOM_NAME_ADJECTIVES.length)];
  const noun = ROOM_NAME_NOUNS[Math.floor(Math.random() * ROOM_NAME_NOUNS.length)];
  return `The ${adj} ${noun}`;
}

const LINKEDIN_USERS = [
  {
    username: "Resilient_Pioneer_4281",
    goal: "Build impactful AI/ML solutions and grow as a data science leader",
    failures: ["Failed interview", "Imposter syndrome", "Burnout"],
    linkedinUrl: "https://www.linkedin.com/in/sangatishah/",
    points: 210,
    badges: ["courage", "supporter", "phoenix"],
  },
  {
    username: "Bold_Explorer_7392",
    goal: "Lead data-driven innovation and mentor the next generation of ML engineers",
    failures: ["Rejected promotion", "Product launch flopped", "Burnout"],
    linkedinUrl: "https://www.linkedin.com/in/grishmajena/",
    points: 185,
    badges: ["courage", "action_taker", "connector"],
  },
  {
    username: "Fearless_Falcon_5618",
    goal: "Scale a tech startup and create meaningful products that help people",
    failures: ["Startup failed", "Funding rejected", "Lost major client"],
    linkedinUrl: "https://www.linkedin.com/in/amandahui",
    points: 160,
    badges: ["courage", "phoenix", "supporter"],
  },
  {
    username: "Brave_Summit_3947",
    goal: "Transition into a product management role in the tech industry",
    failures: ["Failed interview", "Rejected from program", "Imposter syndrome"],
    linkedinUrl: "https://www.linkedin.com/in/yogita-s-8a9227226/",
    points: 140,
    badges: ["courage", "action_taker"],
  },
];

export async function seedDatabase() {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) return;

  console.log("Seeding database with LinkedIn users and matches...");

  const createdUsers = [];
  for (const u of LINKEDIN_USERS) {
    const created = await storage.createUser(u);
    createdUsers.push(created);
  }

  const matchPairs = [
    { a: 0, b: 1, category: "Career Growth" },
    { a: 0, b: 3, category: "Job Search" },
    { a: 1, b: 2, category: "Starting a Business" },
    { a: 2, b: 3, category: "Career Change" },
  ];

  for (const pair of matchPairs) {
    const roomName = genRoomName();
    const room = await storage.createChatRoom({ matchId: "pending", roomName });
    const match = await storage.createMatch({
      userIds: [createdUsers[pair.a].id, createdUsers[pair.b].id],
      category: pair.category,
      chatRoomId: room.id,
    });
    await storage.updateChatRoomMatchId(room.id, match.id);
    await storage.createChallenge({
      chatRoomId: room.id,
      challenge: "Share one lesson you learned from your biggest setback and brainstorm ways to turn it into an opportunity.",
      estimatedTime: 30,
    });
  }

  const seedPosts = [
    {
      userId: createdUsers[0].id,
      username: createdUsers[0].username,
      category: "Career Growth",
      content: "Got passed over for a senior data science role I'd been working toward for 2 years. They promoted someone with less experience. Questioning everything right now, but I know growth isn't always linear.",
      severity: 4,
    },
    {
      userId: createdUsers[1].id,
      username: createdUsers[1].username,
      category: "Starting a Business",
      content: "Launched an ML consulting practice and the first two clients churned within a month. The product wasn't mature enough. Going back to basics and rebuilding with better feedback loops.",
      severity: 4,
    },
    {
      userId: createdUsers[2].id,
      username: createdUsers[2].username,
      category: "Startups",
      content: "Our startup ran out of runway after a failed funding round. Had to let go of our small team. The hardest conversation I've ever had. But I learned more in 18 months than in 5 years of corporate work.",
      severity: 5,
    },
    {
      userId: createdUsers[3].id,
      username: createdUsers[3].username,
      category: "Job Search",
      content: "Failed my 4th product management interview this quarter. Each time I get closer but can't seem to crack the case study portion. Studying harder and trying again next week.",
      severity: 3,
    },
  ];

  for (const p of seedPosts) {
    await storage.createPost({
      userId: p.userId,
      username: p.username,
      category: p.category,
      content: p.content,
      severity: p.severity,
    });
  }

  console.log("Database seeded with 4 LinkedIn users, 4 matches, and 4 posts!");
}
