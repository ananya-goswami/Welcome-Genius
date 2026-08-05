# SwiftyStart — ConveGenius HR Induction Game

You are building **SwiftyStart**, a Duolingo-style onboarding game for new
ConveGenius joiners. Full detailed spec lives in `docs/GAME_SPEC.md` —
treat it as the source of truth for every screen, data shape, and content
fact. Read it in full before writing code.

## Non-negotiable rules (do not deviate from these, ever)

1. **Golden rule of gating**: a user only ever sees content and quiz
   questions that apply to their selected `role` (central / state / intern)
   and, where relevant, `gender` (woman / man). Central must never see
   State content or numbers, interns must never see FTE-only modules
   (parental, finances, insurance, probation, travel, referral, appraisal),
   and maternity/paternity content must never cross genders. This is
   enforced by filtering on `appliesTo` — see `docs/GAME_SPEC.md` §3.

2. **Content is locked and verified.** Every fact in `docs/GAME_SPEC.md`
   §6 (story cards) and §7 (quiz bank) was extracted directly from the
   company's official policy PDFs and cross-checked. Do not invent,
   round, "improve," rephrase into a different number, or guess any
   figure, date, name, or contact detail. If you think something is
   missing or inconsistent, leave a `// TODO: confirm with HR` comment
   and ask — never fill the gap with a plausible-sounding guess.

3. **No AI-generated image assets.** All visuals are code-built (CSS/SVG
   gradients, shapes, Tailwind). The only bitmap assets are the 4 Swifty
   mascot PNGs supplied in `/public/swifty/` — use those exactly, don't
   generate replacements.

4. **State only, no persistence.** All game state (filters, progress,
   answers, score) lives in React state (`useState`/`useReducer`) for a
   single session. Do NOT use `localStorage`, `sessionStorage`, cookies,
   or any backend. A failed quiz triggers a full in-memory reset to
   Filter 1 — see §5.5.

5. **Mobile-first responsive.** Every screen must work at ~375px width
   (iPhone SE) up to a laptop viewport, with no horizontal scroll and
   tap targets ≥44px.

## Tech stack

- Vite + React + TypeScript
- Tailwind CSS (brand tokens in `docs/GAME_SPEC.md` §8)
- Framer Motion for micro-animations
- canvas-confetti for the pass celebration
- No routing library needed — one `Screen` state enum drives everything
  (§4). No backend, no database.

## Build phases — work through these IN ORDER, one at a time

Do not jump ahead. After each phase, stop, show me what changed, and wait
for me to say "continue" before starting the next one. Commit to git at
the end of each phase with a clear message.

**Phase 0 — Scaffold**
Set up Vite+React+TS, Tailwind config with the exact brand tokens from
§8, base folder structure from §9, and drop in the Swifty assets. Render
a placeholder screen that just shows the SwiftyStart title and a Swifty
image, styled with brand colors. Nothing else yet.

**Phase 1 — Data layer**
Create `src/data/content.ts` and `src/data/quiz.ts` implementing the
exact TypeScript types from §3 and populating them with the exact story
cards (§6) and quiz bank (§7). No UI yet — just the typed data, plus a
small `src/logic/filter.ts` with the `visibleTo()` gating function from
§3.4 and a unit-testable `selectQuizForPath()` function that assembles
the right 12 (or 8) questions per §7.3.

**Phase 2 — Screen shell & navigation**
Build the `Screen` state machine (§4): Splash → Filter1 → Filter2
(skippable) → Journey → Quiz → Results → Certificate. Just navigation
and layout scaffolding per screen, minimal styling, no animations yet.
Wire Filter1/Filter2 selections into a `UserPath` state object at the
App root (single source of truth — do not duplicate this state anywhere
else).

**Phase 3 — Journey screen**
Build the tap-through story card experience: progress bar, Swifty
avatar with pose-swapping, card content pulled from `content.ts` and
filtered by `visibleTo()`, Next/Back controls. Add card transition
animation.

**Phase 4 — Quiz screen**
Build all three question renderers (MC, True/False, drag-to-match).
Drag-to-match must work on both mouse and touch (use pointer events,
not just HTML5 drag-and-drop, which is unreliable on mobile). Implement
scoring exactly per §7.4.

**Phase 5 — Results + restart logic**
Pass branch → Certificate. Fail branch → confirmation message from
Swifty, then reset `journeyIndex`, `quizAnswers`, and `score` ONLY —
`path` (role/gender) is preserved — and return to the first Journey
card. Increment `attemptNumber` (never resets). Verify with a manual
test that role/gender survive a failed attempt and no stale quiz
answers survive into the retry.

**Phase 6 — Certificate screen**
Name input, generated certificate per §7.5 (path, score, date, unique
certificate ID), styled as a presentable/printable card. Add a "Download
as image" option if time allows (not required for v1).

**Phase 7 — Polish pass**
XP/progress bar animation, confetti on pass, responsive QA at 375px/
768px/1440px, final color/spacing audit against §8.

**Phase 8 — Results logging (HR visibility)**
Wire up the Google Sheets logging call from `docs/GAME_SPEC.md` §10 —
fire it on every quiz submission (pass AND fail), not just on
certificate generation. Put the webhook URL in `.env` as
`VITE_LOG_ENDPOINT`, never hardcode it in a committed file. This call
must never block or fail the UI — wrap it so a network error is
swallowed silently (log to console only) and the user's results/
certificate screen renders regardless of whether the log succeeded.

## Commands

```bash
npm run dev       # local dev server
npm run dev -- --host   # expose on your network to test on your phone
npm run build     # production build
```
