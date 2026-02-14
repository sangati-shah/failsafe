# FailSafe - Transform Failures into Connections

## Overview
FailSafe is a web application where users share setbacks anonymously, get matched with others facing similar challenges, and support each other through accountability partnerships and daily challenges.

## Tech Stack
- **Frontend**: React 18 + TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: MiniMax API (OpenAI-compatible, via openai npm package)
- **Real-time**: WebSocket (ws) for chat
- **Routing**: wouter (frontend), Express (backend)
- **State**: TanStack React Query

## Project Structure
```
client/src/
├── pages/           # Onboarding, Feed, Chat, Profile, Matches
├── components/      # AppSidebar, ThemeProvider, ThemeToggle, UI components
├── lib/             # queryClient, constants, utils
└── hooks/           # use-toast, use-mobile

server/
├── index.ts         # Express + WebSocket server
├── routes.ts        # All API endpoints + WebSocket handling
├── storage.ts       # Database CRUD (IStorage interface)
├── minimax.ts       # MiniMax AI service (encouragement, challenges, support)
├── db.ts            # Drizzle + pg connection
├── seed.ts          # Sample data seeder
└── constants.ts     # Points, challenges, room names

shared/
└── schema.ts        # Drizzle schema + Zod validation
```

## Key Features
- Anonymous onboarding (3 steps: goal, failures, preferences)
- Auto-generated usernames (Adjective_Noun_Number)
- Failure feed with AI-powered encouragement system
- AI support response when posting failures (MiniMax)
- AI-generated personalized daily challenges
- Leaderboard with points
- Matching system
- Real-time WebSocket chat rooms
- Profile with badges, "I Tried Again!" button
- Weekly check-ins
- Dark/light theme toggle

## AI Integration (MiniMax)
- **AI Support**: When posting a failure, MiniMax generates a personalized supportive response shown in a dialog
- **AI Encouragement**: When encouraging someone's post, MiniMax generates a contextual encouragement message shown in toast
- **AI Challenges**: When matched, MiniMax generates tailored daily challenges based on both partners' failures and goals
- Uses OpenAI SDK with MiniMax base URL (https://api.minimax.io/v1)
- Model: MiniMax-M1
- Fallback messages used if API fails

## API Endpoints
- `POST /api/users` - Create user (Zod validated)
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/tried-again` - "I tried again" (+50pts)
- `POST /api/users/:id/checkin` - Weekly check-in (+15pts)
- `GET /api/users/:id/celebrations` - Get celebrations
- `GET /api/posts` - Get failure feed
- `POST /api/posts` - Post a failure (+10pts)
- `POST /api/posts/:id/encourage` - Encourage (+5 giver, +2 receiver)
- `GET /api/leaderboard` - Top users by points
- `POST /api/matches/find` - Find match by category
- `GET /api/matches/:userId` - Get user matches
- `GET /api/chat/:roomId/room` - Get chat room info
- `GET /api/chat/:roomId/messages` - Get messages
- `POST /api/chat/:roomId/messages` - Send message
- `GET /api/chat/:roomId/challenge` - Get current challenge
- `POST /api/challenges/:id/complete` - Complete challenge (+20pts)

## Session
Uses localStorage (failsafe_user_id, failsafe_username) - no email/password needed.

## Points System
- Post a failure: +10
- Give encouragement: +5
- Receive encouragement: +2
- Complete challenge: +20
- "I tried again": +50
- Weekly check-in: +15

## Design
- Color palette: soft purples (primary), warm oranges (accent), calming blues (chart-3)
- Font: Inter
- Dark mode support via class-based toggle
