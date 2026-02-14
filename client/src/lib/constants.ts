export const CATEGORIES = [
  "Job Search",
  "Career Change",
  "Starting a Business",
  "Learning a Skill",
  "Academic/Certification",
  "Health & Fitness",
  "Creative Projects",
  "Relationships",
  "Other",
] as const;

export const FAILURES_BY_CATEGORY: Record<string, string[]> = {
  "Job Search": [
    "Failed multiple interviews",
    "No responses to applications",
    "Rejected after final round",
    "Ghosted by recruiters",
    "Can't get past screening",
  ],
  "Career Change": [
    "Couldn't land new role",
    "Skills gap too large",
    "Lost confidence mid-transition",
    "Networking didn't pay off",
    "Took a pay cut that hurt",
  ],
  "Starting a Business": [
    "Failed product launch",
    "Lost funding/investors",
    "Co-founder conflict",
    "Product didn't find market fit",
    "Ran out of runway",
  ],
  "Learning a Skill": [
    "Gave up halfway through course",
    "Can't find time to practice",
    "Failed certification exam",
    "Tutorial hell - no real projects",
    "Overwhelmed by complexity",
  ],
  "Academic/Certification": [
    "Failed certification exam",
    "Didn't get into program",
    "Poor grades in key course",
    "Thesis/project rejected",
    "Can't grasp core concepts",
  ],
  "Health & Fitness": [
    "Quit workout routine",
    "Didn't hit weight goal",
    "Injury setback",
    "Can't stay consistent",
    "Diet failed",
  ],
  "Creative Projects": [
    "Project never finished",
    "Negative feedback crushed motivation",
    "Creative block for months",
    "No audience for my work",
    "Failed to monetize",
  ],
  "Relationships": [
    "Communication breakdown",
    "Trust issues",
    "Failed to set boundaries",
    "Lost important connection",
    "Conflict avoidance backfired",
  ],
  "Other": [
    "Couldn't stick with my plan",
    "Procrastinated too long",
    "Fear of failure held me back",
    "Lost motivation",
    "Burnout from trying too hard",
  ],
};

export const ADJECTIVES = [
  "Phoenix", "Rising", "Brave", "Bold", "Determined",
  "Fearless", "Mighty", "Resilient", "Steady", "Luminous",
  "Bright", "Calm", "Noble", "Gentle", "Fierce",
];

export const NOUNS = [
  "Eagle", "Tiger", "Mountain", "Star", "Warrior",
  "Champion", "Explorer", "Pioneer", "Voyager", "Falcon",
  "Wolf", "River", "Summit", "Compass", "Anchor",
];

export function generateUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}_${noun}_${num}`;
}

export const SAMPLE_CHALLENGES = [
  "Do one mock interview together and give each other feedback",
  "Share one lesson you learned from your failure with your match",
  "Set a micro-goal for this week and check in tomorrow",
  "Research one company together and prepare 3 questions to ask",
  "Practice your pitch to each other for 5 minutes",
  "Review each other's resumes and suggest 2 improvements",
  "Write down 3 things you're grateful for despite the setback",
  "Spend 15 minutes brainstorming creative solutions together",
  "Set a 25-minute timer and work on your goal in silence together",
  "Share your biggest learning from the past week",
];

export const ENCOURAGEMENT_MESSAGES = [
  "Every setback is setup for a comeback. You got this!",
  "Failure is just feedback. You're learning and growing. Keep going!",
  "The fact that you tried means you're already ahead. Proud of you!",
  "It's okay to fall. What matters is getting back up. You're not alone!",
  "Your resilience is inspiring. Keep pushing forward!",
  "Small steps still move you forward. You're doing great!",
  "The bravest thing is to keep trying. And here you are!",
  "Every expert was once a beginner who failed. Keep at it!",
];

export const KUDOS_REACTIONS = [
  { emoji: "muscle", label: "Keep going!" },
  { emoji: "fire", label: "You got this!" },
  { emoji: "star", label: "Proud of you!" },
  { emoji: "target", label: "On track!" },
] as const;

export const ROOM_NAME_ADJECTIVES = [
  "Comeback", "Rising", "Unstoppable", "Resilient", "Brave",
  "Bold", "Mighty", "Fierce", "Luminous", "Phoenix",
];

export const ROOM_NAME_NOUNS = [
  "Crew", "Squad", "Alliance", "Circle", "Guild",
  "Team", "Tribe", "Pack", "Force", "League",
];

export const BADGE_INFO: Record<string, { name: string; description: string; icon: string }> = {
  courage: { name: "Courage Badge", description: "Posted your first failure", icon: "shield" },
  supporter: { name: "Supporter Badge", description: "Gave 5 encouragements", icon: "heart-handshake" },
  action_taker: { name: "Action Taker Badge", description: "Completed first challenge", icon: "zap" },
  rising_star: { name: "Rising Star Badge", description: "Reached 100 points", icon: "sparkles" },
  phoenix: { name: "Phoenix Badge", description: "Tried again after failure", icon: "flame" },
  connector: { name: "Connector Badge", description: "Joined your first chat room", icon: "users" },
  consistent: { name: "Consistency Badge", description: "Completed 3 weekly check-ins", icon: "calendar-check" },
};

export const POINTS = {
  POST_FAILURE: 10,
  RECEIVE_ENCOURAGEMENT: 2,
  GIVE_ENCOURAGEMENT: 5,
  COMPLETE_CHALLENGE: 20,
  TRIED_AGAIN: 50,
  WEEKLY_CHECKIN: 15,
} as const;

export const MOODS = ["Great", "Good", "Okay", "Tough", "Very Tough"] as const;
