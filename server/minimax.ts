import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.minimax.io/v1",
  apiKey: process.env.MINIMAX_API_KEY || "",
});

export async function generateEncouragement(postContent: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: "MiniMax-M1",
      messages: [
        {
          role: "system",
          content:
            "You are a warm, empathetic support companion in a community where people share their setbacks and failures. Generate a short, heartfelt encouragement message (2-3 sentences max) for someone who shared a setback. Be genuine, not generic. Don't use emojis. Focus on acknowledging their struggle and offering real perspective.",
        },
        {
          role: "user",
          content: `Someone shared this setback: "${postContent}". Write a brief, personal encouragement message for them.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.8,
    });
    return response.choices[0]?.message?.content?.trim() || getFallbackEncouragement();
  } catch (e) {
    console.error("MiniMax encouragement error:", e);
    return getFallbackEncouragement();
  }
}

export async function generateChallenge(
  failures: string[],
  goal?: string | null
): Promise<string> {
  try {
    const context = goal
      ? `Their goal is: "${goal}". Their setbacks include: ${failures.join(", ")}.`
      : `Their setbacks include: ${failures.join(", ")}.`;

    const response = await client.chat.completions.create({
      model: "MiniMax-M1",
      messages: [
        {
          role: "system",
          content:
            "You are a supportive accountability coach. Generate a single specific, actionable daily challenge for two accountability partners who share similar setbacks. The challenge should be doable in 15-30 minutes, encourage collaboration between the two partners, and directly relate to overcoming their shared struggles. Keep it to 1-2 sentences. Don't use emojis.",
        },
        {
          role: "user",
          content: `Create a daily challenge for two partners. ${context}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.9,
    });
    return response.choices[0]?.message?.content?.trim() || getFallbackChallenge();
  } catch (e) {
    console.error("MiniMax challenge error:", e);
    return getFallbackChallenge();
  }
}

export async function generateSupportResponse(postContent: string): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: "MiniMax-M1",
      messages: [
        {
          role: "system",
          content:
            "You are a compassionate AI companion in a community for people going through setbacks. When someone shares a failure, provide a brief (2-3 sentences), thoughtful response that validates their feelings, reframes the setback as a growth opportunity, and offers one small actionable next step. Be genuine and conversational, not preachy. Don't use emojis.",
        },
        {
          role: "user",
          content: `Someone just shared this setback: "${postContent}". Respond with empathy and a helpful nudge forward.`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (e) {
    console.error("MiniMax support response error:", e);
    return "";
  }
}

function getFallbackEncouragement(): string {
  const messages = [
    "Every setback is a setup for a comeback. You got this.",
    "The fact that you tried means you're already ahead. Keep going.",
    "Failure is just feedback. You're learning and growing.",
    "It's okay to fall. What matters is getting back up. You're not alone.",
    "Your resilience is inspiring. Keep pushing forward.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getFallbackChallenge(): string {
  const challenges = [
    "Share one lesson you learned from your failure with your match and discuss how to apply it this week.",
    "Set a micro-goal for this week and check in with each other tomorrow to track progress.",
    "Spend 15 minutes brainstorming creative solutions to each other's biggest current obstacle.",
    "Write down 3 things you're grateful for despite the setback, then share and discuss them together.",
    "Practice your pitch or plan with each other for 5 minutes, then give honest feedback.",
  ];
  return challenges[Math.floor(Math.random() * challenges.length)];
}
