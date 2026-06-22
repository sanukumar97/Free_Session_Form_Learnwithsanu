LearnWithSanu — Free 1-on-1 Enrollment Form

  A lightweight 3-step enrollment form for booking a free 1-on-1 IIT preparation session with
  LearnWithSanu. Built with Vite + React + TypeScript + Tailwind CSS, connected to the same
  Supabase backend as the main platform.

  What it does

  Students fill in their personal details, choose a session duration (10, 12, or 20 minutes),
  select their target IITs, preferred time slot, and submit — no payment required. The
  submission lands directly in the CoachOps admin dashboard under the Onboarding tab, clearly
  marked as a free enrollment.

  Tech Stack

  Vite 6 · React 18 · TypeScript · Tailwind CSS v4 · Supabase JS v2

  Environment

  Requires a .env.local file with:
  VITE_SUPABASE_URL=your-supabase-url
  VITE_SUPABASE_ANON_KEY=your-anon-key

  Run locally
  pnpm install
  pnpm run dev
