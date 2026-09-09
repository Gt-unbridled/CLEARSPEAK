# ClearSpeak — Build Plan
### A communication app designed for how dyslexic adults actually think and talk

---

## The Why (for your README/portfolio pitch)

Most dyslexia tools treat it as a *reading* problem solved with fonts and scanners. But research shows dyslexic adults struggle more with **live communication** than reading — 67% report communication in meetings/social settings as their biggest challenge, driven by working memory strain: finding words under pressure, tracking multiple ideas, and the anxiety of visible mistakes.

**ClearSpeak** is a messaging app that removes friction on both ends of a conversation — speaking/sending and reading/receiving — instead of just helping someone decode a page.

---

## MVP Scope (what you're actually building first)

1. Voice-first message composition (speak → auto-transcribed)
2. Text-to-speech on every received message (tap to listen)
3. AI simplification toggle on long/complex incoming messages
4. Visual chunking (short lines, not dense paragraphs)
5. Optional AI "clean this up" pass before sending — user approves, never automatic
6. Non-punitive spelling suggestions — quiet, inline, no red squiggles
7. Accessible reading settings — dyslexia-friendly font, adjustable spacing/line length, color overlay
8. Basic auth + real-time 1:1 or small-group messaging

**Explicitly NOT in MVP** (v2/v3 roadmap): conversation recap, quick-reply templates, practice/rehearsal mode, pre-conversation prep notes, mobile app wrap.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) | Fast to build, easy deploy, good accessibility tooling |
| Backend | Next.js API routes | No separate server needed for MVP |
| Database | Supabase (Postgres) | Free tier, built-in auth + realtime + storage |
| Real-time messaging | Supabase Realtime | Free tier, no separate WebSocket infra needed |
| Auth | Supabase Auth | Free, fast to integrate |
| Speech-to-text | OpenAI Whisper API | Cheap (~$0.006/min), accurate |
| Text-to-speech | ElevenLabs (free tier) or browser Web Speech API | Start free, upgrade only if quality demands it |
| AI simplification/cleanup | Claude API | Good at plain-language rewrites, cheap at low volume |
| Hosting | Vercel | Free tier, zero-config Next.js deploys |

**Estimated cost during build:** $0–20 total, staying on free tiers.

---

## Week-by-Week Plan (part-time pace, ~10-15 hrs/week)

### Week 1 — Foundations
- Set up Next.js project, GitHub repo, Vercel deploy pipeline (deploy "hello world" day one — always have something live)
- Set up Supabase project: auth, database schema (users, conversations, messages)
- Build basic auth flow (sign up / log in)
- **Deliverable:** users can create an account and log in

### Week 2 — Core messaging
- Build conversation UI (list of chats, message thread view)
- Implement real-time send/receive via Supabase Realtime
- Basic message storage (text only, no voice/AI yet)
- **Deliverable:** two accounts can message each other in real time

### Week 3 — Voice input + TTS output
- Integrate voice recording in the composer
- Wire up Whisper API for transcription
- Add TTS playback button on every received message (start with Web Speech API — free, ship fast; swap to ElevenLabs later if quality needs it)
- **Deliverable:** you can speak a message instead of typing, and tap to hear any message read aloud

### Week 4 — AI layer
- Add "simplify this" toggle on received messages → Claude API call, plain-language rewrite shown alongside original
- Add optional "clean this up" pass on the composer before sending (user must approve, never auto-applied)
- Add quiet inline spelling suggestions (not blocking, not red)
- **Deliverable:** both AI-assist features work end-to-end

### Week 5 — Accessible reading UI
- Add settings panel: font toggle (OpenDyslexic vs. standard), line spacing, color overlay options
- Implement visual chunking — break long messages into short lines automatically
- Polish overall UI/UX, test with actual dyslexia-friendly design patterns (generous spacing, left-aligned text, avoid justified text)
- **Deliverable:** full accessible settings hub, applied consistently across the app

### Week 6 — Polish, test, ship
- Cross-browser testing, mobile-responsive check (web, not native app yet)
- Fix bugs, tighten loading states, error handling
- Write the README — lead with the "why," the research, the problem/solution mapping
- Record a demo video/GIF for your portfolio page
- Deploy final version, share link
- **Deliverable:** live, demoable MVP + strong portfolio writeup

---

## After MVP — Roadmap (for your README's "what's next" section)

- **v2 (3-4 weeks):** conversation recap summaries, quick-reply templates, pre-conversation prep notes, practice/rehearsal mode
- **v3 (3-4 weeks):** wrap as mobile app (React Native), submit to App Store ($99/yr) and Play Store ($25 one-time)

Having this roadmap written out — even unbuilt — shows product thinking in interviews, without needing you to have built everything yet.

---

## Portfolio Presentation Tips

- Open your case study with the stat, not the tech: "67% of dyslexic adults struggle most with live communication — yet every existing tool treats dyslexia as a reading problem."
- Show the problem → feature mapping explicitly (you already have this from our conversation — reuse it)
- Include a short demo video — for this project specifically, *seeing it work* matters more than reading about it
- Be upfront about what's MVP vs. roadmap — it reads as intentional scoping, not an unfinished project
