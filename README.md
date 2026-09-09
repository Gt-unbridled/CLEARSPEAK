# ClearSpeak

Messaging built for how dyslexic adults actually think and talk — voice in, speech out, and a gentle simplify option, instead of another app that just changes the font.

## Why this exists

Dyslexia isn't just a reading problem. A 2025 survey found 67% of dyslexic adults say live communication — meetings, group chats, quick replies — is harder than written tasks, driven by working memory strain: finding the right word under pressure, holding several ideas in a thread, feeling exposed by a visible typo.

Existing tools (Speechify, Kurzweil, OpenDyslexic-powered readers) treat this as a *reading* problem for *children in school*. Nothing targets the *live conversation* struggle for *adults*. ClearSpeak does.

## Status

Week 1 of the build plan: project scaffolding, design system, and working auth (sign up / log in / sign out) are in place. See `BUILD_PLAN.md` for the full week-by-week roadmap.

## Tech stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Font:** Atkinson Hyperlegible — designed for readability, free from Google Fonts
- **Backend:** Supabase (Postgres, Auth, Realtime, Storage)
- **Voice-to-text:** OpenAI Whisper API (added Week 3)
- **Text-to-speech:** Web Speech API to start, ElevenLabs optional upgrade (added Week 3)
- **AI simplify/cleanup:** Claude API (added Week 4)
- **Hosting:** Vercel

## Project structure

```
clearspeak/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout, font + design tokens
│   ├── globals.css           # Color palette, type scale, accessibility defaults
│   ├── auth-form.tsx          # Shared login/signup form
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── chat/
│       ├── page.tsx          # Main chat shell (protected route)
│       └── sign-out-button.tsx
├── utils/supabase/
│   ├── client.ts               # Browser Supabase client
│   ├── server.ts                # Server component Supabase client
│   └── middleware.ts           # Session refresh + route protection
├── middleware.ts                # Next.js middleware entry point
├── supabase/
│   └── schema.sql              # Full database schema + RLS policies
├── BUILD_PLAN.md                # Week-by-week roadmap
└── .env.local.example
```

## Setup

### 1. Create a Supabase project
Go to supabase.com, create a free project.

### 2. Run the schema
In your Supabase project, open the SQL Editor and run the contents of `supabase/schema.sql`. This creates the `profiles`, `conversations`, `conversation_participants`, and `messages` tables with row-level security policies, and enables realtime on messages.

### 3. Create a storage bucket
In Supabase Storage, create a private bucket named `voice-messages` (used from Week 3 onward for recorded audio).

### 4. Environment variables
Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL and anon key (found in Supabase → Project Settings → API).

```bash
cp .env.local.example .env.local
```

### 5. Install and run
```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. Sign up for an account — Supabase will send a confirmation email (check your inbox, or disable email confirmation in Supabase Auth settings for faster local testing).

### 6. Deploy
Push to GitHub, then import the repo into Vercel. Add the same two environment variables in the Vercel project settings. Every push to main auto-deploys.

## Database schema

Four tables, all with row-level security so users only ever see their own data:

- **profiles** — extends Supabase's built-in auth.users with display name and accessibility preferences (font, color overlay, line spacing, TTS speed)
- **conversations** — a conversation shell
- **conversation_participants** — join table linking users to conversations
- **messages** — the actual messages, with fields for the original voice file, whether it was AI-simplified, and whether the sender used the cleanup pass before sending

Full SQL with comments is in `supabase/schema.sql`.

## Design principles

The interface itself should never feel like it's testing you:
- No red error states — errors use a calm, neutral tone
- No autocorrect-style red squiggles
- Generous spacing, short line lengths, left-aligned text throughout
- Atkinson Hyperlegible font by default
- Visible keyboard focus and reduced-motion support built into the base CSS

## Roadmap

See `BUILD_PLAN.md` for the full week-by-week plan. Short version:

- **Week 2:** real-time messaging between users
- **Week 3:** voice input (Whisper) + text-to-speech on every message
- **Week 4:** AI simplify + cleanup pass (Claude API)
- **Week 5:** accessible reading settings (fonts, overlays, chunking)
- **Week 6:** polish, testing, deploy
- **v2:** conversation recap, quick-reply templates, practice mode
- **v3:** wrap as a mobile app for iOS and Android
