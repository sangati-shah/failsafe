import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";

const ADJECTIVES = ["Phoenix", "Rising", "Brave", "Bold", "Determined", "Fearless", "Mighty", "Resilient"];
const NOUNS = ["Eagle", "Tiger", "Mountain", "Star", "Warrior", "Champion", "Explorer", "Pioneer"];

function genUsername() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}_${noun}_${num}`;
}

export async function seedDatabase() {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) return;

  console.log("Seeding database with sample data...");

  const seedUsers = [
    {
      username: genUsername(),
      category: "Job Search",
      goal: "Land a product manager role at a top tech company",
      failures: ["Failed multiple interviews", "Rejected after final round", "Ghosted by recruiters"],
      failureDescription: "I've been applying for PM roles for 6 months. Got to the final round 3 times but haven't landed an offer yet.",
      severity: 4,
      points: 245,
      badges: ["courage", "supporter", "phoenix"],
    },
    {
      username: genUsername(),
      category: "Starting a Business",
      goal: "Launch a SaaS product for small businesses",
      failures: ["Failed product launch", "Product didn't find market fit"],
      failureDescription: "Built a tool nobody wanted. Going back to customer discovery.",
      severity: 5,
      points: 180,
      badges: ["courage", "action_taker"],
    },
    {
      username: genUsername(),
      category: "Learning a Skill",
      goal: "Become proficient in machine learning",
      failures: ["Gave up halfway through course", "Tutorial hell - no real projects"],
      failureDescription: "Watched 100 hours of tutorials but haven't built anything real.",
      severity: 3,
      points: 130,
      badges: ["courage"],
    },
    {
      username: genUsername(),
      category: "Job Search",
      goal: "Transition from backend to full-stack engineering",
      failures: ["No responses to applications", "Can't get past screening"],
      failureDescription: "Switching from backend-only to full-stack. Struggling with frontend skills in interviews.",
      severity: 3,
      points: 95,
      badges: ["courage", "supporter"],
    },
    {
      username: genUsername(),
      category: "Health & Fitness",
      goal: "Run a half marathon by end of year",
      failures: ["Quit workout routine", "Injury setback"],
      failureDescription: "Knee injury set me back 2 months. Trying to get back into training.",
      severity: 4,
      points: 75,
      badges: ["courage", "phoenix"],
    },
  ];

  const createdUsers = [];
  for (const u of seedUsers) {
    const created = await storage.createUser(u);
    createdUsers.push(created);
  }

  const seedPosts = [
    {
      userId: createdUsers[0].id,
      username: createdUsers[0].username,
      category: "Job Search",
      content: "Just got rejected after a 5-round interview process. They said I was 'too junior' for the role. I have 4 years of experience. Feeling defeated but I know I need to keep going.",
      severity: 4,
      encouragements: 12,
    },
    {
      userId: createdUsers[1].id,
      username: createdUsers[1].username,
      category: "Starting a Business",
      content: "Spent 8 months building a product nobody wanted. Had to shut it down today. The hardest part isn't the failure - it's telling your team.",
      severity: 5,
      encouragements: 8,
    },
    {
      userId: createdUsers[2].id,
      username: createdUsers[2].username,
      category: "Learning a Skill",
      content: "I've been in tutorial hell for 6 months. I can follow along but freeze when I try to build something from scratch. Anyone else feel this way?",
      severity: 3,
      encouragements: 15,
    },
    {
      userId: createdUsers[3].id,
      username: createdUsers[3].username,
      category: "Job Search",
      content: "Applied to 47 jobs this month. Got 2 responses. Neither turned into interviews. Starting to wonder if my resume goes straight to the trash.",
      severity: 4,
      encouragements: 9,
    },
    {
      userId: createdUsers[4].id,
      username: createdUsers[4].username,
      category: "Health & Fitness",
      content: "Tore my ACL during training. Doctor says 6-8 weeks off. My half marathon goal feels impossible now. But I'm not giving up - just recalibrating.",
      severity: 4,
      encouragements: 11,
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

  console.log("Database seeded successfully!");
}
