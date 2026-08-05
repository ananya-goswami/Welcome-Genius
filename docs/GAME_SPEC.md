# SwiftyStart — Full Game Specification

Source of truth for the build. All content below is verified against the
8 official ConveGenius policy PDFs (Central Leave Policy 2025, State Leave
Policy 2025, Employee Referral Policy, Guest House Policy FY 2024-25,
CGD Child Protection Policy, Domestic Travel Policy, Local Conveyance
Policy, CG POSH Policy) plus the HR Induction deck.

---

## 1. One-paragraph summary

SwiftyStart is a single-session, mobile-first web game. A new joiner
picks their role (Central FTE / State FTE / Intern) and, for FTEs, their
gender (for parental-leave content only). They then tap through a
Swifty-narrated story journey built entirely from content that applies
to *their* path, take a short quiz sourced only from what they just
read, and — on passing — receive an on-screen, HR-verifiable completion
certificate. Failing sends them back to the very start.

---

## 2. Golden rule (read this twice)

**A user must never see, in the journey or the quiz, any content that
does not apply to their exact `{role, gender}` combination.**

- Central ≠ State ≠ Intern — different leave numbers, different module
  lists. Never blend or average them.
- Woman ≠ Man for parental content — a man never sees the maternity
  card/question, a woman never sees the paternity card/question. Both
  see the adoption card/question (it applies to either parent).
- Interns see ONLY: Welcome, Attendance, Holidays, Intern Leave, POSH,
  Child Protection, Helpdesk, and the quiz. They never see parental,
  finances, insurance, probation, travel, referral, or appraisal
  content, and Filter 2 (gender) is skipped entirely for them.

This is enforced structurally (§3.4), not by hiding UI — an intern's
component tree should never even receive FTE-only cards as props.

---

## 3. Data model (TypeScript)

### 3.1 Core types

```typescript
export type Role = 'central' | 'state' | 'intern';
export type Gender = 'woman' | 'man'; // only meaningful when role !== 'intern'

export interface UserPath {
  role: Role;
  gender: Gender | null; // null for interns, and null until Filter 2 is answered
}

export interface AppliesTo {
  roles: Role[];           // which roles see this item
  genders?: Gender[];      // omit = applies to all genders within those roles
}
```

### 3.2 Story card

```typescript
export type SwiftyPose = 'welcome' | 'default' | 'thinking' | 'curious';

export interface StoryCard {
  id: string;            // unique, e.g. "leaves-central-1"
  module: string;        // groups cards, e.g. "Leaves", "POSH"
  order: number;         // display order within the full journey
  pose: SwiftyPose;
  title: string;
  body: string;          // 1-3 short sentences, Swifty's narrating voice
  appliesTo: AppliesTo;
}
```

### 3.3 Quiz question

```typescript
export type QuestionType = 'mc' | 'tf' | 'match';

export interface McQuestion {
  id: string;
  type: 'mc';
  module: string;
  appliesTo: AppliesTo;
  question: string;
  options: string[];       // exactly 4
  correctIndex: number;    // 0-3
}

export interface TfQuestion {
  id: string;
  type: 'tf';
  module: string;
  appliesTo: AppliesTo;
  statement: string;
  correctAnswer: boolean;
}

export interface MatchPair {
  left: string;
  right: string;
}

export interface MatchQuestion {
  id: string;
  type: 'match';
  module: string;
  appliesTo: AppliesTo;
  prompt: string;
  pairs: MatchPair[];      // scored all-or-nothing as ONE question
}

export type QuizQuestion = McQuestion | TfQuestion | MatchQuestion;
```

### 3.4 The gating function (implement exactly this contract)

```typescript
export function visibleTo<T extends { appliesTo: AppliesTo }>(
  item: T,
  path: UserPath
): boolean {
  if (!item.appliesTo.roles.includes(path.role)) return false;
  if (item.appliesTo.genders && path.gender) {
    return item.appliesTo.genders.includes(path.gender);
  }
  // if the item specifies genders but the user has none set (interns),
  // it should never match, since gendered items never list role 'intern'
  if (item.appliesTo.genders && !path.gender) return false;
  return true;
}
```

Use `visibleTo` to filter both `storyCards` and `quizBank` — never write
a second, parallel filtering rule anywhere else in the app.

---

## 4. Screen flow (state machine)

```
SPLASH
  ↓ (tap Start)
FILTER_1  — choose role: Central FTE / State FTE / Intern
  ↓
FILTER_2  — choose gender: Woman / Man
  (SKIPPED automatically if role === 'intern'; gender stays null)
  ↓
JOURNEY   — sequential tap-through story cards, filtered by visibleTo()  ←─┐
  ↓ (last card tapped "Next")                                             │
QUIZ      — questions assembled by selectQuizForPath() (§7.3)             │
  ↓ (submit)                                                              │
RESULTS                                                                   │
  ├─ PASS → CERTIFICATE (enter name if not already captured → show cert) │
  └─ FAIL → reset journeyIndex/answers/score only, path stays put ───────┘
```

Note the fail loop returns to **JOURNEY**, not FILTER_1/2. `path` (role
and gender) is set once per session and only re-enters the flow if the
user explicitly restarts from the splash screen — there's no in-game
action that clears it. See §5.5 for the exact reset contract.

Single enum drives rendering:

```typescript
export type Screen =
  | 'splash' | 'filter1' | 'filter2' | 'journey'
  | 'quiz' | 'results' | 'certificate';
```

No router library needed. One top-level `<App>` component holds
`screen`, `path: UserPath`, `journeyIndex`, `quizAnswers`, `score`, and
`certificateName` in state and passes down what each screen needs.

---

## 5. Screen-by-screen behavior

### 5.1 Splash
Full-bleed indigo/purple gradient background, Swifty in the "welcome"
pose (wings spread), title "SwiftyStart", subtitle "Your ConveGenius
journey begins here", single CTA button "Let's go →".

### 5.2 Filter 1 — Role
Three large tappable cards: **Central FTE**, **State FTE**, **Intern**.
Selecting one sets `path.role` and advances. If `role === 'intern'`,
skip directly to Journey (set `path.gender = null`); otherwise go to
Filter 2.

### 5.3 Filter 2 — Gender (FTE only)
Two tappable cards: **Woman**, **Man**. Copy should make clear this is
only used to show the correct parental-leave content, e.g. "So we show
you the right parental leave info." Sets `path.gender`.

### 5.4 Journey
- Top: progress bar = `journeyIndex / totalVisibleCards`.
- Center: `SwiftyAvatar` (pose from current card) + `StoryCard` content.
- Bottom: "Back" (disabled on first card) and "Next" buttons.
- Card list = `storyCards.filter(c => visibleTo(c, path)).sort(order)`.
- On last card, "Next" becomes "Start Quiz →" and transitions to QUIZ.

### 5.5 Quiz
- Question set = `selectQuizForPath(path)` (§7.3), fixed order (do not
  shuffle question order — shuffle MC option order only, so "no trick
  options" stays true and correctness stays traceable while still
  avoiding rote memorization of option position).
- One question per screen, progress bar = phase 2 of 2 (visually
  distinct from the journey progress bar, e.g. different fill color).
- On submit of the final question, compute `score` and route to RESULTS.
- **Pass rule**: pass if `score >= questions.length - 1` (i.e. at most
  one wrong answer allowed). This satisfies the "≥85%" requirement for
  both quiz lengths:
  - FTE: 12 questions → need ≥ 11 correct (91.7%)
  - Intern: 8 questions → need ≥ 7 correct (87.5%)
  A `match` question counts as ONE correct/incorrect unit — correct only
  if every pair in it is matched correctly.
- **Fail rule**: show a brief, kind Swifty message (no shaming copy —
  e.g. "So close! Let's take another lap through the basics."), single
  CTA "Review and retry". On tap, reset `journeyIndex` to 0, clear all
  `quizAnswers` and `score`, and set `screen = 'journey'` — **do not**
  clear `path` (role/gender stay exactly as selected). The system
  already knows who this person is; there is no reason to make them
  re-answer Filter 1/2 on every retry. Increment a separate, never-reset
  `attemptNumber` counter (starts at 1) — this travels with the logging
  payload in §11 so HR can see how many tries someone needed, but it is
  NOT shown to the user and does not affect gameplay.

### 5.6 Results → Certificate
On pass, if `certificateName` is empty, show a one-field name input
("What's your name for the certificate?") before rendering the
certificate. Certificate content spec: §7.5.

---

## 6. Story card content (verified, by module)

Cards are written in Swifty's short, friendly narrating voice — 1 to 3
sentences. `pose` suggestions given; adjust only within the 4 supplied
poses (welcome / default / thinking / curious).

**Target pacing**: ~25–30 seconds per card. This gives ~24 cards for the
full FTE journey (~12 min) and ~11 cards for Intern (~5–6 min), both
comfortably inside the ~13-minute journey budget.

### Module: Welcome (all paths — 2 cards)
1. *(pose: welcome)* "Hi, I'm Swifty! 👋 Welcome to ConveGenius — the team behind SwiftChat, reaching 150M+ learners across India. Our mission: reach the unreached, and make quality learning a right, not a privilege."
2. *(pose: default)* "I'll walk you through everything that matters for your role. Tap through, then a short quiz, then your completion certificate. Ready?"

### Module: Attendance (all paths — 2 cards)
3. *(pose: default)* "First things first: download the Keka app. Clock in when you start work and clock out when you're done — every single day."
4. *(pose: thinking)* "Miss a day? You can regularize it on Keka. But heads up — if a day's left blank by month-end, it gets auto-marked as Earned Leave or Leave Without Pay."

### Module: Holidays (all paths — 1 card)
5. *(pose: default)* "ConveGenius follows a January–December calendar year with 10 fixed holidays. Your HR calendar on Keka has the full list."

### Module: Leaves — Central FTE only (3 cards)
6. *(pose: default)* "As a Central FTE, you get 32 leaves a year: 15 Earned, 8 Sick, 9 Casual."
7. *(pose: thinking)* "Sick and Casual leave lapse at year-end — no carry forward. But Earned Leave is different: you can carry forward up to 10 days a year, capped at 45 days (under 5 years) or 60 days (5+ years)."
8. *(pose: default)* "One more perk: if you leave the company, you can encash your unused Earned Leave at your last drawn basic pay."

### Module: Leaves — State FTE only (3 cards)
6. *(pose: default)* "As a State FTE, you get 27 leaves a year: 15 Earned, 6 Sick, 6 Casual."
7. *(pose: thinking)* "Sick and Casual leave lapse at year-end — no carry forward. Earned Leave carries forward up to 10 days a year, capped at 45 days (under 5 years) or 60 days (5+ years)."
8. *(pose: default)* "All leave — any type — can be taken in half-day or full-day chunks, and always needs your manager's approval, or it counts as unauthorized absence."

### Module: Leaves — Intern only (1 card)
6. *(pose: default)* "As an Intern, you get 1 leave per month, pro-rata, in half-day or full-day increments. Simple as that!"

### Module: Parental — FTE only, gender-branched (2 cards)
7/9. *(pose: default, shown to Woman only)* "Expecting? You're entitled to 26 weeks of paid maternity leave. Just give at least 10 weeks' notice before your due date so we can plan ahead."
7/9. *(pose: default, shown to Man only)* "New dad? You get 14 working days of paternity leave, to be used within 2 months of your child's birth. It can't be carried forward, so plan the timing."
8/10. *(pose: default, shown to ALL FTE regardless of gender)* "Adopting? Either parent can take 12 working weeks to bond with their new family member."

### Module: Finances — FTE only (2 cards)
9/11. *(pose: default)* "Head to 'My Finances' on Keka to check your salary breakup matches your offer letter."
10/12. *(pose: thinking)* "Pick your tax regime: New regime = no declarations needed. Old regime = declare your taxes and upload proofs before the deadline Keka shows you. Payroll runs monthly, salary lands on the 5th."

### Module: Insurance — FTE only (1 card)
11/13. *(pose: default)* "You're covered! Health insurance includes you, your spouse, and up to 4 dependent children. Band 1–6 = ₹5 lakh cover, Band 7 and above = ₹10 lakh."

### Module: Probation — FTE only (1 card)
12/14. *(pose: default)* "You're on probation for a period set in your offer letter (it varies by department). Pass it, and you'll get an automatic confirmation email. If it needs extending, your manager will tell you at least a week ahead."

### Module: POSH (all paths — 2 cards)
13/15. *(pose: default)* "ConveGenius is a POSH-compliant workplace — zero tolerance for sexual harassment, and everyone has the right to work with dignity."
14/16. *(pose: thinking)* "If you ever need to raise a concern, reach out to reachout@convegenius.ai or any Internal Committee member — Harshali Dalal (President), Tanvi Butalia, Sri Nitya A, Utsav Thapliyal, Nitin Jain, or Anadya Girotra."

### Module: Child Protection (all paths — 1 card)
15/17. *(pose: default)* "Every child who comes into contact with ConveGenius deserves safety and dignity. We hold a zero-tolerance stance on abuse, exploitation, and neglect — for all our stakeholders."

### Module: On the Move — FTE only (2 cards)
16/18. *(pose: default)* "Traveling for work? Book via the Domestic Travel Policy on Keka — accommodation priority is Guest House first, then Service Apartment, then Hotel, and food's covered too (just skip the alcohol/tobacco on the bill)."
17/19. *(pose: default)* "Local commute for official work? Claim it: ₹10/km by four-wheeler, ₹5/km by two-wheeler, or actuals for cabs/autos — all through Keka within 30 days of the expense."

### Module: Referral — FTE only (2 cards)
18/20. *(pose: default)* "Know someone great? Refer them through Keka. If they join and complete 90 days, you get a referral award — and so do they get a great place to work!"
19/21. *(pose: curious)* "Bonus: our 'CG Hire Champs' campaign stacks up your total referral earnings toward mega prizes — from a digital watch all the way up to a Harley Davidson!"

### Module: Appraisal — FTE only (1 card)
20/22. *(pose: default)* "Appraisals run on the Financial Year cycle. To be eligible for this cycle, you'll need to have joined before 30th September."

### Module: Helpdesk (all paths — 1 card)
21/23. *(pose: default)* "Got questions later? Raise a ticket anytime with Team HR, Team Admin, or Team Finance."

### Module: Wrap-up (all paths — 1 card)
22/24. *(pose: welcome)* "That's everything for your path! Time for a quick quiz to lock it in — you've got this."

---

## 7. Quiz

### 7.1 Rules
- No trick options; every question is answerable directly from the
  journey content the user just saw.
- Options are plausible-but-clearly-different, not near-duplicates.
- MC option *order* may be shuffled at render time; the question bank
  below lists them in a fixed reference order with the correct answer
  marked — shuffle a copy, never mutate the source order.

### 7.2 Full question bank (tagged with appliesTo)

**MC — generic (all FTE, both roles)**
- Q-MC-1 `[Attendance]` "What app do you use to clock in and out every day?"
  Options: Slack / **Keka** / Zoom / Notion → correct: Keka
  appliesTo: roles [central, state, intern]
- Q-MC-2 `[Attendance]` "If you forget to mark attendance and don't regularize it by month-end, what happens?"
  Options: Nothing / **It's auto-marked as Earned Leave or Leave Without Pay** / You get a bonus day / HR calls your manager → correct: option 2
  appliesTo: roles [central, state, intern]
- Q-MC-3 `[Holidays]` "How many fixed holidays does ConveGenius observe each calendar year?"
  Options: 8 / **10** / 12 / 15 → correct: 10
  appliesTo: roles [central, state, intern]
- Q-MC-4 `[POSH]` "Which email should you write to for a POSH concern?"
  Options: hrconnect@convegenius.ai / **reachout@convegenius.ai** / posh@convegenius.ai / admin@convegenius.ai → correct: reachout@convegenius.ai
  appliesTo: roles [central, state, intern]
- Q-MC-5 `[Helpdesk]` "Which teams can you raise a query ticket with?"
  Options: **HR, Admin, and Finance** / Only HR / Only IT / Only your manager → correct: option 1
  appliesTo: roles [central, state, intern]

**MC — FTE only**
- Q-MC-6 `[Insurance]` "What's the insured amount for employees in Band 7 and above?"
  Options: ₹2 lakh / ₹5 lakh / **₹10 lakh** / ₹15 lakh → correct: ₹10 lakh
  appliesTo: roles [central, state]
- Q-MC-7 `[Appraisal]` "You must have joined before which date to be eligible for the current Financial Year appraisal cycle?"
  Options: 31st March / 30th June / **30th September** / 31st December → correct: 30th September
  appliesTo: roles [central, state]

**MC — role-specific leave totals (ONE of these two is used, per role)**
- Q-MC-8a `[Leaves]` "How many total annual leaves does a Central FTE get?"
  Options: 27 / 30 / **32** / 35 → correct: 32
  appliesTo: roles [central]
- Q-MC-8b `[Leaves]` "How many total annual leaves does a State FTE get?"
  Options: 24 / **27** / 30 / 32 → correct: 27
  appliesTo: roles [state]

**MC — Intern only**
- Q-MC-9 `[Leaves]` "How many leaves does an Intern get per month?"
  Options: 0.5 / **1** / 2 / 3 → correct: 1
  appliesTo: roles [intern]

**TF — generic**
- Q-TF-1 `[Child Protection]` "ConveGenius has a zero-tolerance approach to child abuse and exploitation." → **True**
  appliesTo: roles [central, state, intern]
- Q-TF-2 `[Holidays]` "ConveGenius follows a January–December calendar year." → **True**
  appliesTo: roles [central, state, intern]

**TF — FTE only**
- Q-TF-3 `[Leaves]` "Casual Leave and Sick Leave can be carried forward to the next year." → **False** (they lapse)
  appliesTo: roles [central, state]
- Q-TF-4 `[Adoption]` "Adoption leave (12 weeks) is available only to women employees." → **False** (either parent)
  appliesTo: roles [central, state]

**TF — gender-specific (ONE of these two is used, per gender)**
- Q-TF-5a `[Parental]` "Female employees should give at least 10 weeks' notice before their expected delivery date." → **True**
  appliesTo: roles [central, state], genders [woman]
- Q-TF-5b `[Parental]` "Paternity leave can be carried forward to the next year if unused." → **False** (must be used within 2 months, no carry forward)
  appliesTo: roles [central, state], genders [man]

**TF — Intern only**
- Q-TF-6 `[Helpdesk]` "You can raise queries with HR, Admin, or Finance teams via a ticket." → **True**
  appliesTo: roles [intern]
- Q-TF-7 `[Attendance]` "Interns also need to mark attendance on Keka." → **True**
  appliesTo: roles [intern]

**Match — role-specific (ONE of these three is used, per role)**
- Q-MATCH-central `[Leaves]` "Match each leave type to its annual count (Central FTE)."
  Pairs: Earned Leave ↔ 15 days, Sick Leave ↔ 8 days, Casual Leave ↔ 9 days
  appliesTo: roles [central]
- Q-MATCH-state `[Leaves]` "Match each leave type to its annual count (State FTE)."
  Pairs: Earned Leave ↔ 15 days, Sick Leave ↔ 6 days, Casual Leave ↔ 6 days
  appliesTo: roles [state]
- Q-MATCH-intern `[Overview]` "Match each topic to what it covers."
  Pairs: Keka ↔ Marking your daily attendance, POSH ↔ Protection from workplace harassment, Child Protection ↔ Zero-tolerance for child abuse
  appliesTo: roles [intern]

### 7.3 Assembly per path — `selectQuizForPath(path)`

Use this table exactly. It is the final, correct composition — do not
re-derive it from `appliesTo` filtering alone (see implementation note
below).

| Path | MC — 7 (FTE) / 5 (Intern) | TF — 4 (FTE) / 2 (Intern) | Match — 1 | Total |
|---|---|---|---|---|
| Central + Woman | MC-1, MC-2, MC-3, MC-4, MC-6, MC-7, MC-8a | TF-1, TF-2, TF-3, TF-5a | MATCH-central | 12 |
| Central + Man | MC-1, MC-2, MC-3, MC-4, MC-6, MC-7, MC-8a | TF-1, TF-2, TF-3, TF-5b | MATCH-central | 12 |
| State + Woman | MC-1, MC-2, MC-3, MC-4, MC-6, MC-7, MC-8b | TF-1, TF-2, TF-3, TF-5a | MATCH-state | 12 |
| State + Man | MC-1, MC-2, MC-3, MC-4, MC-6, MC-7, MC-8b | TF-1, TF-2, TF-3, TF-5b | MATCH-state | 12 |
| Intern | MC-1, MC-2, MC-3, MC-4, MC-9 | TF-1, TF-6 | MATCH-intern | 8 |

Notes on what's deliberately left out of the fixed set (still fine —
not every journey card needs a matching quiz item): TF-4 (Adoption) and
TF-7 (Intern attendance) are not used, to keep counts exact at 12 and 8.
Adoption content is still taught in the journey; it's just not one of
the 12 quiz items.

> Implementation note: build `selectQuizForPath()` as an explicit
> lookup (a small switch/object keyed by `${role}-${gender ?? 'none'}`)
> returning a fixed, named list of question IDs per the table above —
> do NOT derive it via generic `appliesTo` filtering alone, because the
> role-specific MC/Match substitution (8a vs 8b, central vs state match)
> needs explicit selection, not just inclusion filtering. Use
> `visibleTo()` only to double check no wrong-path item slipped in
> (assert in dev mode that every selected question passes `visibleTo`).

### 7.4 Scoring
- Each MC/TF question = 1 point if correct.
- Each Match question = 1 point only if ALL pairs correct, else 0.
- Pass threshold: `score >= total - 1` (miss at most one). See §5.5 for
  the worked numbers (11/12 FTE, 7/8 Intern).

### 7.5 Certificate content
- Learner name (typed in by user post-quiz)
- Path label: "Central FTE" / "State FTE" / "Intern" (gender is not
  shown on the certificate — it was only used for content targeting)
- Score: "X / Y correct (Z%)"
- Date completed (system date, formatted e.g. "5 August 2026")
- Certificate ID for HR verification: `SWFTY-{ROLE}-{YYYYMMDD}-{4 random
  alphanumeric chars}`, e.g. `SWFTY-CTL-20260805-K3P9`. Role codes: CTL
  (central), STT (state), INT (intern).
- Footer line: "Completed via SwiftyStart · ConveGenius Induction"

---

## 8. Visual design tokens

```css
--cg-indigo: #4B45A8;   /* primary, headers, CTAs */
--cg-teal: #7DCFC9;     /* accent, progress bar fill, success states */
--cg-navy: #232048;     /* body text — a dark navy derived from the indigo family, NOT pure black */
--cg-cream: #FBF0E4;    /* page background */
--cg-lilac: #E9E5F7;    /* card backgrounds */
--cg-white: #FFFFFF;    /* base surfaces */
```

- Corner radius: cards `rounded-3xl` (24px), buttons `rounded-full` or `rounded-2xl`.
- Shadows: soft, colored (indigo-tinted), never harsh black — e.g. `shadow-[0_8px_24px_rgba(75,69,168,0.15)]`.
- Typography: a rounded/friendly display font for headers (e.g. Baloo 2
  or Fredoka via Google Fonts) + a clean body font (Inter). Load via
  `@fontsource` packages, not a CDN `<link>`, so it works offline in dev.
- Progress bar: teal fill on a lilac track, animated width transition.
- Buttons: gradient indigo→teal on primary CTA, subtle scale-down on tap
  (`active:scale-95`) for tactile feedback.
- Swifty: rendered at a consistent size across screens (e.g. 140–200px),
  swap pose via crossfade (Framer Motion `AnimatePresence`), never a
  hard cut.
- Confetti burst (canvas-confetti) on the Results-pass screen only.

---

## 9. Suggested folder structure

```
swiftystart/
├─ public/
│  └─ swifty/               (the 4 provided PNGs: welcome, default, thinking, curious)
├─ src/
│  ├─ data/
│  │  ├─ content.ts          (StoryCard[] from §6)
│  │  └─ quiz.ts              (QuizQuestion[] from §7.2 + selectQuizForPath from §7.3)
│  ├─ logic/
│  │  ├─ filter.ts            (visibleTo, §3.4)
│  │  └─ scoring.ts           (§7.4)
│  ├─ components/
│  │  ├─ SwiftyAvatar.tsx
│  │  ├─ ProgressBar.tsx
│  │  ├─ StoryCardView.tsx
│  │  ├─ questions/
│  │  │  ├─ McQuestionView.tsx
│  │  │  ├─ TfQuestionView.tsx
│  │  │  └─ MatchQuestionView.tsx
│  │  └─ CertificateCard.tsx
│  ├─ screens/
│  │  ├─ SplashScreen.tsx
│  │  ├─ Filter1Screen.tsx
│  │  ├─ Filter2Screen.tsx
│  │  ├─ JourneyScreen.tsx
│  │  ├─ QuizScreen.tsx
│  │  ├─ ResultsScreen.tsx
│  │  └─ CertificateScreen.tsx
│  ├─ App.tsx                 (Screen state machine + UserPath state)
│  ├─ types.ts                (§3.1–3.3 types)
│  └─ main.tsx
├─ CLAUDE.md
└─ docs/GAME_SPEC.md           (this file)
```

---

## 10. Results logging (HR visibility)

### 10.1 The requirement
Every quiz attempt (pass or fail) needs to land somewhere persistent
that exactly two people can see, where "who can see it" is controlled
by email address and changeable at any time without touching code.

### 10.2 Recommended approach: Google Sheets + Apps Script

This is the right tool here, not a corner-cut. It maps onto the
requirement with zero custom access-control code:

- **"Accumulated somewhere"** → every submission becomes a new row in
  a Google Sheet.
- **"Visible to 2 people, changeable via email"** → Google Sheets'
  native **Share** dialog *is* the access control. Add or remove a
  viewer/editor by typing their email address, at any time, with no
  redeploy. This is exactly the mechanism being asked for — building a
  custom login system to replicate it would be solving an already-
  solved problem.
- **No backend to host, deploy, or pay for.** Apps Script runs on
  Google's infrastructure for free at this volume.
- **HR gets a spreadsheet**, which is the format they'll actually want
  to filter/sort/export from — not a raw database table.

**When to reach for something heavier instead:** if you outgrow "a
couple of admins checking a sheet" — e.g. you want a live dashboard,
role-based access for a growing HR team, or query/analytics on
thousands of rows — migrate to **Supabase** (Postgres + row-level
security + a real admin UI, still free at small scale). Don't build
that now; it's roughly 3-4x the setup time for a benefit you don't need
yet with 2 viewers.

### 10.3 Data schema (one row per quiz submission — pass or fail)

| Column | Example | Notes |
|---|---|---|
| Timestamp | 2026-08-05T14:32:00Z | server-side `new Date().toISOString()` at receipt |
| Certificate ID | SWFTY-CTL-20260805-K3P9 | only present on a Pass row (§7.5); blank on Fail |
| Name | Priya Sharma | as typed by the user |
| Role | Central FTE | do NOT log gender — it was only ever used for content targeting, not identity, and there's no reason to store it |
| Score | 11/12 | |
| Percentage | 91.7% | |
| Result | Pass / Fail | |
| Attempt number | 2 | increments per fail within one session, per §5.5 |

### 10.4 Apps Script (paste into Extensions → Apps Script on the Sheet)

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);

  // simple shared-secret check — not real security, just spam filtering
  if (data.token !== 'REPLACE_WITH_A_RANDOM_STRING') {
    return ContentService.createTextOutput('unauthorized');
  }

  sheet.appendRow([
    new Date().toISOString(),
    data.certificateId || '',
    data.name,
    data.role,
    data.score,
    data.percentage,
    data.result,
    data.attemptNumber,
  ]);

  return ContentService.createTextOutput('ok');
}
```

Deploy: **Deploy → New deployment → type: Web app → Execute as: Me →
Who has access: Anyone** → copy the resulting `/exec` URL.

### 10.5 Client call (fires on every quiz submission)

```typescript
// src/logic/logResult.ts
export async function logResult(payload: {
  certificateId?: string;
  name: string;
  role: string;
  score: string;
  percentage: string;
  result: 'Pass' | 'Fail';
  attemptNumber: number;
}) {
  try {
    await fetch(import.meta.env.VITE_LOG_ENDPOINT, {
      method: 'POST',
      // text/plain avoids a CORS preflight that Apps Script doesn't handle well
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...payload, token: import.meta.env.VITE_LOG_TOKEN }),
    });
  } catch (err) {
    console.error('Result logging failed (non-blocking):', err);
    // deliberately no rethrow — logging must never block the UI
  }
}
```

`.env` (never commit this file — add it to `.gitignore`):
```
VITE_LOG_ENDPOINT=https://script.google.com/macros/s/XXXXX/exec
VITE_LOG_TOKEN=some-random-string-matching-the-apps-script-constant
```

### 10.6 Setup steps (5 minutes, no code)
1. Create a new Google Sheet, add the 8 column headers from §10.3 as row 1.
2. Extensions → Apps Script, paste §10.4, replace the token string.
3. Deploy as web app (see above), copy the `/exec` URL into `.env`.
4. Sheet → **Share** → add the 2 people's emails as Viewer (or Editor if they need to annotate/filter live).
5. To change who can see it later: reopen Share, add/remove emails. That's the entire "changeable via email" mechanism — no code touched.

### 10.7 Privacy note
Worth flagging, not blocking: you're logging employee names and quiz
performance to a spreadsheet two people can see indefinitely. If
ConveGenius has a data-retention or internal-privacy policy for
performance-adjacent HR data, it's worth a 5-minute check that this is
fine — it almost certainly is for an internal induction tool, but it's
cheap to confirm now versus after 200 rows exist.

---

## 11. Edge cases & acceptance checklist

- [ ] Selecting Intern in Filter 1 skips Filter 2 entirely; `gender` stays `null` for the whole session.
- [ ] No Central content/numbers ever renders for a State user, and vice versa (spot check the leave-count card and quiz question).
- [ ] A man never sees the maternity card or Q-TF-5a; a woman never sees the paternity card or Q-TF-5b. Both see the adoption card.
- [ ] An intern never sees any of: parental, finances, insurance, probation, travel, referral, appraisal cards or questions.
- [ ] Journey "Back" button works and doesn't lose progress; it's disabled on the first card.
- [ ] Quiz drag-to-match works with touch (test on an actual phone or Chrome DevTools touch emulation), not just mouse drag.
- [ ] Failing the quiz clears journey position, all quiz answers, and score — but role and gender are untouched, and the user lands back on the *first* journey card, not a filter screen. Verify by failing once, noting the role shown, and confirming after "Review and retry" the same role's content reappears with no filter prompt.
- [ ] Certificate cannot be reached without passing (guard the route).
- [ ] Nothing is written to localStorage/sessionStorage/cookies — check DevTools Application tab.
- [ ] Works at 375px width with no horizontal scroll.
- [ ] Total FTE quiz = exactly 12 questions; total Intern quiz = exactly 8. Verify counts in a dev-only console assertion.
- [ ] A logging call fires on both Pass and Fail (check the Sheet after a deliberate fail), and a killed/blocked network request never prevents the Results or Certificate screen from rendering.

